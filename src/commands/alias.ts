import { Command } from 'commander';
import { loadConfig, saveConfig } from '../config/store';
import { getAliases, resolveAlias, addAlias, removeAlias, updateAlias } from '../alias/aliaser';

export function registerAliasCommands(program: Command): void {
  const alias = program
    .command('alias')
    .description('Manage profile aliases');

  alias
    .command('list')
    .description('List all aliases')
    .action(async () => {
      const config = await loadConfig();
      const aliases = getAliases(config);
      const entries = Object.entries(aliases);
      if (entries.length === 0) {
        console.log('No aliases defined.');
        return;
      }
      entries.forEach(([name, target]) => {
        console.log(`  ${name} -> ${target}`);
      });
    });

  alias
    .command('add <alias> <profile>')
    .description('Add an alias pointing to a profile')
    .action(async (aliasName: string, profile: string) => {
      const config = await loadConfig();
      const updated = addAlias(config, aliasName, profile);
      await saveConfig(updated);
      console.log(`Alias '${aliasName}' -> '${profile}' added.`);
    });

  alias
    .command('remove <alias>')
    .description('Remove an alias')
    .action(async (aliasName: string) => {
      const config = await loadConfig();
      const updated = removeAlias(config, aliasName);
      await saveConfig(updated);
      console.log(`Alias '${aliasName}' removed.`);
    });

  alias
    .command('update <alias> <profile>')
    .description('Update an existing alias to point to a different profile')
    .action(async (aliasName: string, profile: string) => {
      const config = await loadConfig();
      const updated = updateAlias(config, aliasName, profile);
      await saveConfig(updated);
      console.log(`Alias '${aliasName}' updated to '${profile}'.`);
    });

  alias
    .command('resolve <alias>')
    .description('Resolve an alias to its target profile name')
    .action(async (aliasName: string) => {
      const config = await loadConfig();
      const target = resolveAlias(config, aliasName);
      if (!target) {
        console.error(`Alias '${aliasName}' not found.`);
        process.exit(1);
      }
      console.log(target);
    });
}
