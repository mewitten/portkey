import { Command } from 'commander';
import { clearHistory, getRecentHistory } from '../history';
import { loadConfig } from '../config/store';

export function registerHistoryCommands(program: Command): void {
  const history = program
    .command('history')
    .description('View and manage profile switch history');

  history
    .command('list')
    .description('List recent profile switches')
    .option('-n, --limit <number>', 'Number of entries to show', '20')
    .option('--json', 'Output as JSON')
    .action(async (options) => {
      try {
        const config = await loadConfig();
        const limit = parseInt(options.limit, 10);
        const entries = await getRecentHistory(config, limit);

        if (entries.length === 0) {
          console.log('No history found.');
          return;
        }

        if (options.json) {
          console.log(JSON.stringify(entries, null, 2));
          return;
        }

        console.log(`\nRecent profile switches (last ${entries.length}):`);
        console.log('─'.repeat(50));
        for (const entry of entries) {
          const date = new Date(entry.timestamp).toLocaleString();
          const from = entry.fromProfile ? `${entry.fromProfile} → ` : '';
          console.log(`  ${date}  ${from}${entry.toProfile}`);
          if (entry.note) {
            console.log(`    note: ${entry.note}`);
          }
        }
        console.log();
      } catch (err: any) {
        console.error('Error reading history:', err.message);
        process.exit(1);
      }
    });

  history
    .command('clear')
    .description('Clear all profile switch history')
    .option('--force', 'Skip confirmation')
    .action(async (options) => {
      try {
        if (!options.force) {
          console.log('Use --force to confirm clearing history.');
          return;
        }
        const config = await loadConfig();
        await clearHistory(config);
        console.log('History cleared.');
      } catch (err: any) {
        console.error('Error clearing history:', err.message);
        process.exit(1);
      }
    });
}
