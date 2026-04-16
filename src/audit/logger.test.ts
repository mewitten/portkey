import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { writeAuditEntry, readAuditLog, clearAuditLog, getAuditLogPath } from './logger';

jest.mock('../config/store', () => ({
  getConfigPath: () => path.join(os.tmpdir(), 'portkey-audit-test', 'config.json'),
}));

const logPath = path.join(os.tmpdir(), 'portkey-audit-test', 'audit.log');

beforeEach(() => {
  fs.mkdirSync(path.dirname(logPath), { recursive: true });
  if (fs.existsSync(logPath)) fs.unlinkSync(logPath);
});

afterAll(() => {
  if (fs.existsSync(logPath)) fs.unlinkSync(logPath);
});

test('getAuditLogPath returns correct path', () => {
  expect(getAuditLogPath()).toBe(logPath);
});

test('readAuditLog returns empty array when no log file', () => {
  expect(readAuditLog()).toEqual([]);
});

test('writeAuditEntry appends entry with timestamp', () => {
  writeAuditEntry({ action: 'switch', profile: 'dev' });
  const entries = readAuditLog();
  expect(entries).toHaveLength(1);
  expect(entries[0].action).toBe('switch');
  expect(entries[0].profile).toBe('dev');
  expect(entries[0].timestamp).toBeDefined();
});

test('writeAuditEntry appends multiple entries', () => {
  writeAuditEntry({ action: 'switch', profile: 'dev' });
  writeAuditEntry({ action: 'init', details: { ports: 3 } });
  const entries = readAuditLog();
  expect(entries).toHaveLength(2);
  expect(entries[1].action).toBe('init');
});

test('clearAuditLog empties the log', () => {
  writeAuditEntry({ action: 'switch', profile: 'dev' });
  clearAuditLog();
  expect(readAuditLog()).toEqual([]);
});
