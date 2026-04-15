import * as fs from 'fs';
import * as path from 'path';
import { loadConfig } from '../config/store';
import { loadProfiles } from '../profiles/manager';

export type ExportFormat = 'json' | 'env' | 'dotenv';

export interface ExportOptions {
  format: ExportFormat;
  profile?: string;
  outputPath?: string;
}

export function exportConfig(options: ExportOptions): string {
  const config = loadConfig();
  const profiles = loadProfiles();

  const activeProfile = options.profile ?? config.activeProfile;
  const profile = profiles[activeProfile];

  if (!profile) {
    throw new Error(`Profile "${activeProfile}" not found.`);
  }

  let output: string;

  switch (options.format) {
    case 'json':
      output = JSON.stringify({ profile: activeProfile, ports: profile.ports }, null, 2);
      break;
    case 'env':
    case 'dotenv':
      output = Object.entries(profile.ports)
        .map(([name, port]) => `${name.toUpperCase()}_PORT=${port}`)
        .join('\n');
      break;
    default:
      throw new Error(`Unsupported export format: ${options.format}`);
  }

  if (options.outputPath) {
    const resolved = path.resolve(options.outputPath);
    fs.writeFileSync(resolved, output, 'utf-8');
  }

  return output;
}
