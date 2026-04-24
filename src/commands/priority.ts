import { Command } from 'commander';
import { loadConfig } from '../config/store';
import {
  applyPriority,
  clearPriority,
  getPriorities,
  getHighestPriorityProfile,
} from '../priority/prioritizer';

export function registerPriorityCommands(program: Command): void {
  const priority = program
    .command('priority')
    .description('Manage profile priorities for conflict resolution');

  priority
    .command('set <profile> <value>')
    .description('Set a numeric priority for a profile (higher = preferred)')
    .action(async (profile: string, value: string) => {
      const num = parseInt(value, 10);
      if (isNaN(num)) {
        console.error('Error: priority value must be an integer.');
        process.exit(1);
      }
      try {
        await applyPriority(profile, num);
        console.log(`Priority for "${profile}" set to ${num}.`);
      } catch (err: any) {
        console.error(`Error: ${err.message}`);
        process.exit(1);
      }
    });

  priority
    .command('clear <profile>')
    .description('Remove the priority setting for a profile')
    .action(async (profile: string) => {
      try {
        await clearPriority(profile);
        console.log(`Priority for "${profile}" cleared.`);
      } catch (err: any) {
        console.error(`Error: ${err.message}`);
        process.exit(1);
      }
    });

  priority
    .command('list')
    .description('List all profiles with their priorities')
    .action(async () => {
      const config = await loadConfig();
      const items = getPriorities(config);
      if (items.length === 0) {
        console.log('No priorities configured.');
        return;
      }
      items.forEach(({ profile, priority }) => {
        console.log(`  ${profile.padEnd(20)} ${priority}`);
      });
    });

  priority
    .command('top')
    .description('Show the highest-priority profile')
    .action(async () => {
      const config = await loadConfig();
      const top = getHighestPriorityProfile(config);
      if (!top) {
        console.log('No priorities configured.');
      } else {
        console.log(`Highest priority profile: ${top}`);
      }
    });
}
