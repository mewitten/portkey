import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import {
  getLockFilePath,
  readLocks,
  lockProfile,
  unlockProfile,
  isLocked,
  getLock,
} from './locker';

jest.mock('../config/store', () => ({
  getConfigPath: () => path.join(os.tmpdir(), 'portkey-lock-test', 'portkey.json'),
}));

const lockPath = path.join(os.tmpdir(), 'portkey-lock-test', 'portkey.lock.json');

beforeEach(() => {
  if (fs.existsSync(lockPath)) {
    fs.unlinkSync(lockPath);
  }
});

afterAll(() => {
  if (fs.existsSync(lockPath)) {
    fs.unlinkSync(lockPath);
  }
});

test('readLocks returns empty object when no lock file', () => {
  expect(readLocks()).toEqual({});
});

test('lockProfile creates a lock entry', () => {
  const entry = lockProfile('dev', 'CI pipeline');
  expect(entry.profile).toBe('dev');
  expect(entry.reason).toBe('CI pipeline');
  expect(entry.lockedAt).toBeDefined();
});

test('isLocked returns true for locked profile', () => {
  lockProfile('staging');
  expect(isLocked('staging')).toBe(true);
});

test('isLocked returns false for unlocked profile', () => {
  expect(isLocked('production')).toBe(false);
});

test('getLock returns the lock entry', () => {
  lockProfile('dev', 'testing');
  const lock = getLock('dev');
  expect(lock).toBeDefined();
  expect(lock?.reason).toBe('testing');
});

test('unlockProfile removes the lock', () => {
  lockProfile('dev');
  const result = unlockProfile('dev');
  expect(result).toBe(true);
  expect(isLocked('dev')).toBe(false);
});

test('unlockProfile returns false when profile not locked', () => {
  expect(unlockProfile('nonexistent')).toBe(false);
});

test('multiple profiles can be locked independently', () => {
  lockProfile('dev');
  lockProfile('staging');
  expect(isLocked('dev')).toBe(true);
  expect(isLocked('staging')).toBe(true);
  unlockProfile('dev');
  expect(isLocked('dev')).toBe(false);
  expect(isLocked('staging')).toBe(true);
});
