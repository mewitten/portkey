import { Command } from 'commander';
import { loadConfig, saveConfig } from '../config/store';
import {
  addScope,
  removeScope,
  getScopes,
  getProfilesInScope,
  getScopesForProfile,
  resolveScope,
} from '../scope/scoper';

export function registerScopeCommands(program: Command): void {
  const scope = program.command('scope').description('Manage port scopes');

  scope
    .command('add <scope> <profile> [keys...]')
    .description('Add a profile with specific port keys to a scope')
    .action(async (scopeName: string, profile: string, keys: string[]) => {
      const config = await loadConfig();
      const updated = addScope(config, scopeName, profile, keys);
      await saveConfig(updated);
      console.log(`Added profile "${profile}" to scope "${scopeName}" with keys: ${keys.join(', ')}`);
    });

  scope
    .command('remove <scope>')
    .description('Remove a scope entirely')
    .action(async (scopeName: string) => {
      const config = await loadConfig();
      const updated = removeScope(config, scopeName);
      await saveConfig(updated);
      console.log(`Removed scope "${scopeName}"`);
    });

  scope
    .command('list')
    .description('List all scopes')
    .action(async () => {
      const config = await loadConfig();
      const scopes = getScopes(config);
      const names = Object.keys(scopes);
      if (names.length === 0) {
        console.log('No scopes defined.');
        return;
      }
      for (const name of names) {
        console.log(`${name}:`);
        for (const entry of scopes[name]) {
          console.log(`  ${entry.profile}: ${entry.keys.join(', ')}`);
        }
      }
    });

  scope
    .command('show <scope>')
    .description('Show resolved ports for a scope')
    .action(async (scopeName: string) => {
      const config = await loadConfig();
      const entries = getProfilesInScope(config, scopeName);
      if (entries.length === 0) {
        console.log(`Scope "${scopeName}" not found or empty.`);
        return;
      }
      const resolved = resolveScope(config, scopeName);
      for (const [key, port] of Object.entries(resolved)) {
        console.log(`  ${key} = ${port}`);
      }
    });

  scope
    .command('for <profile>')
    .description('List scopes that include a profile')
    .action(async (profile: string) => {
      const config = await loadConfig();
      const names = getScopesForProfile(config, profile);
      if (names.length === 0) {
        console.log(`Profile "${profile}" is not in any scope.`);
        return;
      }
      console.log(names.join('\n'));
    });
}
