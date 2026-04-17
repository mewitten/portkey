import { Command } from 'commander';
import { renameProfile, renamePort } from '../rename/renamer';

export function registerRenameCommands(program: Command): void {
  const rename = program
    .command('rename')
    .description('Rename a profile or port key');

  rename
    .command('profile <oldName> <newName>')
    .description('Rename an existing profile')
    .action(async (oldName: string, newName: string) => {
      try {
        await renameProfile(oldName, newName);
        console.log(`Profile '${oldName}' renamed to '${newName}'.`);
      } catch (err: any) {
        console.error(`Error: ${err.message}`);
        process.exit(1);
      }
    });

  rename
    .command('port <profile> <oldKey> <newKey>')
    .description('Rename a port key within a profile')
    .action(async (profile: string, oldKey: string, newKey: string) => {
      try {
        await renamePort(profile, oldKey, newKey);
        console.log(`Port '${oldKey}' renamed to '${newKey}' in profile '${profile}'.`);
      } catch (err: any) {
        console.error(`Error: ${err.message}`);
        process.exit(1);
      }
    });
}
