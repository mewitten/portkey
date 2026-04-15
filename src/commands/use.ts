import { Command } from 'commander';
import { loadConfig, saveConfig } from '../config/store';
import { getProfile } from '../profiles/manager';
import { generateEnvContent } from '../env/generator';
import * as fs from 'fs';
import * as path from 'path';

export function registerUseCommands(program: Command): void {
  program
    .command('use <profile>')
    .description('Switch to a named port profile and apply it to the current project')
    .option('-e, --env-file <path>', 'Path to write .env file', '.env')
    .option('--no-env', 'Skip writing .env file')
    .action(async (profileName: string, options: { envFile: string; env: boolean }) => {
      try {
        const config = await loadConfig();
        const profile = getProfile(config, profileName);

        if (!profile) {
          console.error(`Profile "${profileName}" not found.`);
          console.error('Run `portkey profile list` to see available profiles.');
          process.exit(1);
        }

        config.activeProfile = profileName;
        await saveConfig(config);

        console.log(`Switched to profile: ${profileName}`);

        if (options.env) {
          const envContent = generateEnvContent(profile.ports);
          const envPath = path.resolve(process.cwd(), options.envFile);
          fs.writeFileSync(envPath, envContent, 'utf-8');
          console.log(`Written ${Object.keys(profile.ports).length} port(s) to ${options.envFile}`);
        }

        if (profile.ports && Object.keys(profile.ports).length > 0) {
          console.log('\nActive ports:');
          for (const [name, port] of Object.entries(profile.ports)) {
            console.log(`  ${name}: ${port}`);
          }
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
          console.log('No active profile set. Run `portkey use <profile>` to activate one.');
          return;
        }
        const profile = getProfile(config, config.activeProfile);
        if (!profile) {
          console.log(`Active profile "${config.activeProfile}" no longer exists.`);
          return;
        }
        console.log(`Current profile: ${config.activeProfile}`);
        if (profile.ports && Object.keys(profile.ports).length > 0) {
          console.log('Ports:');
          for (const [name, port] of Object.entries(profile.ports)) {
            console.log(`  ${name}: ${port}`);
          }
        }
      } catch (err) {
        console.error('Failed to get current profile:', (err as Error).message);
        process.exit(1);
      }
    });
}
