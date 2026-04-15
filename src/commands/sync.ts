import { Command } from 'commander';
import chalk from 'chalk';
import { syncProfile, syncAllProfiles } from '../sync/syncer';
import { loadConfig } from '../config/store';

export function registerSyncCommands(program: Command): void {
  program
    .command('sync [profile]')
    .description('Sync port configuration to .env files')
    .option('-o, --output <dir>', 'Output directory for env files', process.cwd())
    .option('--dry-run', 'Preview files that would be written without writing them')
    .action(async (profile: string | undefined, options) => {
      const syncOptions = {
        outputDir: options.output,
        dryRun: options.dryRun ?? false,
      };

      try {
        if (profile) {
          const result = await syncProfile(profile, syncOptions);

          if (result.errors.length > 0) {
            result.errors.forEach((e) => console.error(chalk.red(`✖ ${e}`)));
            process.exit(1);
          }

          const label = options.dryRun ? chalk.yellow('(dry run)') : '';
          result.filesWritten.forEach((f) =>
            console.log(chalk.green(`✔ ${options.dryRun ? 'Would write' : 'Written'}: ${f} ${label}`))
          );
        } else {
          const config = await loadConfig();
          const profileCount = Object.keys(config.profiles ?? {}).length;

          if (profileCount === 0) {
            console.log(chalk.yellow('No profiles found. Use `portkey profile add` to create one.'));
            return;
          }

          const results = await syncAllProfiles(syncOptions);
          let hasErrors = false;

          results.forEach((result) => {
            result.errors.forEach((e) => {
              console.error(chalk.red(`✖ [${result.profile}] ${e}`));
              hasErrors = true;
            });
            result.filesWritten.forEach((f) =>
              console.log(chalk.green(`✔ [${result.profile}] ${options.dryRun ? 'Would write' : 'Written'}: ${f}`))
            );
          });

          if (hasErrors) process.exit(1);
        }
      } catch (err: any) {
        console.error(chalk.red(`Error: ${err.message}`));
        process.exit(1);
      }
    });
}
