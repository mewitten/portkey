import { Command } from 'commander';
import {
  createBackup,
  restoreBackup,
  readBackups,
  deleteBackup,
  getBackupPath,
} from '../backup/backup';
import { loadConfig } from '../config/store';

/**
 * Formats a backup entry for display.
 */
function formatBackup(backup: { id: string; timestamp: string; label?: string; profileCount: number }): string {
  const label = backup.label ? ` (${backup.label})` : '';
  const date = new Date(backup.timestamp).toLocaleString();
  return `  ${backup.id}${label} — ${date} — ${backup.profileCount} profile(s)`;
}

/**
 * Registers all backup-related CLI commands.
 */
export function registerBackupCommands(program: Command): void {
  const backup = program
    .command('backup')
    .description('Manage configuration backups');

  // Create a backup
  backup
    .command('create')
    .description('Create a backup of the current configuration')
    .option('-l, --label <label>', 'Optional label for the backup')
    .action(async (opts) => {
      try {
        const config = await loadConfig();
        const entry = await createBackup(config, opts.label);
        console.log(`Backup created: ${entry.id}${opts.label ? ` (${opts.label})` : ''}`);
      } catch (err: any) {
        console.error(`Error creating backup: ${err.message}`);
        process.exit(1);
      }
    });

  // List all backups
  backup
    .command('list')
    .description('List all available backups')
    .action(async () => {
      try {
        const backups = await readBackups();
        if (backups.length === 0) {
          console.log('No backups found.');
          return;
        }
        console.log('Available backups:');
        backups.forEach((b) => console.log(formatBackup(b)));
      } catch (err: any) {
        console.error(`Error listing backups: ${err.message}`);
        process.exit(1);
      }
    });

  // Restore from a backup
  backup
    .command('restore <id>')
    .description('Restore configuration from a backup by ID')
    .action(async (id: string) => {
      try {
        await restoreBackup(id);
        console.log(`Configuration restored from backup: ${id}`);
      } catch (err: any) {
        console.error(`Error restoring backup: ${err.message}`);
        process.exit(1);
      }
    });

  // Delete a backup
  backup
    .command('delete <id>')
    .description('Delete a backup by ID')
    .action(async (id: string) => {
      try {
        await deleteBackup(id);
        console.log(`Backup deleted: ${id}`);
      } catch (err: any) {
        console.error(`Error deleting backup: ${err.message}`);
        process.exit(1);
      }
    });

  // Show backup storage path
  backup
    .command('path')
    .description('Show the path to the backup storage file')
    .action(() => {
      console.log(getBackupPath());
    });
}
