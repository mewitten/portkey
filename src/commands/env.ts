import { Command } from 'commander';
import * as fs from 'fs';
import * as path from 'path';
import { loadConfig } from '../config/store';
import { generateEnvContent } from '../env/generator';

export function registerEnvCommands(program: Command): void {
  program
    .command('env')
    .description('Generate a .env file from the current port configuration')
    .option('-o, --output <file>', 'output file path', '.env')
    .option('-p, --prefix <prefix>', 'prefix for env variable names', '')
    .option('--no-uppercase', 'do not uppercase variable names')
    .option('--dry-run', 'print output without writing to file')
    .action(async (options) => {
      try {
        const config = await loadConfig();

        const content = generateEnvContent(config, {
          prefix: options.prefix,
          uppercase: options.uppercase !== false,
        });

        if (options.dryRun) {
          console.log(content);
          return;
        }

        const outputPath = path.resolve(process.cwd(), options.output);
        fs.writeFileSync(outputPath, content, 'utf-8');
        console.log(`✓ Environment file written to ${outputPath}`);

        if (config.activeProfile) {
          console.log(`  Using profile: ${config.activeProfile}`);
        }
      } catch (err: any) {
        console.error(`Error generating env file: ${err.message}`);
        process.exit(1);
      }
    });
}
