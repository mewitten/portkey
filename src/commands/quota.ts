import { Command } from 'commander';
import { loadConfig } from '../config/store';
import { checkQuota, DEFAULT_QUOTA, QuotaRule } from '../quota/quoter';

function formatViolation(v: { rule: string; message: string }): string {
  return `  [${v.rule}] ${v.message}`;
}

export function registerQuotaCommands(program: Command): void {
  const quota = program
    .command('quota')
    .description('Check port configuration quota limits');

  quota
    .command('check')
    .description('Check current config against quota rules')
    .option('--max-profiles <n>', 'Maximum number of profiles', String)
    .option('--max-ports <n>', 'Maximum ports per profile', String)
    .option('--port-min <n>', 'Minimum allowed port number', String)
    .option('--port-max <n>', 'Maximum allowed port number', String)
    .action((opts) => {
      const config = loadConfig();
      const rule: QuotaRule = {
        maxProfiles: opts.maxProfiles ? parseInt(opts.maxProfiles, 10) : DEFAULT_QUOTA.maxProfiles,
        maxPortsPerProfile: opts.maxPorts ? parseInt(opts.maxPorts, 10) : DEFAULT_QUOTA.maxPortsPerProfile,
        portRangeMin: opts.portMin ? parseInt(opts.portMin, 10) : DEFAULT_QUOTA.portRangeMin,
        portRangeMax: opts.portMax ? parseInt(opts.portMax, 10) : DEFAULT_QUOTA.portRangeMax,
      };

      const violations = checkQuota(config, rule);

      if (violations.length === 0) {
        console.log('✔ All quota checks passed.');
        return;
      }

      console.log(`✖ ${violations.length} quota violation(s) found:\n`);
      violations.forEach(v => console.log(formatViolation(v)));
      process.exitCode = 1;
    });

  quota
    .command('limits')
    .description('Display current quota limits')
    .action(() => {
      console.log('Current quota limits:');
      console.log(`  maxProfiles:        ${DEFAULT_QUOTA.maxProfiles}`);
      console.log(`  maxPortsPerProfile: ${DEFAULT_QUOTA.maxPortsPerProfile}`);
      console.log(`  portRangeMin:       ${DEFAULT_QUOTA.portRangeMin}`);
      console.log(`  portRangeMax:       ${DEFAULT_QUOTA.portRangeMax}`);
    });
}
