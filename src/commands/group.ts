import { Command } from 'commander';
import {
  getGroups,
  getGroup,
  addGroup,
  removeGroup,
  updateGroup,
  addProfileToGroup,
  removeProfileFromGroup,
} from '../group/grouper';

export function registerGroupCommands(program: Command): void {
  const group = program.command('group').description('Manage profile groups');

  group
    .command('list')
    .description('List all groups')
    .action(async () => {
      const groups = await getGroups();
      const entries = Object.values(groups);
      if (entries.length === 0) {
        console.log('No groups defined.');
        return;
      }
      entries.forEach((g) => {
        const desc = g.description ? ` — ${g.description}` : '';
        console.log(`${g.name}${desc}: [${g.profiles.join(', ')}]`);
      });
    });

  group
    .command('add <name> <profiles...>')
    .description('Create a new group with the given profiles')
    .option('-d, --description <desc>', 'Group description')
    .action(async (name: string, profiles: string[], opts: { description?: string }) => {
      try {
        await addGroup(name, profiles, opts.description);
        console.log(`Group "${name}" created with profiles: ${profiles.join(', ')}`);
      } catch (err: any) {
        console.error(err.message);
        process.exit(1);
      }
    });

  group
    .command('remove <name>')
    .description('Remove a group')
    .action(async (name: string) => {
      try {
        await removeGroup(name);
        console.log(`Group "${name}" removed.`);
      } catch (err: any) {
        console.error(err.message);
        process.exit(1);
      }
    });

  group
    .command('add-profile <group> <profile>')
    .description('Add a profile to an existing group')
    .action(async (groupName: string, profile: string) => {
      try {
        await addProfileToGroup(groupName, profile);
        console.log(`Profile "${profile}" added to group "${groupName}".`);
      } catch (err: any) {
        console.error(err.message);
        process.exit(1);
      }
    });

  group
    .command('remove-profile <group> <profile>')
    .description('Remove a profile from a group')
    .action(async (groupName: string, profile: string) => {
      try {
        await removeProfileFromGroup(groupName, profile);
        console.log(`Profile "${profile}" removed from group "${groupName}".`);
      } catch (err: any) {
        console.error(err.message);
        process.exit(1);
      }
    });

  group
    .command('show <name>')
    .description('Show details of a group')
    .action(async (name: string) => {
      const g = await getGroup(name);
      if (!g) {
        console.error(`Group "${name}" not found.`);
        process.exit(1);
      }
      console.log(`Name: ${g.name}`);
      if (g.description) console.log(`Description: ${g.description}`);
      console.log(`Profiles: ${g.profiles.join(', ') || '(none)'}`);
    });
}
