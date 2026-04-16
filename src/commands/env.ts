import { Command } from 'commander';
import { loadConfig } from '../config/store';
import { generateEnvContent } from '../env/generator';

export function registerEnvCommands(program: Command): void {
  program
    .command('env')
    .description('Print environment variables for a profile as .env format')
    .option('-p, --profile <name>', 'Profile to use (defaults to active profile)')
    .option('-o, --output <file>', 'Write output to a file instead of stdout')
    .action(async (options: { profile?: string; output?: string }) => {
      const config = loadConfig();

      const profileName = options.profile ?? config.activeProfile;
      if (!profileName) {
        throw new Error('No active profile set. Use --profile to specify one or run: portkey switch <profile>');
      }

      const profile = config.profiles[profileName];
      if (!profile) {
        throw new Error(`Profile "${profileName}" not found.`);
      }

      const content = generateEnvContent(profile.ports);

      if (options.output) {
        const fs = await import('fs');
        fs.writeFileSync(options.output, content, 'utf-8');
        console.log(`Wrote env to ${options.output}`);
      } else {
        process.stdout.write(content);
      }
    });
}
