import { Router } from 'express';
import { promises as fs, constants as fsConstants } from 'fs';
import path from 'path';
import { spawn } from 'child_process';
import crypto from 'crypto';
import { backupScheduler } from '../ops/backup.scheduler';
import { authenticateAdmin, requireRole, auditLogger, csrfProtection } from '../auth/middleware';
import { AdminRole } from '@shared/schema';
import { logger } from '../logger';

const router = Router();

/**
 * POST /api/admin/backup/run - Manual backup trigger
 * Requires SuperAdmin role and logs the action
 */
router.post('/run', 
  authenticateAdmin, 
  requireRole(AdminRole.SUPER_ADMIN), 
  csrfProtection,
  auditLogger('manual_backup', 'backup'),
  async (req, res) => {
    try {
      logger.info(`Manual backup triggered by admin ${req.sessionData?.admin.email} (${req.sessionData?.admin.id})`);

      const result = await backupScheduler.executeBackup();
      
      if (result.success) {
        res.json({
          success: true,
          message: result.message,
          timestamp: new Date().toISOString()
        });
      } else {
        res.status(500).json({
          success: false,
          message: result.message,
          timestamp: new Date().toISOString()
        });
      }
    } catch (error) {
      logger.error('Error during manual backup:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to execute backup',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      });
    }
  }
);

/**
 * GET /api/admin/backup/list - List available backup files with metadata
 * Requires SuperAdmin role and logs the action
 */
router.get('/list',
  authenticateAdmin,
  requireRole(AdminRole.SUPER_ADMIN),
  auditLogger('list_backups', 'backup'),
  async (req, res) => {
    try {
      const backupDir = process.env.BACKUP_OUTPUT_DIR || process.env.BACKUP_DIR || './backups';
      
      // Ensure backup directory exists
      try {
        await fs.access(backupDir);
      } catch {
        // Directory doesn't exist, create it
        await fs.mkdir(backupDir, { recursive: true });
        return res.json({
          backups: [],
          total: 0,
          directory: backupDir
        });
      }

      const files = await fs.readdir(backupDir);
      
      // Filter for backup files using the same pattern as the backup script
      const backupPattern = /^[\w-]+-backup-\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2}\.(sql(\.gz)?|dump(\.gz)?|tar(\.gz)?)$/;
      const backupFiles = files.filter(file => backupPattern.test(file));
      
      // Get file metadata
      const backups = await Promise.all(
        backupFiles.map(async (filename) => {
          const filePath = path.join(backupDir, filename);
          const stats = await fs.stat(filePath);
          
          // Parse backup metadata from filename
          const matches = filename.match(/^([\w-]+)-backup-(\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2})\.(.*?)$/);
          const dbName = matches?.[1] || 'unknown';
          const timestamp = matches?.[2] || '';
          const extension = matches?.[3] || '';
          
          // Determine compression and format
          const isCompressed = extension.includes('.gz');
          const format = extension.includes('.sql') ? 'sql' : 
                        extension.includes('.dump') ? 'custom' : 
                        extension.includes('.tar') ? 'tar' : 'unknown';
          
          return {
            filename,
            database: dbName,
            timestamp: timestamp.replace(/T/, ' ').replace(/-/g, ':'),
            size: stats.size,
            sizeFormatted: formatFileSize(stats.size),
            format,
            compressed: isCompressed,
            created: stats.birthtime,
            modified: stats.mtime,
            path: filePath
          };
        })
      );

      // Sort by creation time (newest first)
      backups.sort((a, b) => b.created.getTime() - a.created.getTime());

      res.json({
        backups,
        total: backups.length,
        directory: backupDir,
        totalSize: backups.reduce((sum, backup) => sum + backup.size, 0),
        totalSizeFormatted: formatFileSize(backups.reduce((sum, backup) => sum + backup.size, 0))
      });

    } catch (error) {
      logger.error('Error listing backup files:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to list backup files',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
);

/**
 * GET /api/admin/backup/status - Get backup scheduler status
 * Requires SuperAdmin role
 */
router.get('/status',
  authenticateAdmin,
  requireRole(AdminRole.SUPER_ADMIN),
  async (req, res) => {
    try {
      const status = backupScheduler.getStatus();
      const backupDir = process.env.BACKUP_OUTPUT_DIR || process.env.BACKUP_DIR || './backups';
      
      // Check if backup directory exists and is writable
      let directoryStatus = 'unknown';
      try {
        await fs.access(backupDir, fsConstants.F_OK | fsConstants.W_OK);
        directoryStatus = 'accessible';
      } catch {
        directoryStatus = 'not_accessible';
      }

      // Get last backup information from backup files
      let lastRun = null;
      let backupCount = 0;
      try {
        const files = await fs.readdir(backupDir);
        const backupPattern = /^[\w-]+-backup-\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2}\.(sql(\.gz)?|dump(\.gz)?|tar(\.gz)?)$/;
        const backupFiles = files.filter(file => backupPattern.test(file));
        backupCount = backupFiles.length;
        
        if (backupFiles.length > 0) {
          // Get the most recent backup
          const backupsWithStats = await Promise.all(
            backupFiles.map(async (filename) => {
              const filePath = path.join(backupDir, filename);
              const stats = await fs.stat(filePath);
              return { filename, created: stats.birthtime };
            })
          );
          backupsWithStats.sort((a, b) => b.created.getTime() - a.created.getTime());
          lastRun = backupsWithStats[0].created.toISOString();
        }
      } catch {
        // If we can't read backup files, that's ok - just leave lastRun as null
      }

      // Calculate next run time if scheduler is running
      let nextRun = null;
      if (status.running && status.schedule) {
        try {
          // This is a simplified calculation - for production, you'd want a proper cron parser
          const cronExpression = process.env.BACKUP_CRON || '0 2 * * *';
          // For now, if it's daily at 2 AM, calculate next 2 AM
          if (cronExpression === '0 2 * * *') {
            const now = new Date();
            const tomorrow = new Date(now);
            tomorrow.setDate(tomorrow.getDate() + 1);
            tomorrow.setHours(2, 0, 0, 0);
            nextRun = tomorrow.toISOString();
          }
        } catch {
          // If calculation fails, leave nextRun as null
        }
      }

      res.json({
        // Frontend expects these fields under scheduler object
        scheduler: {
          ...status,
          lastRun,
          nextRun,
          status: status.running ? 'running' : 'stopped'
        },
        backupCount,
        environment: {
          nodeEnv: process.env.NODE_ENV,
          backupDir,
          directoryStatus,
          cronExpression: process.env.BACKUP_CRON || '0 2 * * *',
          retentionDays: process.env.BACKUP_RETENTION_DAYS || '30',
          timezone: process.env.TZ || 'UTC'
        },
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      logger.error('Error getting backup status:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get backup status',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
);

/**
 * POST /api/admin/backup/verify/:filename - Verify backup file integrity
 * Requires SuperAdmin role and logs the action
 */
router.post('/verify/:filename',
  authenticateAdmin,
  requireRole(AdminRole.SUPER_ADMIN),
  csrfProtection,
  auditLogger('verify_backup', 'backup'),
  async (req, res) => {
    try {
      const { filename } = req.params;
      const backupDir = process.env.BACKUP_OUTPUT_DIR || process.env.BACKUP_DIR || './backups';
      const filePath = path.join(backupDir, filename);

      // Security: Prevent path traversal
      if (!path.resolve(filePath).startsWith(path.resolve(backupDir))) {
        return res.status(400).json({
          success: false,
          message: 'Invalid file path'
        });
      }

      // Check if file exists
      try {
        await fs.access(filePath, fsConstants.F_OK);
      } catch {
        return res.status(404).json({
          success: false,
          message: 'Backup file not found'
        });
      }

      const stats = await fs.stat(filePath);
      
      // Generate file checksum for integrity verification
      const hash = crypto.createHash('sha256');
      const fileStream = await fs.readFile(filePath);
      hash.update(fileStream);
      const checksum = hash.digest('hex');

      // For compressed files, test gunzip if applicable
      let compressionValid = true;
      if (filename.endsWith('.gz')) {
        try {
          await new Promise<void>((resolve, reject) => {
            const gunzip = spawn('gunzip', ['-t', filePath]);
            gunzip.on('close', (code) => {
              if (code === 0) resolve();
              else reject(new Error(`Compression test failed with exit code ${code}`));
            });
            gunzip.on('error', reject);
          });
        } catch {
          compressionValid = false;
        }
      }

      // For SQL files, basic syntax validation
      let sqlValid = true;
      if (filename.includes('.sql')) {
        try {
          const content = fileStream.toString('utf8', 0, Math.min(1024, fileStream.length));
          // Basic SQL file validation - look for common SQL patterns
          const hasSqlPatterns = /^(--|\/\*|DROP|CREATE|INSERT|UPDATE|DELETE|SELECT)/mi.test(content);
          sqlValid = hasSqlPatterns;
        } catch {
          sqlValid = false;
        }
      }

      const verified = compressionValid && sqlValid && stats.size > 0;

      logger.info(`Backup verification for ${filename}: ${verified ? 'PASSED' : 'FAILED'}`, {
        file: filename,
        size: stats.size,
        checksum,
        compressionValid,
        sqlValid
      });

      res.json({
        success: true,
        verified,
        details: {
          checksum,
          size: stats.size,
          compressionValid,
          sqlValid,
          lastModified: stats.mtime.toISOString()
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('Error during backup verification:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to verify backup',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      });
    }
  }
);

/**
 * GET /api/admin/backup/download/:filename - Download backup file
 * Requires SuperAdmin role and logs the action
 */
router.get('/download/:filename',
  authenticateAdmin,
  requireRole(AdminRole.SUPER_ADMIN),
  auditLogger('download_backup', 'backup'),
  async (req, res) => {
    try {
      const { filename } = req.params;
      const backupDir = process.env.BACKUP_OUTPUT_DIR || process.env.BACKUP_DIR || './backups';
      const filePath = path.join(backupDir, filename);

      // Security: Prevent path traversal
      if (!path.resolve(filePath).startsWith(path.resolve(backupDir))) {
        return res.status(400).json({
          success: false,
          message: 'Invalid file path'
        });
      }

      // Check if file exists
      try {
        await fs.access(filePath, fsConstants.F_OK);
      } catch {
        return res.status(404).json({
          success: false,
          message: 'Backup file not found'
        });
      }

      const stats = await fs.stat(filePath);
      
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.setHeader('Content-Type', 'application/octet-stream');
      res.setHeader('Content-Length', stats.size.toString());

      logger.info(`Backup download initiated: ${filename} (${stats.size} bytes)`);
      
      // Stream the file to the response
      const fileStream = await fs.readFile(filePath);
      res.send(fileStream);

    } catch (error) {
      logger.error('Error during backup download:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to download backup',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
);

/**
 * POST /api/admin/backup/restore/:filename - Restore database from backup
 * Requires SuperAdmin role and logs the action
 * WARNING: This operation will overwrite the current database!
 */
router.post('/restore/:filename',
  authenticateAdmin,
  requireRole(AdminRole.SUPER_ADMIN),
  csrfProtection,
  auditLogger('restore_backup', 'backup'),
  async (req, res) => {
    try {
      const { filename } = req.params;
      const { confirmText } = req.body;
      
      // Require explicit confirmation
      if (confirmText !== 'RESTORE DATABASE') {
        return res.status(400).json({
          success: false,
          message: 'Confirmation text must be exactly "RESTORE DATABASE"'
        });
      }

      // Require explicit environment flag for restore operations (safety)
      if (process.env.ALLOW_DB_RESTORE !== 'true') {
        return res.status(403).json({
          success: false,
          message: 'Database restore operations are disabled. Set ALLOW_DB_RESTORE=true to enable.'
        });
      }

      const backupDir = process.env.BACKUP_OUTPUT_DIR || process.env.BACKUP_DIR || './backups';
      const filePath = path.join(backupDir, filename);

      // Security: Prevent path traversal
      if (!path.resolve(filePath).startsWith(path.resolve(backupDir))) {
        return res.status(400).json({
          success: false,
          message: 'Invalid file path'
        });
      }

      // Check if file exists
      try {
        await fs.access(filePath, fsConstants.F_OK);
      } catch {
        return res.status(404).json({
          success: false,
          message: 'Backup file not found'
        });
      }

      const startTime = Date.now();
      logger.warn(`CRITICAL: Database restore initiated by admin ${req.sessionData?.admin.email} for file: ${filename}`);

      // Step 1: Create a pre-restore backup for safety
      const preRestoreResult = await backupScheduler.executeBackup();
      if (!preRestoreResult.success) {
        logger.error('Failed to create pre-restore safety backup');
        return res.status(500).json({
          success: false,
          message: 'Failed to create safety backup before restore. Restore aborted for safety.',
          details: preRestoreResult.message
        });
      }

      // Step 2: Perform the restore operation
      try {
        const databaseUrl = process.env.DATABASE_URL;
        if (!databaseUrl) {
          throw new Error('DATABASE_URL environment variable not found');
        }

        // Parse database URL to extract connection details
        const dbUrl = new URL(databaseUrl);
        const dbName = dbUrl.pathname.slice(1); // Remove leading slash
        const username = dbUrl.username;
        const password = dbUrl.password;
        const hostname = dbUrl.hostname;
        const port = dbUrl.port || '5432';

        let restoreArgs: string[];
        
        // Handle different backup formats
        if (filename.endsWith('.sql') || filename.endsWith('.sql.gz')) {
          // For SQL files, use psql
          restoreArgs = [
            '-h', hostname,
            '-p', port,
            '-U', username,
            '-d', dbName,
            '-v', 'ON_ERROR_STOP=1', // Stop on first error
            '-f', filePath
          ];

          if (filename.endsWith('.gz')) {
            // For compressed SQL files, decompress first
            const decompressProcess = spawn('gunzip', ['-c', filePath]);
            const psqlProcess = spawn('psql', restoreArgs.slice(0, -2)); // Remove -f and filepath

            // Set up environment for password
            psqlProcess.env = { ...process.env, PGPASSWORD: password };

            // Pipe decompressed data to psql
            decompressProcess.stdout.pipe(psqlProcess.stdin);

            await new Promise<void>((resolve, reject) => {
              psqlProcess.on('close', (code) => {
                if (code === 0) resolve();
                else reject(new Error(`psql restore failed with exit code ${code}`));
              });
              psqlProcess.on('error', reject);
              decompressProcess.on('error', reject);
            });
          } else {
            // For uncompressed SQL files
            const psqlProcess = spawn('psql', restoreArgs, {
              env: { ...process.env, PGPASSWORD: password }
            });

            await new Promise<void>((resolve, reject) => {
              psqlProcess.on('close', (code) => {
                if (code === 0) resolve();
                else reject(new Error(`psql restore failed with exit code ${code}`));
              });
              psqlProcess.on('error', reject);
            });
          }
        } else {
          // For pg_dump format files, use pg_restore
          restoreArgs = [
            '-h', hostname,
            '-p', port,
            '-U', username,
            '-d', dbName,
            '--clean', // Clean existing objects
            '--if-exists', // Don't error if objects don't exist
            '--verbose',
            filePath
          ];

          const pgRestoreProcess = spawn('pg_restore', restoreArgs, {
            env: { ...process.env, PGPASSWORD: password }
          });

          await new Promise<void>((resolve, reject) => {
            let stderr = '';
            pgRestoreProcess.stderr?.on('data', (data) => {
              stderr += data.toString();
            });

            pgRestoreProcess.on('close', (code) => {
              // pg_restore may exit with code 1 for warnings, which is often acceptable
              if (code === 0 || (code === 1 && !stderr.includes('FATAL'))) {
                resolve();
              } else {
                reject(new Error(`pg_restore failed with exit code ${code}: ${stderr}`));
              }
            });
            pgRestoreProcess.on('error', reject);
          });
        }

        const duration = Date.now() - startTime;
        
        logger.warn(`Database restore completed successfully in ${duration}ms. File: ${filename}`, {
          filename,
          duration,
          admin: req.sessionData?.admin.email,
          preRestoreBackup: preRestoreResult.message
        });

        res.json({
          success: true,
          message: 'Database restored successfully',
          details: {
            filename,
            duration,
            preRestoreBackup: preRestoreResult.message
          },
          timestamp: new Date().toISOString()
        });

      } catch (error) {
        const duration = Date.now() - startTime;
        logger.error(`Database restore FAILED after ${duration}ms:`, error);
        
        res.status(500).json({
          success: false,
          message: 'Database restore failed',
          error: error instanceof Error ? error.message : 'Unknown error',
          details: {
            filename,
            duration,
            preRestoreBackup: preRestoreResult.message
          },
          timestamp: new Date().toISOString()
        });
      }

    } catch (error) {
      logger.error('Error during backup restore:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to initiate backup restore',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      });
    }
  }
);

/**
 * Utility function to format file sizes
 */
function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
}

export { router as backupRoutes };