import * as fs from 'fs';
import * as path from 'path';
import { loadConfig } from '../config/store';
import { generateEnvContent } from '../env/generator';

export interface SyncResult {
  profile: string;
  filesWritten: string[];
  errors: string[];
}

export interface SyncOptions {
  outputDir?: string;
  dryRun?: boolean;
}

export async function syncProfile(
  profileName: string,
  options: SyncOptions = {}
): Promise<SyncResult> {
  const config = await loadConfig();
  const result: SyncResult = {
    profile: profileName,
    filesWritten: [],
    errors: [],
  };

  const profile = config.profiles?.[profileName];
  if (!profile) {
    result.errors.push(`Profile "${profileName}" not found`);
    return result;
  }

  const outputDir = options.outputDir ?? process.cwd();
  const envPath = path.join(outputDir, `.env.${profileName}`);
  const envContent = generateEnvContent(profile.ports ?? {});

  if (!options.dryRun) {
    try {
      fs.writeFileSync(envPath, envContent, 'utf-8');
      result.filesWritten.push(envPath);
    } catch (err: any) {
      result.errors.push(`Failed to write ${envPath}: ${err.message}`);
    }
  } else {
    result.filesWritten.push(envPath);
  }

  return result;
}

export async function syncAllProfiles(
  options: SyncOptions = {}
): Promise<SyncResult[]> {
  const config = await loadConfig();
  const profiles = Object.keys(config.profiles ?? {});
  return Promise.all(profiles.map((p) => syncProfile(p, options)));
}
