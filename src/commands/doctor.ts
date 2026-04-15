import { Command } from 'commander';
import chalk from 'chalk';
import { runAllChecks, CheckResult } from '../doctor/checker';

function formatResult(result: CheckResult): string {
  const icons: Record<CheckResult['status'], string> = {
    ok: chalk.green('✔'),
    warn: chalk.yellow('⚠'),
    error: chalk.red('✖'),
  };
  const icon = icons[result.status];
  const label = chalk.bold(result.name.padEnd(20));
  return `  ${icon}  ${label} ${result.message}`;
}

export function registerDoctorCommands(program: Command): void {
  program
    .command('doctor')
    .description('Run diagnostics to check the health of your portkey configuration')
    .action(async () => {
      console.log(chalk.bold('\nPortkey Doctor\n'));
      console.log('Running checks...\n');

      const results = await runAllChecks();
      let hasError = false;
      let hasWarn = false;

      for (const result of results) {
        console.log(formatResult(result));
        if (result.status === 'error') hasError = true;
        if (result.status === 'warn') hasWarn = true;
      }

      console.log('');

      if (hasError) {
        console.log(chalk.red('✖ Some checks failed. Please resolve the errors above.'));
        process.exit(1);
      } else if (hasWarn) {
        console.log(chalk.yellow('⚠ All checks passed with warnings.'));
      } else {
        console.log(chalk.green('✔ All checks passed!'));
      }
    });
}
