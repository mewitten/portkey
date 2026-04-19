import * as fs from 'fs';
import * as path from 'path';
import { loadConfig, saveConfig } from '../config/store';
import { validatePortConfig } from '../config/schema';

export type ImportFormat = 'json' | 'env';

export function detectFormat(filePath: string): ImportFormat {
  const ext = path.extname(filePath).toLowerCase();
  if (ext === '.env' || path.basename(filePath).startsWith('.env')) return 'env';
  return 'json';
}

export function parseEnvImport(content: string): Record<string, number> {
  const ports: Record<string, number> = {};
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const [key, value] = trimmed.split('=');
    if (!key || !value) continue;
    const port = parseInt(value.trim(), 10);
    if (!isNaN(port)) {
      ports[key.trim()] = port;
    }
  }
  return ports;
}

export async function importConfig(
  filePath: string,
  profileName: string,
  options: { merge?: boolean; format?: ImportFormat } = {}
): Promise<{ imported: number; skipped: number }> {
  if (!fs.existsSync(filePath)) {
    throw new Error(`File not found: ${filePath}`);
  }

  const content = fs.readFileSync(filePath, 'utf-8');
  const format = options.format ?? detectFormat(filePath);

  let ports: Record<string, number>;
  if (format === 'env') {
    ports = parseEnvImport(content);
  } else {
    const parsed = JSON.parse(content);
    ports = parsed.ports ?? parsed;
  }

  const config = await loadConfig();
  const existing = config.profiles[profileName]?.ports ?? {};

  let imported = 0;
  let skipped = 0;

  const merged = options.merge ? { ...existing } : {};
  for (const [key, value] of Object.entries(ports)) {
    if (options.merge && existing[key] !== undefined) {
      skipped++;
      continue;
    }
    merged[key] = value;
    imported++;
  }

  const updatedProfile = { ...(config.profiles[profileName] ?? { name: profileName }), ports: merged };
  validatePortConfig(updatedProfile);

  config.profiles[profileName] = updatedProfile;
  await saveConfig(config);

  return { imported, skipped };
}
