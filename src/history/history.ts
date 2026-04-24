import * as fs from 'fs/promises';
import * as path from 'path';
import { getConfigPath } from '../config/store';

export interface HistoryEntry {
  timestamp: string;
  fromProfile?: string;
  toProfile: string;
  note?: string;
}

export interface PortkeyConfig {
  activeProfile: string;
  profiles: Record<string, any>;
}

export function getHistoryPath(config: PortkeyConfig): string {
  const configPath = getConfigPath();
  return path.join(path.dirname(configPath), 'history.json');
}

export async function readHistory(config: PortkeyConfig): Promise<HistoryEntry[]> {
  const historyPath = getHistoryPath(config);
  try {
    const raw = await fs.readFile(historyPath, 'utf-8');
    return JSON.parse(raw) as HistoryEntry[];
  } catch {
    return [];
  }
}

export async function writeHistory(config: PortkeyConfig, entries: HistoryEntry[]): Promise<void> {
  const historyPath = getHistoryPath(config);
  await fs.mkdir(path.dirname(historyPath), { recursive: true });
  await fs.writeFile(historyPath, JSON.stringify(entries, null, 2), 'utf-8');
}

export async function addHistoryEntry(
  config: PortkeyConfig,
  toProfile: string,
  fromProfile?: string,
  note?: string
): Promise<void> {
  const entries = await readHistory(config);
  const entry: HistoryEntry = {
    timestamp: new Date().toISOString(),
    toProfile,
    ...(fromProfile ? { fromProfile } : {}),
    ...(note ? { note } : {}),
  };
  entries.unshift(entry);
  // Keep at most 500 entries
  const trimmed = entries.slice(0, 500);
  await writeHistory(config, trimmed);
}

export async function getRecentHistory(
  config: PortkeyConfig,
  limit = 20
): Promise<HistoryEntry[]> {
  const entries = await readHistory(config);
  return entries.slice(0, limit);
}

export async function clearHistory(config: PortkeyConfig): Promise<void> {
  await writeHistory(config, []);
}
