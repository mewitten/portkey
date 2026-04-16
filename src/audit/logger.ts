import * as fs from 'fs';
import * as path from 'path';
import { getConfigPath } from '../config/store';

export interface AuditEntry {
  timestamp: string;
  action: string;
  profile?: string;
  details?: Record<string, unknown>;
}

export function getAuditLogPath(): string {
  return path.join(path.dirname(getConfigPath()), 'audit.log');
}

export function writeAuditEntry(entry: Omit<AuditEntry, 'timestamp'>): void {
  const full: AuditEntry = {
    timestamp: new Date().toISOString(),
    ...entry,
  };
  const line = JSON.stringify(full) + '\n';
  fs.appendFileSync(getAuditLogPath(), line, 'utf-8');
}

export function readAuditLog(): AuditEntry[] {
  const logPath = getAuditLogPath();
  if (!fs.existsSync(logPath)) return [];
  const content = fs.readFileSync(logPath, 'utf-8');
  return content
    .split('\n')
    .filter(Boolean)
    .map((line) => JSON.parse(line) as AuditEntry);
}

export function clearAuditLog(): void {
  const logPath = getAuditLogPath();
  if (fs.existsSync(logPath)) {
    fs.writeFileSync(logPath, '', 'utf-8');
  }
}
