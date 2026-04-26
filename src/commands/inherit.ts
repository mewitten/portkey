import { Command } from 'commander';
import { loadConfig, saveConfig } from '../config/store';
import {
  setParent,
  removeParent,
  getInheritanceMap,
  resolveProfile,
} from '../inherit/inheritor';

export function registerInheritCommands(program: Command): void {
  const inherit = program
    .command('inherit')
    .description('Manage profile inheritance');

  inherit
    .command('set <child> <parent>')
    .description('Set a parent profile for a child profile')
    .action(async (child: string, parent: string) => {
      const config = await loadConfig();
      const updated = setParent(config, child, parent);
      await saveConfig(updated);
      console.log(`Profile '${child}' now inherits from '${parent}'`);
    });

  inherit
    .command('remove <child>')
    .description('Remove parent from a child profile')
    .action(async (child: string) => {
      const config = await loadConfig();
      const updated = removeParent(config, child);
      await saveConfig(updated);
      console.log(`Removed parent from profile '${child}'`);
    });

  inherit
    .command('list')
    .description('List all profile inheritance relationships')
    .action(async () => {
      const config = await loadConfig();
      const map = getInheritanceMap(config);
      const entries = Object.entries(map);
      if (entries.length === 0) {
        console.log('No inheritance relationships defined.');
        return;
      }
      entries.forEach(([child, parent]) => {
        console.log(`  ${child} -> ${parent}`);
      });
    });

  inherit
    .command('resolve <profile>')
    .description('Show the resolved (merged) port config for a profile')
    .action(async (profileName: string) => {
      const config = await loadConfig();
      const resolved = resolveProfile(config, profileName);
      const entries = Object.entries(resolved);
      if (entries.length === 0) {
        console.log(`No ports found for profile '${profileName}'`);
        return;
      }
      console.log(`Resolved ports for '${profileName}':`);
      entries.forEach(([key, value]) => {
        console.log(`  ${key}: ${value}`);
      });
    });
}
