import { Command } from 'commander';
import { lockProfile, unlockProfile, isLocked, readLocks, getLock } from '../lock/locker';

export function registerLockCommands(program: Command): void {
  const lock = program.command('lock').description('Lock or unlock profiles to prevent switching');

  lock
    .command('add <profile>')
    .description('Lock a profile')
    .option('-r, --reason <reason>', 'Reason for locking')
    .action((profile: string, opts: { reason?: string }) => {
      if (isLocked(profile)) {
        const existing = getLock(profile);
        console.error(`Profile "${profile}" is already locked (since ${existing?.lockedAt}).`);
        process.exit(1);
      }
      const entry = lockProfile(profile, opts.reason);
      console.log(`Locked profile "${profile}" at ${entry.lockedAt}.`);
      if (entry.reason) {
        console.log(`Reason: ${entry.reason}`);
      }
    });

  lock
    .command('remove <profile>')
    .description('Unlock a profile')
    .action((profile: string) => {
      const removed = unlockProfile(profile);
      if (!removed) {
        console.error(`Profile "${profile}" is not locked.`);
        process.exit(1);
      }
      console.log(`Unlocked profile "${profile}".`);
    });

  lock
    .command('status [profile]')
    .description('Show lock status for a profile or all profiles')
    .action((profile?: string) => {
      if (profile) {
        const entry = getLock(profile);
        if (!entry) {
          console.log(`Profile "${profile}" is not locked.`);
        } else {
          console.log(`Profile "${profile}" is locked.`);
          console.log(`  Locked at:  ${entry.lockedAt}`);
          console.log(`  Locked by:  ${entry.lockedBy ?? 'unknown'}`);
          if (entry.reason) console.log(`  Reason:     ${entry.reason}`);
        }
      } else {
        const locks = readLocks();
        const entries = Object.values(locks);
        if (entries.length === 0) {
          console.log('No profiles are currently locked.');
        } else {
          console.log('Locked profiles:');
          for (const e of entries) {
            const reason = e.reason ? ` — ${e.reason}` : '';
            console.log(`  ${e.profile} (locked at ${e.lockedAt}${reason})`);
          }
        }
      }
    });
}
