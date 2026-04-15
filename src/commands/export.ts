import { Command } from 'commander';
import { exportConfig, ExportFormat } from '../export/exporter';

export function registerExportCommands(program: Command): void {
  program
    .command('export')
    .description('Export port configuration to a file or stdout')
    .option('-f, --format <format>', 'Output format: json, env, dotenv', 'json')
    .option('-p, --profile <profile>', 'Profile to export (defaults to active profile)')
    .option('-o, --output <path>', 'Output file path (prints to stdout if omitted)')
    .action((options) => {
      const validFormats: ExportFormat[] = ['json', 'env', 'dotenv'];
      const format = options.format as ExportFormat;

      if (!validFormats.includes(format)) {
        console.error(`Error: Invalid format "${format}". Use one of: ${validFormats.join(', ')}`);
        process.exit(1);
      }

      try {
        const result = exportConfig({
          format,
          profile: options.profile,
          outputPath: options.output,
        });

        if (options.output) {
          console.log(`Exported to ${options.output}`);
        } else {
          console.log(result);
        }
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        console.error(`Error: ${message}`);
        process.exit(1);
      }
    });
}
