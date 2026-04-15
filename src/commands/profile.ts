import { Command } from 'commander';
import chalk from 'chalk';
import {
  createProfile,
  deleteProfile,
  switchProfile,
  getActiveProfile,
  listProfiles,
} from '../profiles/manager';

export function registerProfileCommands(program: Command): void {
  const profile = program
    .command('profile')
    .description('Manage port configuration profiles');

  profile
    .command('create <name>')
    .description('Create a new profile')
    .option('-d, --description <desc>', 'Profile description')
    .action((name: string, opts: { description?: string }) => {
      try {
        const p = createProfile(name, opts.description);
        console.log(chalk.green(`✔ Profile "${p.name}" created.`));
      } catch (err: any) {
        console.error(chalk.red(`✖ ${err.message}`));
        process.exit(1);
      }
    });

  profile
    .command('delete <name>')
    .description('Delete a profile')
    .action((name: string) => {
      try {
        deleteProfile(name);
        console.log(chalk.green(`✔ Profile "${name}" deleted.`));
      } catch (err: any) {
        console.error(chalk.red(`✖ ${err.message}`));
        process.exit(1);
      }
    });

  profile
    .command('use <name>')
    .description('Switch to a profile')
    .action((name: string) => {
      try {
        switchProfile(name);
        console.log(chalk.green(`✔ Switched to profile "${name}".`));
      } catch (err: any) {
        console.error(chalk.red(`✖ ${err.message}`));
        process.exit(1);
      }
    });

  profile
    .command('list')
    .description('List all profiles')
    .action(() => {
      const active = getActiveProfile();
      const profiles = listProfiles();
      if (profiles.length === 0) {
        console.log(chalk.yellow('No profiles found. Create one with: portkey profile create <name>'));
        return;
      }
      profiles.forEach((p) => {
        const marker = active?.name === p.name ? chalk.cyan('* ') : '  ';
        const desc = p.description ? chalk.gray(` — ${p.description}`) : '';
        console.log(`${marker}${chalk.bold(p.name)}${desc}`);
      });
    });

  profile
    .command('current')
    .description('Show the active profile')
    .action(() => {
      const active = getActiveProfile();
      if (!active) {
        console.log(chalk.yellow('No active profile.'));
      } else {
        console.log(chalk.cyan(`Active profile: ${chalk.bold(active.name)}`));
      }
    });
}
