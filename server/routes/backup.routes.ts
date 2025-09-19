import { Router } from 'express';
import { promises as fs, constants as fsConstants } from 'fs';
import path from 'path';
import { backupScheduler } from '../ops/backup.scheduler';
import { authenticateAdmin, requireRole, auditLogger } from '../auth/middleware';
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

      res.json({
        scheduler: status,
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