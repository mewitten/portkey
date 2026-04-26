import { Command } from 'commander';
import { loadConfig } from '../config/store';
import { lintConfig } from '../lint/linter';

export function registerLintCommands(program: Command): void {
  program
    .command('lint')
    .description('Lint the current port configuration for issues')
    .option('--profile <name>', 'Lint a specific profile only')
    .option('--fix', 'Attempt to auto-fix fixable issues (not yet implemented)')
    .option('--json', 'Output results as JSON')
    .action(async (opts) => {
      try {
        const config = await loadConfig();
        const results = lintConfig(config, opts.profile);

        if (opts.json) {
          console.log(JSON.stringify(results, null, 2));
          if (results.some((r) => r.severity === 'error')) process.exit(1);
          return;
        }

        if (results.length === 0) {
          console.log('✅ No lint issues found.');
          return;
        }

        const errors = results.filter((r) => r.severity === 'error');
        const warnings = results.filter((r) => r.severity === 'warning');

        for (const result of results) {
          const icon = result.severity === 'error' ? '❌' : '⚠️';
          const location = result.profile ? `[${result.profile}] ` : '';
          console.log(`${icon} ${location}${result.message}`);
          if (result.suggestion) {
            console.log(`   💡 ${result.suggestion}`);
          }
        }

        console.log(
          `\n${errors.length} error(s), ${warnings.length} warning(s) found.`
        );

        if (errors.length > 0) process.exit(1);
      } catch (err: any) {
        console.error('Error running lint:', err.message);
        process.exit(1);
      }
    });
}
