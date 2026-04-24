import { Command } from 'commander';
import {
  generateShareToken,
  resolveShareToken,
  revokeShareToken,
  listShareTokens,
} from '../share/sharer';
import { ensureConfigDir, getConfigPath } from '../config/store';
import * as path from 'path';

export function registerShareCommands(program: Command): void {
  const share = program.command('share').description('Share profile configurations via tokens');

  share
    .command('create <profile>')
    .description('Generate a share token for a profile')
    .option('--ttl <minutes>', 'Token expiry in minutes', parseInt)
    .action((profile: string, opts: { ttl?: number }) => {
      const configDir = path.dirname(getConfigPath());
      ensureConfigDir();
      try {
        const token = generateShareToken(configDir, profile, opts.ttl);
        console.log(`Share token created for profile "${profile}":`);
        console.log(`  Token:   ${token.token}`);
        console.log(`  Created: ${token.createdAt}`);
        if (token.expiresAt) {
          console.log(`  Expires: ${token.expiresAt}`);
        }
      } catch (err: any) {
        console.error(`Error: ${err.message}`);
        process.exit(1);
      }
    });

  share
    .command('resolve <token>')
    .description('Resolve a share token and display its ports')
    .action((token: string) => {
      const configDir = path.dirname(getConfigPath());
      try {
        const result = resolveShareToken(configDir, token);
        console.log(`Profile: ${result.profile}`);
        console.log('Ports:');
        for (const [key, port] of Object.entries(result.ports)) {
          console.log(`  ${key}: ${port}`);
        }
      } catch (err: any) {
        console.error(`Error: ${err.message}`);
        process.exit(1);
      }
    });

  share
    .command('revoke <token>')
    .description('Revoke a share token')
    .action((token: string) => {
      const configDir = path.dirname(getConfigPath());
      const ok = revokeShareToken(configDir, token);
      if (ok) {
        console.log(`Token "${token}" revoked.`);
      } else {
        console.error(`Token "${token}" not found.`);
        process.exit(1);
      }
    });

  share
    .command('list')
    .description('List all active share tokens')
    .action(() => {
      const configDir = path.dirname(getConfigPath());
      const tokens = listShareTokens(configDir);
      if (tokens.length === 0) {
        console.log('No share tokens found.');
        return;
      }
      tokens.forEach((t) => {
        const expiry = t.expiresAt ? ` (expires ${t.expiresAt})` : ' (no expiry)';
        console.log(`${t.token}  profile=${t.profile}${expiry}`);
      });
    });
}
