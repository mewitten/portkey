import { Command } from 'commander';
import { loadConfig } from '../config/store';
import { loadProfiles, getActiveProfile } from '../profiles/manager';

function formatPort(name: string, port: number, active: boolean): string {
  const activeMarker = active ? ' (active)' : '';
  return `  ${name.padEnd(20)} ${port}${activeMarker}`;
}

export function registerListCommands(program: Command): void {
  program
    .command('list')
    .alias('ls')
    .description('List all configured ports and profiles')
    .option('-p, --profile <name>', 'List ports for a specific profile')
    .option('--profiles', 'List all profiles only')
    .action(async (options) => {
      try {
        const profiles = await loadProfiles();
        const activeProfile = await getActiveProfile();

        if (options.profiles) {
          if (profiles.length === 0) {
            console.log('No profiles found. Run `portkey init` to get started.');
            return;
          }
          console.log('Profiles:');
          for (const profile of profiles) {
            const marker = profile.name === activeProfile ? ' *' : '';
            console.log(`  ${profile.name}${marker}`);
          }
          return;
        }

        const targetProfile = options.profile || activeProfile;
        const config = await loadConfig(targetProfile);

        if (!config || Object.keys(config.ports).length === 0) {
          console.log(`No ports configured for profile "${targetProfile}".`);
          console.log('Use `portkey port add <name> <port>` to add a port.');
          return;
        }

        console.log(`Ports for profile "${targetProfile}"${targetProfile === activeProfile ? ' (active)' : ''}:`);
        for (const [name, port] of Object.entries(config.ports)) {
          console.log(formatPort(name, port, false));
        }
      } catch (err) {
        console.error('Error listing configuration:', (err as Error).message);
        process.exit(1);
      }
    });
}
