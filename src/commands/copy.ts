import { Command } from 'commander';
import { copyProfile } from '../copy/copier';

export function registerCopyCommands(program: Command): void {
  program
    .command('copy <source> <destination>')
    .description('Copy an existing profile to a new name')
    .option('-c, --config <path>', 'path to config file')
    .action(async (source: string, destination: string, opts: { config?: string }) => {
      try {
        const result = await copyProfile(source, destination, opts.config);
        if (result.success) {
          console.log(`✓ ${result.message}`);
        } else {
          console.error(`✗ ${result.message}`);
          process.exit(1);
        }
      } catch (err) {
        console.error('Error copying profile:', (err as Error).message);
        process.exit(1);
      }
    });
}
