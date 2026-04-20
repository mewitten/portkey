import { Command } from 'commander';
import { importConfig } from '../import/importer';
import { loadConfig, saveConfig } from '../config/store';

export function registerImportCommands(program: Command): void {
  program
    .command('import <file>')
    .description('Import port configuration from a .env or JSON file into a profile')
    .requiredOption('-p, --profile <name>', 'Target profile name to import into')
    .option('--overwrite', 'Overwrite existing profile if it exists false)
    .action((file: string, options: { profile: string; overwrite: boolean }) => {
      try {
        const { profile, ports } = importConfig(file, options.profile);
        const config = loadConfig();

        if (config.profiles[profile] && !options.overwrite) {
          console.error(
            `Profile "${profile}" already exists. Use --overwrite to replace it.`
          );
          process.exit(1);
        }

        const isUpdate = !!config.profiles[profile];
        config.profiles[profile] = { ports };
        saveConfig(config);

        const portCount = Object.keys(ports).length;
        const action = isUpdate ? 'Updated' : 'Created';
        console.log(`${action} profile "${profile}" with ${portCount} port(s) fromn        for (const [key, port] of Object.entries(ports)) {
          console.log(`  ${key}=${port}`);
        }
      } catch (err: any) {
        console.error(`Import failed: ${err.message}`);
        process.exit(1);
      }
    });
}
