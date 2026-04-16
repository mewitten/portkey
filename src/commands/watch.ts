import { Command } from 'commander';
import { getConfigPath } from '../config/store';
import { watchAndReload, stopWatch, isWatching } from '../watch/watcher';

export function registerWatchCommands(program: Command): void {
  program
    .command('watch')
    .description('Watch the portkey config file and reload on changes')
    .option('--stop', 'Stop any active watch')
    .action(async (options) => {
      if (options.stop) {
        if (isWatching()) {
          stopWatch();
          console.log('Watch stopped.');
        } else {
          console.log('No active watch to stop.');
        }
        return;
      }

      const configPath = getConfigPath();
      console.log(`Watching ${configPath} for changes...`);

      await watchAndReload(configPath, (config) => {
        console.log('Config reloaded:', JSON.stringify(config, null, 2));
      });

      console.log('Press Ctrl+C to stop watching.');

      process.on('SIGINT', () => {
        stopWatch();
        console.log('\nWatch stopped.');
        process.exit(0);
      });
    });
}
