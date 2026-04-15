import * as fs from 'fs/promises';
import * as path from 'path';
import { getConfigPath, ensureConfigDir } from '../config/store';

export interface Profile {
  name: string;
  ports: Record<string, number>;
}

interface ProfilesData {
  active: string;
  profiles: Profile[];
}

const PROFILES_FILE = 'profiles.json';

async function getProfilesPath(): Promise<string> {
  const configPath = await getConfigPath();
  return path.join(path.dirname(configPath), PROFILES_FILE);
}

export async function loadProfiles(): Promise<Profile[]> {
  const profilesPath = await getProfilesPath();
  try {
    const raw = await fs.readFile(profilesPath, 'utf-8');
    const data: ProfilesData = JSON.parse(raw);
    return data.profiles ?? [];
  } catch {
    return [];
  }
}

export async function saveProfiles(profiles: Profile[], active: string): Promise<void> {
  await ensureConfigDir();
  const profilesPath = await getProfilesPath();
  const data: ProfilesData = { active, profiles };
  await fs.writeFile(profilesPath, JSON.stringify(data, null, 2), 'utf-8');
}

export async function getActiveProfile(): Promise<string> {
  const profilesPath = await getProfilesPath();
  try {
    const raw = await fs.readFile(profilesPath, 'utf-8');
    const data: ProfilesData = JSON.parse(raw);
    return data.active ?? 'default';
  } catch {
    return 'default';
  }
}

export async function createProfile(name: string): Promise<void> {
  const profiles = await loadProfiles();
  if (profiles.find((p) => p.name === name)) {
    throw new Error(`Profile "${name}" already exists.`);
  }
  const active = await getActiveProfile();
  profiles.push({ name, ports: {} });
  await saveProfiles(profiles, active);
}

export async function deleteProfile(name: string): Promise<void> {
  const profiles = await loadProfiles();
  const index = profiles.findIndex((p) => p.name === name);
  if (index === -1) throw new Error(`Profile "${name}" not found.`);
  const active = await getActiveProfile();
  if (active === name) throw new Error(`Cannot delete the active profile "${name}".`);
  profiles.splice(index, 1);
  await saveProfiles(profiles, active);
}

export async function switchProfile(name: string): Promise<void> {
  const profiles = await loadProfiles();
  if (!profiles.find((p) => p.name === name)) {
    throw new Error(`Profile "${name}" not found.`);
  }
  await saveProfiles(profiles, name);
}
