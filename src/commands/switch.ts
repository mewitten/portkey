import { Command } from 'commander';
import { loadConfig, saveConfig } from '../config/store';
import { getProfile } from '../profiles/manager';

export function registerSwitchCommands(program: Command): void {
  program
    .command('switch <profileName>')
    .description('Switch the active profile and apply its port configuration')
    .option('--dry-run', 'Preview the switch without applying changes')
    .action(async (profileName: string, options: { dryRun?: boolean }) => {
      try {
        const config = await loadConfig();
        const profile = getProfile(config, profileName);

        if (!profile) {
          console.error(`Profile "${profileName}" not found.`);
          process.exit(1);
        }

        if (options.dryRun) {
          console.log(`[dry-run] Would switch to profile: ${profileName}`);
          console.log('[dry-run] Ports that would be applied:');
          for (const [name, port] of Object.entries(profile.ports)) {
            console.log(`  ${name}: ${port}`);
          }
          return;
        }

        config.activeProfile = profileName;
        await saveConfig(config);

        console.log(`Switched to profile: ${profileName}`);
        console.log('Active ports:');
        for (const [name, port] of Object.entries(profile.ports)) {
          console.log(`  ${name}: ${port}`);
        }
      } catch (err) {
        console.error('Failed to switch profile:', (err as Error).message);
        process.exit(1);
      }
    });

  program
    .command('current')
    .description('Show the currently active profile')
    .action(async () => {
      try {
        const config = await loadConfig();
        if (!config.activeProfile) {
          console.log('No active profile set.');
          return;
        }
        console.log(`Active profile: ${config.activeProfile}`);
      } catch (err) {
        console.error('Failed to get current profile:', (err as Error).message);
        process.exit(1);
      }
    });
}
