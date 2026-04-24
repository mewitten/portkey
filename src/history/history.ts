import * as fs from 'fs';
import * as path from 'path';
import { getConfigPath } from '../config/store';

export interface HistoryEntry {
  timestamp: string;
  action: 'switch' | 'update' | 'delete' | 'create';
  profile: string;
  previous?: string;
  details?: string;
}

const HISTORY_FILE = 'history.json';
const MAX_HISTORY = 50;

export function getHistoryPath(): string {
  return path.join(path.dirname(getConfigPath()), HISTORY_FILE);
}

export function readHistory(): HistoryEntry[] {
  const historyPath = getHistoryPath();
  if (!fs.existsSync(historyPath)) {
    return [];
  }
  try {
    const raw = fs.readFileSync(historyPath, 'utf-8');
    return JSON.parse(raw) as HistoryEntry[];
  } catch {
    return [];
  }
}

export function writeHistory(entries: HistoryEntry[]): void {
  const historyPath = getHistoryPath();
  fs.writeFileSync(historyPath, JSON.stringify(entries, null, 2), 'utf-8');
}

export function addHistoryEntry(
  action: HistoryEntry['action'],
  profile: string,
  previous?: string,
  details?: string
): void {
  const entries = readHistory();
  const entry: HistoryEntry = {
    timestamp: new Date().toISOString(),
    action,
    profile,
    ...(previous !== undefined && { previous }),
    ...(details !== undefined && { details }),
  };
  entries.unshift(entry);
  const trimmed = entries.slice(0, MAX_HISTORY);
  writeHistory(trimmed);
}

export function clearHistory(): void {
  writeHistory([]);
}

export function getLastActive(): string | null {
  const entries = readHistory();
  const switchEntry = entries.find((e) => e.action === 'switch');
  return switchEntry ? switchEntry.profile : null;
}
