import { PortConfig } from '../config/schema';
import { loadConfig, saveConfig } from '../config/store';

export interface ProfileGroup {
  name: string;
  profiles: string[];
  description?: string;
}

export async function getGroups(): Promise<Record<string, ProfileGroup>> {
  const config = await loadConfig();
  return (config.groups as Record<string, ProfileGroup>) ?? {};
}

export async function getGroup(name: string): Promise<ProfileGroup | undefined> {
  const groups = await getGroups();
  return groups[name];
}

export async function addGroup(
  name: string,
  profiles: string[],
  description?: string
): Promise<void> {
  const config = await loadConfig();
  const groups: Record<string, ProfileGroup> = (config.groups as Record<string, ProfileGroup>) ?? {};
  if (groups[name]) {
    throw new Error(`Group "${name}" already exists.`);
  }
  groups[name] = { name, profiles, description };
  await saveConfig({ ...config, groups });
}

export async function removeGroup(name: string): Promise<void> {
  const config = await loadConfig();
  const groups: Record<string, ProfileGroup> = (config.groups as Record<string, ProfileGroup>) ?? {};
  if (!groups[name]) {
    throw new Error(`Group "${name}" does not exist.`);
  }
  delete groups[name];
  await saveConfig({ ...config, groups });
}

export async function updateGroup(
  name: string,
  updates: Partial<Omit<ProfileGroup, 'name'>>
): Promise<void> {
  const config = await loadConfig();
  const groups: Record<string, ProfileGroup> = (config.groups as Record<string, ProfileGroup>) ?? {};
  if (!groups[name]) {
    throw new Error(`Group "${name}" does not exist.`);
  }
  groups[name] = { ...groups[name], ...updates };
  await saveConfig({ ...config, groups });
}

export async function addProfileToGroup(groupName: string, profile: string): Promise<void> {
  const config = await loadConfig();
  const groups: Record<string, ProfileGroup> = (config.groups as Record<string, ProfileGroup>) ?? {};
  if (!groups[groupName]) {
    throw new Error(`Group "${groupName}" does not exist.`);
  }
  if (groups[groupName].profiles.includes(profile)) {
    throw new Error(`Profile "${profile}" is already in group "${groupName}".`);
  }
  groups[groupName].profiles.push(profile);
  await saveConfig({ ...config, groups });
}

export async function removeProfileFromGroup(groupName: string, profile: string): Promise<void> {
  const config = await loadConfig();
  const groups: Record<string, ProfileGroup> = (config.groups as Record<string, ProfileGroup>) ?? {};
  if (!groups[groupName]) {
    throw new Error(`Group "${groupName}" does not exist.`);
  }
  groups[groupName].profiles = groups[groupName].profiles.filter((p) => p !== profile);
  await saveConfig({ ...config, groups });
}
