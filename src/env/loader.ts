import * as fs from 'fs';
import * as path from 'path';
import { loadConfig } from '../config/store';
import { generateEnvContent, parseEnvContent } from './generator';

export interface LoadEnvOptions {
  profile?: string;
  outputPath?: string;
  overwrite?: boolean;
}

export async function loadEnvForProfile(
  profile: string,
  outputPath: string,
  overwrite = false
): Promise<void> {
  const config = await loadConfig();
  const profileData = config.profiles?.[profile];
  if (!profileData) {
    throw new Error(`Profile "${profile}" not found.`);
  }

  if (fs.existsSync(outputPath) && !overwrite) {
    throw new Error(
      `File already exists at ${outputPath}. Use --overwrite to replace it.`
    );
  }

  const content = generateEnvContent(profileData.ports ?? {});
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, content, 'utf-8');
}

export async function mergeEnvForProfile(
  profile: string,
  outputPath: string
): Promise<void> {
  const config = await loadConfig();
  const profileData = config.profiles?.[profile];
  if (!profileData) {
    throw new Error(`Profile "${profile}" not found.`);
  }

  let existing: Record<string, number> = {};
  if (fs.existsSync(outputPath)) {
    const raw = fs.readFileSync(outputPath, 'utf-8');
    existing = parseEnvContent(raw);
  }

  const merged = { ...existing, ...(profileData.ports ?? {}) };
  const content = generateEnvContent(merged);
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, content, 'utf-8');
}
