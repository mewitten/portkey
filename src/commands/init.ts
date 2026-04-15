import { Command } from 'commander';
import chalk from 'chalk';
import { loadConfig, saveConfig } from '../config/store';
import { PortKeyConfig } from '../config/schema';

const DEFAULT_CONFIG: PortKeyConfig = {
  version: '1.0.0',
  activeProfile: 'default',
  ports: {},
  profiles: {
    default: {
      name: 'default',
      description: 'Default port profile',
      ports: {},
    },
  },
};

export function registerInitCommands(program: Command): void {
  program
    .command('init')
    .description('Initialize portkey configuration for the current environment')
    .option('-f, --force', 'Overwrite existing configuration', false)
    .action((options: { force: boolean }) => {
      try {
        const existing = loadConfig();
        if (existing && !options.force) {
          console.log(
            chalk.yellow(
              'Portkey is already initialized. Use --force to overwrite.'
            )
          );
          return;
        }

        saveConfig(DEFAULT_CONFIG);
        console.log(chalk.green('✔ Portkey initialized successfully!'));
        console.log(
          chalk.gray(
            `  Created default profile with no ports configured.`
          )
        );
        console.log(
          chalk.gray(
            `  Use ${chalk.white('portkey port add <name> <port>')} to add ports.`
          )
        );
      } catch (err) {
        console.error(
          chalk.red('Failed to initialize portkey:'),
          (err as Error).message
        );
        process.exit(1);
      }
    });
}
