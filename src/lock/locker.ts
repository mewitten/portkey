import * as fs from 'fs';
import * as path from 'path';
import { getConfigPath } from '../config/store';

export interface LockEntry {
  profile: string;
  lockedAt: string;
  lockedBy?: string;
  reason?: string;
}

export function getLockFilePath(): string {
  const configPath = getConfigPath();
  return path.join(path.dirname(configPath), 'portkey.lock.json');
}

export function readLocks(): Record<string, LockEntry> {
  const lockPath = getLockFilePath();
  if (!fs.existsSync(lockPath)) {
    return {};
  }
  try {
    const raw = fs.readFileSync(lockPath, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

export function writeLocks(locks: Record<string, LockEntry>): void {
  const lockPath = getLockFilePath();
  fs.writeFileSync(lockPath, JSON.stringify(locks, null, 2), 'utf-8');
}

export function lockProfile(profile: string, reason?: string): LockEntry {
  const locks = readLocks();
  const entry: LockEntry = {
    profile,
    lockedAt: new Date().toISOString(),
    lockedBy: process.env.USER ?? 'unknown',
    reason,
  };
  locks[profile] = entry;
  writeLocks(locks);
  return entry;
}

export function unlockProfile(profile: string): boolean {
  const locks = readLocks();
  if (!locks[profile]) {
    return false;
  }
  delete locks[profile];
  writeLocks(locks);
  return true;
}

export function isLocked(profile: string): boolean {
  const locks = readLocks();
  return !!locks[profile];
}

export function getLock(profile: string): LockEntry | undefined {
  const locks = readLocks();
  return locks[profile];
}
