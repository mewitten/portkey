import * as fs from 'fs';
import * as path from 'path';
import { loadConfig, saveConfig } from '../config/store';
import { PortKeyConfig } from '../config/schema';

export interface BackupEntry {
  id: string;
  timestamp: string;
  label?: string;
  config: PortKeyConfig;
}

export function getBackupPath(configDir: string): string {
  return path.join(configDir, 'backups.json');
}

export function readBackups(configDir: string): BackupEntry[] {
  const backupPath = getBackupPath(configDir);
  if (!fs.existsSync(backupPath)) return [];
  try {
    const raw = fs.readFileSync(backupPath, 'utf-8');
    return JSON.parse(raw) as BackupEntry[];
  } catch {
    return [];
  }
}

export function writeBackups(configDir: string, backups: BackupEntry[]): void {
  const backupPath = getBackupPath(configDir);
  fs.writeFileSync(backupPath, JSON.stringify(backups, null, 2), 'utf-8');
}

export function createBackup(configDir: string, label?: string): BackupEntry {
  const config = loadConfig(configDir);
  const entry: BackupEntry = {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    timestamp: new Date().toISOString(),
    label,
    config,
  };
  const backups = readBackups(configDir);
  backups.push(entry);
  writeBackups(configDir, backups);
  return entry;
}

export function restoreBackup(configDir: string, id: string): boolean {
  const backups = readBackups(configDir);
  const entry = backups.find((b) => b.id === id);
  if (!entry) return false;
  saveConfig(configDir, entry.config);
  return true;
}

export function deleteBackup(configDir: string, id: string): boolean {
  const backups = readBackups(configDir);
  const index = backups.findIndex((b) => b.id === id);
  if (index === -1) return false;
  backups.splice(index, 1);
  writeBackups(configDir, backups);
  return true;
}

export function listBackups(configDir: string): BackupEntry[] {
  return readBackups(configDir);
}
