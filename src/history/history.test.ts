import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

let tmpDir: string;

jest.mock('../config/store', () => ({
  getConfigPath: () => path.join(tmpDir, 'portkey.json'),
}));

import {
  readHistory,
  writeHistory,
  addHistoryEntry,
  clearHistory,
  getLastActive,
  getHistoryPath,
  HistoryEntry,
} from './history';

beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'portkey-history-'));
});

afterEach(() => {
  fs.rmSync(tmpDir, { recursive: true, force: true });
});

describe('readHistory', () => {
  it('returns empty array when no history file exists', () => {
    expect(readHistory()).toEqual([]);
  });

  it('returns parsed entries from file', () => {
    const entries: HistoryEntry[] = [
      { timestamp: '2024-01-01T00:00:00.000Z', action: 'switch', profile: 'dev' },
    ];
    fs.writeFileSync(getHistoryPath(), JSON.stringify(entries));
    expect(readHistory()).toEqual(entries);
  });

  it('returns empty array on malformed file', () => {
    fs.writeFileSync(getHistoryPath(), 'not-json');
    expect(readHistory()).toEqual([]);
  });
});

describe('addHistoryEntry', () => {
  it('adds a new entry at the beginning', () => {
    addHistoryEntry('switch', 'dev');
    const entries = readHistory();
    expect(entries[0].profile).toBe('dev');
    expect(entries[0].action).toBe('switch');
    expect(entries[0].timestamp).toBeDefined();
  });

  it('stores previous profile when provided', () => {
    addHistoryEntry('switch', 'prod', 'dev');
    const entries = readHistory();
    expect(entries[0].previous).toBe('dev');
  });

  it('caps history at 50 entries', () => {
    for (let i = 0; i < 55; i++) {
      addHistoryEntry('switch', `profile-${i}`);
    }
    expect(readHistory().length).toBe(50);
  });
});

describe('clearHistory', () => {
  it('removes all history entries', () => {
    addHistoryEntry('create', 'dev');
    clearHistory();
    expect(readHistory()).toEqual([]);
  });
});

describe('getLastActive', () => {
  it('returns null when no switch entries exist', () => {
    addHistoryEntry('create', 'dev');
    expect(getLastActive()).toBeNull();
  });

  it('returns the most recently switched profile', () => {
    addHistoryEntry('switch', 'staging');
    addHistoryEntry('switch', 'prod');
    expect(getLastActive()).toBe('prod');
  });
});
