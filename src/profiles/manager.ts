import { loadConfig, saveConfig } from '../config/store';
import { PortConfig } from '../config/schema';

export interface Profile {
  name: string;
  description?: string;
  ports: Record<string, number>;
  createdAt: string;
  updatedAt: string;
}

export interface ProfilesData {
  activeProfile: string | null;
  profiles: Record<string, Profile>;
}

export function loadProfiles(): ProfilesData {
  const config = loadConfig();
  return (
    (config as any).profilesData ?? {
      activeProfile: null,
      profiles: {},
    }
  );
}

export function saveProfiles(data: ProfilesData): void {
  const config = loadConfig();
  (config as any).profilesData = data;
  saveConfig(config);
}

export function createProfile(name: string, description?: string): Profile {
  const data = loadProfiles();
  if (data.profiles[name]) {
    throw new Error(`Profile "${name}" already exists.`);
  }
  const now = new Date().toISOString();
  const profile: Profile = { name, description, ports: {}, createdAt: now, updatedAt: now };
  data.profiles[name] = profile;
  saveProfiles(data);
  return profile;
}

export function deleteProfile(name: string): void {
  const data = loadProfiles();
  if (!data.profiles[name]) {
    throw new Error(`Profile "${name}" not found.`);
  }
  if (data.activeProfile === name) {
    data.activeProfile = null;
  }
  delete data.profiles[name];
  saveProfiles(data);
}

export function switchProfile(name: string): void {
  const data = loadProfiles();
  if (!data.profiles[name]) {
    throw new Error(`Profile "${name}" not found.`);
  }
  data.activeProfile = name;
  saveProfiles(data);
}

export function getActiveProfile(): Profile | null {
  const data = loadProfiles();
  if (!data.activeProfile) return null;
  return data.profiles[data.activeProfile] ?? null;
}

export function listProfiles(): Profile[] {
  const data = loadProfiles();
  return Object.values(data.profiles);
}
