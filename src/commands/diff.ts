import { Command } from 'commander';
import chalk from 'chalk';
import { diffProfilesFlat, PortDiff } from '../diff';

function formatDiff(diff: PortDiff): string {
  const { key, from, to, type } = diff;
  if (type === 'added') {
    return chalk.green(`  + ${key}: ${to}`);
  }
  if (type === 'removed') {
    return chalk.red(`  - ${key}: ${from}`);
  }
  return chalk.yellow(`  ~ ${key}: ${from} → ${to}`);
}

export function registerDiffCommands(program: Command): void {
  program
    .command('diff <profileA> <profileB>')
    .description('Show port differences between two profiles')
    .option('--json', 'Output as JSON')
    .action((profileA: string, profileB: string, opts: { json?: boolean }) => {
      try {
        const diffs = diffProfilesFlat(profileA, profileB);

        if (opts.json) {
          console.log(JSON.stringify(diffs, null, 2));
          return;
        }

        if (diffs.length === 0) {
          console.log(chalk.gray(`No differences between "${profileA}" and "${profileB}".`));
          return;
        }

        console.log(chalk.bold(`Diff: ${profileA} → ${profileB}`));
        for (const diff of diffs) {
          console.log(formatDiff(diff));
        }
      } catch (err: any) {
        console.error(chalk.red(`Error: ${err.message}`));
        process.exit(1);
      }
    });
}
