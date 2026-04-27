import { Command } from 'commander';
import { loadConfig, saveConfig } from '../config/store';
import {
  getPermissions,
  setProfilePermission,
  removeProfilePermission,
  canAccess,
  PermissionLevel,
} from '../permission/permissioner';

export function registerPermissionCommands(program: Command): void {
  const perm = program.command('permission').description('Manage profile access permissions');

  perm
    .command('set <profile> <level> <users...>')
    .description('Set permission level for users on a profile (read|write|admin)')
    .action(async (profile: string, level: string, users: string[]) => {
      const validLevels: PermissionLevel[] = ['read', 'write', 'admin'];
      if (!validLevels.includes(level as PermissionLevel)) {
        console.error(`Invalid level "${level}". Must be one of: ${validLevels.join(', ')}`);
        process.exit(1);
      }
      const config = await loadConfig();
      const updated = setProfilePermission(config, profile, level as PermissionLevel, users);
      await saveConfig(updated);
      console.log(`Permission set: profile "${profile}" → ${level} for [${users.join(', ')}]`);
    });

  perm
    .command('remove <profile>')
    .description('Remove all permissions for a profile')
    .action(async (profile: string) => {
      const config = await loadConfig();
      const updated = removeProfilePermission(config, profile);
      await saveConfig(updated);
      console.log(`Permissions removed for profile "${profile}"`);
    });

  perm
    .command('list')
    .description('List all profile permissions')
    .action(async () => {
      const config = await loadConfig();
      const store = getPermissions(config);
      if (store.permissions.length === 0) {
        console.log('No permissions configured.');
        return;
      }
      for (const p of store.permissions) {
        console.log(`  ${p.profile.padEnd(20)} ${p.level.padEnd(8)} [${p.users.join(', ')}]`);
      }
    });

  perm
    .command('check <profile> <user> <level>')
    .description('Check if a user has a given permission level on a profile')
    .action(async (profile: string, user: string, level: string) => {
      const config = await loadConfig();
      const allowed = canAccess(config, profile, user, level as PermissionLevel);
      console.log(allowed ? `✔ ${user} has ${level} access on "${profile}"` : `✘ ${user} does NOT have ${level} access on "${profile}"`);
    });
}
