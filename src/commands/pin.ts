import { Command } from 'commander';
import { pinPort, unpinPort, getPinnedPorts } from '../pin/pinner';

export function registerPinCommands(program: Command): void {
  const pin = program.command('pin').description('Manage pinned ports');

  pin
    .command('add <profile> <key>')
    .description('Pin a port key in a profile to prevent accidental changes')
    .action(async (profile: string, key: string) => {
      try {
        const entry = await pinPort(profile, key);
        console.log(`Pinned ${key} (${entry.port}) in profile '${profile}'.`);
      } catch (err: any) {
        console.error(`Error: ${err.message}`);
        process.exit(1);
      }
    });

  pin
    .command('remove <profile> <key>')
    .description('Unpin a port key in a profile')
    .action(async (profile: string, key: string) => {
      try {
        await unpinPort(profile, key);
        console.log(`Unpinned ${key} in profile '${profile}'.`);
      } catch (err: any) {
        console.error(`Error: ${err.message}`);
        process.exit(1);
      }
    });

  pin
    .command('list')
    .description('List all pinned ports')
    .action(async () => {
      try {
        const pins = await getPinnedPorts();
        if (pins.length === 0) {
          console.log('No pinned ports.');
          return;
        }
        console.log('Pinned ports:');
        for (const p of pins) {
          console.log(`  [${p.profile}] ${p.key} = ${p.port}  (pinned ${p.pinnedAt})`);
        }
      } catch (err: any) {
        console.error(`Error: ${err.message}`);
        process.exit(1);
      }
    });
}
