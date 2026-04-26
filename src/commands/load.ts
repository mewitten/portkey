import { Command } from 'commander';
import { loadEnvForProfile, mergeEnvForProfile } from '../env/loader';
import { loadConfig } from '../config/store';

export function registerLoadCommands(program: Command): void {
  const load = program
    .command('load')
    .description('Load port configuration into an .env file');

  load
    .command('env <profile>')
    .description('Write ports for a profile to an env file')
    .option('-o, --output <path>', 'Output file path', '.env')
    .option('--overwrite', 'Overwrite existing file', false)
    .action(async (profile: string, opts: { output: string; overwrite: boolean }) => {
      try {
        await loadEnvForProfile(profile, opts.output, opts.overwrite);
        console.log(`✔ Wrote env for profile "${profile}" to ${opts.output}`);
      } catch (err: any) {
        console.error(`✖ ${err.message}`);
        process.exit(1);
      }
    });

  load
    .command('merge <profile>')
    .description('Merge ports for a profile into an existing env file')
    .option('-o, --output <path>', 'Target env file path', '.env')
    .action(async (profile: string, opts: { output: string }) => {
      try {
        await mergeEnvForProfile(profile, opts.output);
        console.log(`✔ Merged env for profile "${profile}" into ${opts.output}`);
      } catch (err: any) {
        console.error(`✖ ${err.message}`);
        process.exit(1);
      }
    });

  load
    .command('active')
    .description('Write env for the currently active profile')
    .option('-o, --output <path>', 'Output file path', '.env')
    .option('--overwrite', 'Overwrite existing file', false)
    .action(async (opts: { output: string; overwrite: boolean }) => {
      try {
        const config = await loadConfig();
        const active = config.activeProfile;
        if (!active) throw new Error('No active profile set. Use `portkey switch` first.');
        await loadEnvForProfile(active, opts.output, opts.overwrite);
        console.log(`✔ Wrote env for active profile "${active}" to ${opts.output}`);
      } catch (err: any) {
        console.error(`✖ ${err.message}`);
        process.exit(1);
      }
    });
}
