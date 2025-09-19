import * as cron from 'node-cron';
import { spawn } from 'child_process';
import path from 'path';
import { logger } from '../logger';

/**
 * Backup Scheduler Service
 * 
 * Manages automated database backups using cron scheduling.
 * Only runs in production environment for safety.
 */
export class BackupScheduler {
  private static instance: BackupScheduler;
  private cronJob: cron.ScheduledTask | null = null;
  private isRunning = false;

  private constructor() {}

  public static getInstance(): BackupScheduler {
    if (!BackupScheduler.instance) {
      BackupScheduler.instance = new BackupScheduler();
    }
    return BackupScheduler.instance;
  }

  /**
   * Start the backup scheduler
   * @param cronExpression - Cron expression for scheduling (default: nightly at 2 AM)
   */
  public start(cronExpression?: string): void {
    if (this.isRunning) {
      logger.warn('Backup scheduler is already running');
      return;
    }

    // Only run in production environment
    if (process.env.NODE_ENV !== 'production') {
      logger.info('Backup scheduler disabled: not running in production environment');
      return;
    }

    // Use provided cron expression or environment variable or default
    const schedule = cronExpression || 
                    process.env.BACKUP_CRON || 
                    '0 2 * * *'; // Default: daily at 2 AM

    logger.info(`Starting backup scheduler with cron expression: ${schedule}`);

    try {
      this.cronJob = cron.schedule(schedule, async () => {
        await this.executeBackup();
      }, {
        timezone: process.env.TZ || 'UTC'
      });

      this.cronJob.start();
      this.isRunning = true;
      
      logger.info('Backup scheduler started successfully');
    } catch (error) {
      logger.error('Failed to start backup scheduler:', error);
      throw error;
    }
  }

  /**
   * Stop the backup scheduler
   */
  public stop(): void {
    if (this.cronJob) {
      this.cronJob.stop();
      this.cronJob.destroy();
      this.cronJob = null;
      this.isRunning = false;
      logger.info('Backup scheduler stopped');
    }
  }

  /**
   * Check if scheduler is running
   */
  public getStatus(): { running: boolean; schedule?: string } {
    return {
      running: this.isRunning,
      schedule: this.isRunning && this.cronJob ? 
                process.env.BACKUP_CRON || '0 2 * * *' : 
                undefined
    };
  }

  /**
   * Execute a backup using the existing backup script
   */
  public async executeBackup(): Promise<{ success: boolean; message: string; output?: string }> {
    logger.info('Starting scheduled database backup');
    
    const startTime = Date.now();
    
    try {
      const scriptPath = path.resolve(__dirname, '../scripts/backup-database-v2.js');
      
      // Build arguments for backup script
      const args = [
        scriptPath,
        '--compress', // Always compress scheduled backups
        '--verbose'   // Enable verbose logging for scheduled backups
      ];

      // Add custom output directory if specified
      const outputDir = process.env.BACKUP_OUTPUT_DIR || process.env.BACKUP_DIR;
      if (outputDir) {
        args.push('--output-dir', outputDir);
      }

      // Add retention days if specified
      const retentionDays = process.env.BACKUP_RETAIN_DAYS || process.env.BACKUP_RETENTION_DAYS;
      if (retentionDays) {
        args.push('--retain-days', retentionDays);
      }

      const result = await this.runBackupScript(args);
      const duration = Date.now() - startTime;
      
      if (result.success) {
        logger.info(`Scheduled backup completed successfully in ${duration}ms`);
        return {
          success: true,
          message: `Backup completed successfully in ${(duration / 1000).toFixed(2)}s`,
          output: result.output
        };
      } else {
        logger.error('Scheduled backup failed:', result.error);
        return {
          success: false,
          message: `Backup failed: ${result.error}`,
          output: result.output
        };
      }
    } catch (error) {
      const duration = Date.now() - startTime;
      logger.error(`Scheduled backup failed after ${duration}ms:`, error);
      return {
        success: false,
        message: `Backup failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  /**
   * Run the backup script with given arguments
   */
  private runBackupScript(args: string[]): Promise<{ success: boolean; output: string; error?: string }> {
    return new Promise((resolve) => {
      const childProcess = spawn('node', args, {
        stdio: ['ignore', 'pipe', 'pipe'],
        env: { ...process.env }
      });

      let stdout = '';
      let stderr = '';

      childProcess.stdout?.on('data', (data: Buffer) => {
        stdout += data.toString();
      });

      childProcess.stderr?.on('data', (data: Buffer) => {
        stderr += data.toString();
      });

      childProcess.on('close', (code: number | null) => {
        if (code === 0) {
          resolve({
            success: true,
            output: stdout + stderr
          });
        } else {
          resolve({
            success: false,
            output: stdout + stderr,
            error: `Process exited with code ${code}`
          });
        }
      });

      childProcess.on('error', (error: Error) => {
        resolve({
          success: false,
          output: stderr,
          error: error.message
        });
      });

      // Set a timeout for backup operations (30 minutes)
      const timeout = setTimeout(() => {
        childProcess.kill('SIGTERM');
        resolve({
          success: false,
          output: stdout + stderr,
          error: 'Backup operation timed out after 30 minutes'
        });
      }, 30 * 60 * 1000);

      childProcess.on('close', () => {
        clearTimeout(timeout);
      });
    });
  }

  /**
   * Validate cron expression
   */
  public static validateCronExpression(expression: string): boolean {
    try {
      return cron.validate(expression);
    } catch {
      return false;
    }
  }
}

// Export singleton instance
export const backupScheduler = BackupScheduler.getInstance();