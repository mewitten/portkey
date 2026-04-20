import * as fs from 'fs';
import * as path from 'path';
import { PortConfig } from '../config/schema';

export type ImportFormat = 'env' | 'json' | 'yaml';

export function detectFormat(filePath: string): ImportFormat {
  const ext = path.extname(filePath).toLowerCase();
  if (ext === '.json') return 'json';
  if (ext === '.yaml' || ext === '.yml') return 'yaml';
  return 'env';
}

export function parseEnvImport(content: string): Record<string, number> {
  const ports: Record<string, number> = {};
  const lines = content.split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    const val = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, '');
    const port = parseInt(val, 10);
    if (!isNaN(port) && port > 0 && port <= 65535) {
      ports[key] = port;
    }
  }
  return ports;
}

export function parseJsonImport(content: string): Record<string, number> {
  const parsed = JSON.parse(content);
  const ports: Record<string, number> = {};
  const source = parsed.ports ?? parsed;
  for (const [key, val] of Object.entries(source)) {
    const port = Number(val);
    if (!isNaN(port) && port > 0 && port <= 65535) {
      ports[key] = port;
    }
  }
  return ports;
}

export function importConfig(
  filePath: string,
  profileName: string
): { profile: string; ports: Record<string, number> } {
  if (!fs.existsSync(filePath)) {
    throw new Error(`File not found: ${filePath}`);
  }
  const content = fs.readFileSync(filePath, 'utf-8');
  const format = detectFormat(filePath);
  let ports: Record<string, number>;
  if (format === 'json') {
    ports = parseJsonImport(content);
  } else if (format === 'yaml') {
    throw new Error('YAML import not yet supported. Convert to JSON or .env format.');
  } else {
    ports = parseEnvImport(content);
  }
  if (Object.keys(ports).length === 0) {
    throw new Error('No valid port entries found in file.');
  }
  return { profile: profileName, ports };
}
