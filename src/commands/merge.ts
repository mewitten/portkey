import { Command } from 'commander';
import { mergeProfiles } from '../merge/merger';

export function registerMergeCommands(program: Command): void {
  program
    .command('merge <source> <target>')
    .description('Merge ports from source profile into target profile')
    .option('-o, --overwrite', 'Overwrite existing keys in target', false)
    .action(async (source: string, target: string, options: { overwrite: boolean }) => {
      try {
        const result = await mergeProfiles(source, target, options.overwrite);

        if (result.merged.length > 0) {
          console.log(`Merged: ${result.merged.join(', ')}`);
        }
        if (result.overwritten.length > 0) {
          console.log(`Overwritten: ${result.overwritten.join(', ')}`);
        }
        if (result.skipped.length > 0) {
          console.log(`Skipped (already exist): ${result.skipped.join(', ')}`);
        }
        if (result.merged.length === 0 && result.overwritten.length === 0) {
          console.log('Nothing to merge.');
        } else {
          console.log(`\nSuccessfully merged '${source}' into '${target}'.`);
        }
      } catch (err: any) {
        console.error(`Error: ${err.message}`);
        process.exit(1);
      }
    });
}
