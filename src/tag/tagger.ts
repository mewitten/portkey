import { loadConfig, saveConfig } from '../config/store';

export async function addTag(profileName: string, tag: string): Promise<void> {
  const config = await loadConfig();
  const profile = config.profiles[profileName];
  if (!profile) throw new Error(`Profile '${profileName}' not found`);
  if (!profile.tags) profile.tags = [];
  if (profile.tags.includes(tag)) throw new Error(`Tag '${tag}' already exists on profile '${profileName}'`);
  profile.tags.push(tag);
  await saveConfig(config);
}

export async function removeTag(profileName: string, tag: string): Promise<void> {
  const config = await loadConfig();
  const profile = config.profiles[profileName];
  if (!profile) throw new Error(`Profile '${profileName}' not found`);
  if (!profile.tags || !profile.tags.includes(tag)) throw new Error(`Tag '${tag}' not found on profile '${profileName}'`);
  profile.tags = profile.tags.filter((t: string) => t !== tag);
  await saveConfig(config);
}

export async function listByTag(tag: string): Promise<string[]> {
  const config = await loadConfig();
  return Object.entries(config.profiles)
    .filter(([, p]: [string, any]) => Array.isArray(p.tags) && p.tags.includes(tag))
    .map(([name]) => name);
}

export async function listTags(profileName: string): Promise<string[]> {
  const config = await loadConfig();
  const profile = config.profiles[profileName];
  if (!profile) throw new Error(`Profile '${profileName}' not found`);
  return profile.tags || [];
}
