import { Command } from 'commander';
import { addTag, removeTag, listByTag, listTags } from '../tag';

export function registerTagCommands(program: Command): void {
  const tag = program.command('tag').description('Manage profile tags');

  tag
    .command('add <profile> <tag>')
    .description('Add a tag to a profile')
    .action(async (profile: string, tagName: string) => {
      try {
        await addTag(profile, tagName);
        console.log(`Tag '${tagName}' added to profile '${profile}'.`);
      } catch (e: any) {
        console.error(e.message);
        process.exit(1);
      }
    });

  tag
    .command('remove <profile> <tag>')
    .description('Remove a tag from a profile')
    .action(async (profile: string, tagName: string) => {
      try {
        await removeTag(profile, tagName);
        console.log(`Tag '${tagName}' removed from profile '${profile}'.`);
      } catch (e: any) {
        console.error(e.message);
        process.exit(1);
      }
    });

  tag
    .command('list <profile>')
    .description('List tags on a profile')
    .action(async (profile: string) => {
      try {
        const tags = await listTags(profile);
        if (tags.length === 0) console.log('No tags.');
        else tags.forEach((t) => console.log(t));
      } catch (e: any) {
        console.error(e.message);
        process.exit(1);
      }
    });

  tag
    .command('filter <tag>')
    .description('List profiles with a given tag')
    .action(async (tagName: string) => {
      try {
        const profiles = await listByTag(tagName);
        if (profiles.length === 0) console.log('No profiles found.');
        else profiles.forEach((p) => console.log(p));
      } catch (e: any) {
        console.error(e.message);
        process.exit(1);
      }
    });
}
