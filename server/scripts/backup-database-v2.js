#!/usr/bin/env node

/**
 * Database Backup Script for AI Readiness Assessment Platform
 * Version 2.0 - Security Hardened with Race Condition Fixes
 * 
 * This script creates automated PostgreSQL backups using pg_dump.
 * Designed to be cron-compatible for scheduled backups.
 * 
 * All critical security vulnerabilities addressed:
 * - Command injection prevention via spawn + argument arrays
 * - Buffer overflow prevention via streaming
 * - Race condition fixes with Promise.all synchronization
 * - SSL configuration handling for Neon compatibility
 * - Secure file permissions (0600/0700)
 */

const { spawn } = require('child_process');
const fs = require('fs').promises;
const path = require('path');
const { URL } = require('url');
const { createWriteStream } = require('fs');
const { createGzip } = require('zlib');
const { pipeline } = require('stream/promises');

// Configuration
const CONFIG = {
  outputDir: process.env.BACKUP_OUTPUT_DIR || './backups',
  retainDays: parseInt(process.env.BACKUP_RETAIN_DAYS) || 30,
  format: 'sql',
  compress: false,
  verbose: false
};

/**
 * Parse command line arguments
 */
function parseArguments() {
  const args = process.argv.slice(2);
  const config = { ...CONFIG };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    
    switch (arg) {
      case '--output-dir':
        config.outputDir = args[++i];
        break;
      case '--compress':
        config.compress = true;
        break;
      case '--retain-days':
        config.retainDays = parseInt(args[++i]);
        break;
      case '--format':
        const format = args[++i];
        if (['sql', 'custom', 'tar'].includes(format)) {
          config.format = format;
        } else {
          console.error(`Invalid format: ${format}. Use sql, custom, or tar.`);
          process.exit(1);
        }
        break;
      case '--verbose':
        config.verbose = true;
        break;
      case '--help':
        console.log(getHelpText());
        process.exit(0);
        break;
      default:
        if (arg.startsWith('--')) {
          console.error(`Unknown option: ${arg}`);
          process.exit(1);
        }
    }
  }

  return config;
}

/**
 * Parse DATABASE_URL into connection components
 */
function parseDatabaseUrl(databaseUrl) {
  try {
    const url = new URL(databaseUrl);
    const sslmode = url.searchParams.get('sslmode');
    
    return {
      host: url.hostname,
      port: url.port || '5432',
      database: url.pathname.slice(1), // Remove leading /
      username: url.username,
      password: url.password,
      sslmode: sslmode
    };
  } catch (error) {
    throw new Error(`Invalid DATABASE_URL format: ${error.message}`);
  }
}

/**
 * Log message with timestamp
 */
function log(message, verbose = false) {
  if (!verbose || CONFIG.verbose) {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${message}`);
  }
}

/**
 * Execute command with spawn (safe from shell injection)
 */
function spawnCommand(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { ...options, shell: false });
    
    let stdout = '';
    let stderr = '';
    
    child.stdout?.on('data', (data) => {
      stdout += data.toString();
    });
    
    child.stderr?.on('data', (data) => {
      stderr += data.toString();
    });
    
    child.on('close', (code) => {
      if (code === 0) {
        resolve({ stdout, stderr, code });
      } else {
        reject(new Error(`Command failed with exit code ${code}\\nStderr: ${stderr}`));
      }
    });
    
    child.on('error', (error) => {
      reject(new Error(`Failed to spawn command: ${error.message}`));
    });
  });
}

/**
 * Ensure backup directory exists with secure permissions
 */
async function ensureBackupDirectory(outputDir) {
  try {
    await fs.access(outputDir);
    log(`Backup directory exists: ${outputDir}`, true);
    
    // Ensure secure directory permissions
    await fs.chmod(outputDir, 0o700);
  } catch (error) {
    log(`Creating backup directory: ${outputDir}`);
    await fs.mkdir(outputDir, { recursive: true, mode: 0o700 });
  }
}

/**
 * Generate backup filename
 */
function generateBackupFilename(dbName, format, compress) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
  const baseFilename = `${dbName}-backup-${timestamp}`;
  
  let extension;
  switch (format) {
    case 'sql':
      extension = '.sql';
      break;
    case 'custom':
      extension = '.dump';
      break;
    case 'tar':
      extension = '.tar';
      break;
    default:
      extension = '.sql';
  }
  
  return `${baseFilename}${extension}${compress ? '.gz' : ''}`;
}

/**
 * Create database backup (SECURITY HARDENED VERSION)
 */
async function createBackup(config) {
  const { DATABASE_URL } = process.env;
  
  if (!DATABASE_URL) {
    throw new Error('DATABASE_URL environment variable is required');
  }

  const dbConfig = parseDatabaseUrl(DATABASE_URL);
  const filename = generateBackupFilename(dbConfig.database, config.format, config.compress);
  const backupPath = path.join(config.outputDir, filename);

  log(`Starting backup of database: ${dbConfig.database}`);
  log(`Backup file: ${backupPath}`, true);

  // Build pg_dump arguments array (safe from injection)
  const pgDumpArgs = [
    '--host', dbConfig.host,
    '--port', dbConfig.port,
    '--username', dbConfig.username,
    '--dbname', dbConfig.database,
    '--no-password', // Use PGPASSWORD env var
    '--clean', // Include DROP statements
    '--if-exists', // Safe DROP statements
    '--create' // Include CREATE DATABASE
  ];
  
  // Format options
  switch (config.format) {
    case 'custom':
      pgDumpArgs.push('--format=custom');
      break;
    case 'tar':
      pgDumpArgs.push('--format=tar');
      break;
    default:
      pgDumpArgs.push('--format=plain');
  }
  
  // Only add verbose flag if explicitly requested (prevents buffer issues)
  if (config.verbose) {
    pgDumpArgs.push('--verbose');
  }
  
  // Set environment variables for pg_dump
  const env = {
    ...process.env,
    PGPASSWORD: dbConfig.password
  };
  
  // Add SSL configuration exactly as specified (no downgrade)
  if (dbConfig.sslmode) {
    env.PGSSLMODE = dbConfig.sslmode;
  }

  log(`Executing pg_dump...`, true);
  log(`Args: ${JSON.stringify(pgDumpArgs.map(arg => arg.includes('password') ? '***' : arg))}`, true);

  try {
    if (config.format === 'sql' && !config.compress) {
      // For SQL format without compression, use --file option
      pgDumpArgs.push('--file', backupPath);
      const result = await spawnCommand('pg_dump', pgDumpArgs, { env });
      
      if (config.verbose && result.stderr) {
        log(`pg_dump output: ${result.stderr}`, true);
      }
    } else {
      // For other formats or compression, handle streaming (RACE CONDITION FIXED)
      const pgDumpProcess = spawn('pg_dump', pgDumpArgs, { env, shell: false });
      
      let stderr = '';
      
      // Set up stderr capture IMMEDIATELY to avoid race conditions
      pgDumpProcess.stderr.on('data', (data) => {
        stderr += data.toString();
      });
      
      // Create process exit promise IMMEDIATELY before any I/O
      const processExitPromise = new Promise((resolve, reject) => {
        pgDumpProcess.on('close', (code) => {
          if (code === 0) {
            resolve();
          } else {
            reject(new Error(`pg_dump failed with exit code ${code}\\nStderr: ${stderr}`));
          }
        });
        
        pgDumpProcess.on('error', (error) => {
          reject(new Error(`Failed to execute pg_dump: ${error.message}`));
        });
      });
      
      // Set up output pipeline
      let pipelinePromise;
      if (config.compress) {
        // Create gzip compression pipeline
        const gzipStream = createGzip();
        const outputStream = createWriteStream(backupPath);
        
        pipelinePromise = pipeline(
          pgDumpProcess.stdout,
          gzipStream,
          outputStream
        );
      } else {
        // Direct file output
        const outputStream = createWriteStream(backupPath);
        pipelinePromise = pipeline(pgDumpProcess.stdout, outputStream);
      }
      
      try {
        // Wait for BOTH pipeline and process to complete (CRITICAL FIX)
        await Promise.all([pipelinePromise, processExitPromise]);
        
        // Log verbose output only after successful completion
        if (config.verbose && stderr) {
          log(`pg_dump output: ${stderr}`, true);
        }
      } catch (error) {
        // Kill the process if still running to avoid zombies
        if (!pgDumpProcess.killed) {
          pgDumpProcess.kill('SIGTERM');
        }
        throw error;
      }
    }
    
    // Verify backup file was created and set secure permissions
    const stats = await fs.stat(backupPath);
    const sizeInMB = (stats.size / (1024 * 1024)).toFixed(2);
    
    // Set secure file permissions (owner read/write only)
    await fs.chmod(backupPath, 0o600);
    
    log(`✅ Backup completed successfully!`);
    log(`   File: ${backupPath}`);
    log(`   Size: ${sizeInMB} MB`);
    
    return backupPath;
    
  } catch (error) {
    // Clean up failed backup file
    try {
      await fs.unlink(backupPath);
    } catch (cleanupError) {
      // Ignore cleanup errors
    }
    
    throw new Error(`Backup failed: ${error.message}`);
  }
}

/**
 * Clean up old backups based on retention policy (SECURE PATTERN MATCHING)
 */
async function cleanupOldBackups(outputDir, retainDays) {
  if (retainDays <= 0) {
    log('Backup cleanup disabled (retain-days <= 0)', true);
    return;
  }

  log(`Cleaning up backups older than ${retainDays} days...`, true);
  
  try {
    const files = await fs.readdir(outputDir);
    const cutoffDate = new Date(Date.now() - (retainDays * 24 * 60 * 60 * 1000));
    
    // Strict backup file pattern to avoid deleting unrelated files (FIXED PATTERN)
    const backupPattern = /^[\w-]+-backup-\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2}\.(sql(\.gz)?|dump(\.gz)?|tar(\.gz)?)$/;
    
    let deletedCount = 0;
    let totalSize = 0;
    
    for (const file of files) {
      // Only process files that match strict backup naming pattern
      if (!backupPattern.test(file)) {
        continue;
      }
      
      const filePath = path.join(outputDir, file);
      const stats = await fs.stat(filePath);
      
      if (stats.mtime < cutoffDate) {
        totalSize += stats.size;
        await fs.unlink(filePath);
        deletedCount++;
        log(`Deleted old backup: ${file}`, true);
      }
    }
    
    if (deletedCount > 0) {
      const sizeMB = (totalSize / (1024 * 1024)).toFixed(2);
      log(`🗑️  Cleaned up ${deletedCount} old backup(s), freed ${sizeMB} MB`);
    } else {
      log('No old backups to clean up', true);
    }
    
  } catch (error) {
    log(`Warning: Failed to cleanup old backups: ${error.message}`);
  }
}

/**
 * Validate prerequisites
 */
async function validatePrerequisites() {
  try {
    await spawnCommand('pg_dump', ['--version']);
    log('✅ pg_dump is available', true);
  } catch (error) {
    throw new Error('pg_dump is not installed or not in PATH. Please install PostgreSQL client tools.');
  }
}

/**
 * Get help text
 */
function getHelpText() {
  return `
Database Backup Script v2.0 - Security Hardened

USAGE:
  node server/scripts/backup-database-v2.js [OPTIONS]

SECURITY FEATURES:
  ✅ Command injection prevention via spawn + argument arrays
  ✅ Buffer overflow prevention via streaming  
  ✅ Race condition fixes with Promise.all synchronization
  ✅ SSL configuration handling for Neon compatibility
  ✅ Secure file permissions (0600/0700)

OPTIONS:
  --output-dir <path>   Backup output directory (default: ./backups)
  --compress            Compress backup with gzip
  --retain-days <days>  Days to retain old backups (default: 30, 0 = disable cleanup)
  --format <format>     Backup format: sql, custom, tar (default: sql)
  --verbose             Enable verbose logging
  --help                Show this help message

EXAMPLES:
  # Secure daily backup
  node server/scripts/backup-database-v2.js --compress

  # Weekly backup with 90-day retention  
  node server/scripts/backup-database-v2.js --compress --retain-days 90
`;
}

/**
 * Main function
 */
async function main() {
  try {
    // Parse configuration
    const config = parseArguments();
    Object.assign(CONFIG, config);
    
    log('🚀 Starting database backup process...');
    log(`Configuration: ${JSON.stringify(CONFIG, null, 2)}`, true);
    
    // Validate prerequisites
    await validatePrerequisites();
    
    // Ensure backup directory exists
    await ensureBackupDirectory(CONFIG.outputDir);
    
    // Create backup
    const backupPath = await createBackup(CONFIG);
    
    // Cleanup old backups
    await cleanupOldBackups(CONFIG.outputDir, CONFIG.retainDays);
    
    log('✅ Backup process completed successfully!');
    
  } catch (error) {
    log(`❌ Backup failed: ${error.message}`);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = {
  createBackup,
  cleanupOldBackups,
  parseDatabaseUrl,
  CONFIG
};