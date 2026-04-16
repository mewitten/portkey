import { Command } from 'commander';
import { readAuditLog, clearAuditLog } from '../audit/logger';

export function registerAuditCommands(program: Command): void {
  const audit = program.command('audit').description('View or manage the audit log');

  audit
    .command('list')
    .description('List recent audit log entries')
    .option('-n, --limit <number>', 'Number of entries to show', '20')
    .option('--profile <profile>', 'Filter by profile')
    .action((opts) => {
      const limit = parseInt(opts.limit, 10);
      let entries = readAuditLog();

      if (opts.profile) {
        entries = entries.filter((e) => e.profile === opts.profile);
      }

      const recent = entries.slice(-limit).reverse();

      if (recent.length === 0) {
        console.log('No audit entries found.');
        return;
      }

      for (const entry of recent) {
        const detail = entry.profile ? ` [${entry.profile}]` : '';
        const extra = entry.details ? ' ' + JSON.stringify(entry.details) : '';
        console.log(`${entry.timestamp}  ${entry.action}${detail}${extra}`);
      }
    });

  audit
    .command('clear')
    .description('Clear the audit log')
    .action(() => {
      clearAuditLog();
      console.log('Audit log cleared.');
    });
}
