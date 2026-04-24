import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import { loadConfig, saveConfig } from '../config/store';
import { PortConfig } from '../config/schema';

export interface ShareToken {
  token: string;
  profile: string;
  createdAt: string;
  expiresAt?: string;
}

export interface ShareStore {
  tokens: ShareToken[];
}

export function getShareStorePath(configDir: string): string {
  return path.join(configDir, 'shares.json');
}

export function readShareStore(configDir: string): ShareStore {
  const filePath = getShareStorePath(configDir);
  if (!fs.existsSync(filePath)) {
    return { tokens: [] };
  }
  const raw = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(raw) as ShareStore;
}

export function writeShareStore(configDir: string, store: ShareStore): void {
  const filePath = getShareStorePath(configDir);
  fs.writeFileSync(filePath, JSON.stringify(store, null, 2), 'utf-8');
}

export function generateShareToken(
  configDir: string,
  profile: string,
  ttlMinutes?: number
): ShareToken {
  const config = loadConfig(configDir);
  if (!config.profiles[profile]) {
    throw new Error(`Profile "${profile}" not found`);
  }
  const token = crypto.randomBytes(16).toString('hex');
  const createdAt = new Date().toISOString();
  const expiresAt = ttlMinutes
    ? new Date(Date.now() + ttlMinutes * 60 * 1000).toISOString()
    : undefined;
  const entry: ShareToken = { token, profile, createdAt, expiresAt };
  const store = readShareStore(configDir);
  store.tokens.push(entry);
  writeShareStore(configDir, store);
  return entry;
}

export function resolveShareToken(
  configDir: string,
  token: string
): { profile: string; ports: Record<string, number> } {
  const store = readShareStore(configDir);
  const entry = store.tokens.find((t) => t.token === token);
  if (!entry) {
    throw new Error(`Token "${token}" not found`);
  }
  if (entry.expiresAt && new Date(entry.expiresAt) < new Date()) {
    throw new Error(`Token "${token}" has expired`);
  }
  const config = loadConfig(configDir);
  const ports = config.profiles[entry.profile]?.ports ?? {};
  return { profile: entry.profile, ports };
}

export function revokeShareToken(configDir: string, token: string): boolean {
  const store = readShareStore(configDir);
  const before = store.tokens.length;
  store.tokens = store.tokens.filter((t) => t.token !== token);
  if (store.tokens.length === before) return false;
  writeShareStore(configDir, store);
  return true;
}

export function listShareTokens(configDir: string): ShareToken[] {
  return readShareStore(configDir).tokens;
}
