import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import {
  createBackup,
  restoreBackup,
  deleteBackup,
  listBackups,
  getBackupPath,
} from './backup';
import { saveConfig } from '../config/store';

function makeTempDir(): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'portkey-backup-test-'));
}

const sampleConfig = {
  version: '1',
  activeProfile: 'dev',
  profiles: {
    dev: { ports: { API: 3000, DB: 5432 } },
  },
};

describe('backup', () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = makeTempDir();
    saveConfig(tmpDir, sampleConfig as any);
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it('creates a backup and returns an entry', () => {
    const entry = createBackup(tmpDir, 'initial');
    expect(entry.id).toBeTruthy();
    expect(entry.label).toBe('initial');
    expect(entry.config).toEqual(sampleConfig);
    expect(entry.timestamp).toBeTruthy();
  });

  it('lists all backups', () => {
    createBackup(tmpDir, 'first');
    createBackup(tmpDir, 'second');
    const backups = listBackups(tmpDir);
    expect(backups).toHaveLength(2);
    expect(backups[0].label).toBe('first');
    expect(backups[1].label).toBe('second');
  });

  it('restores a backup by id', () => {
    const entry = createBackup(tmpDir);
    const updated = { ...sampleConfig, activeProfile: 'prod' };
    saveConfig(tmpDir, updated as any);
    const ok = restoreBackup(tmpDir, entry.id);
    expect(ok).toBe(true);
  });

  it('returns false when restoring non-existent id', () => {
    const ok = restoreBackup(tmpDir, 'nonexistent');
    expect(ok).toBe(false);
  });

  it('deletes a backup by id', () => {
    const entry = createBackup(tmpDir, 'to-delete');
    const ok = deleteBackup(tmpDir, entry.id);
    expect(ok).toBe(true);
    expect(listBackups(tmpDir)).toHaveLength(0);
  });

  it('returns false when deleting non-existent id', () => {
    const ok = deleteBackup(tmpDir, 'ghost');
    expect(ok).toBe(false);
  });

  it('returns empty array when no backup file exists', () => {
    expect(listBackups(tmpDir)).toEqual([]);
  });

  it('getBackupPath returns correct path', () => {
    expect(getBackupPath('/some/dir')).toBe('/some/dir/backups.json');
  });
});
