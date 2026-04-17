import { loadConfig, saveConfig } from '../config/store';

export async function renameProfile(
  oldName: string,
  newName: string
): Promise<void> {
  const config = await loadConfig();

  if (!config.profiles[oldName]) {
    throw new Error(`Profile '${oldName}' does not exist.`);
  }
  if (config.profiles[newName]) {
    throw new Error(`Profile '${newName}' already exists.`);
  }

  config.profiles[newName] = { ...config.profiles[oldName] };
  delete config.profiles[oldName];

  if (config.activeProfile === oldName) {
    config.activeProfile = newName;
  }

  await saveConfig(config);
}

export async function renamePort(
  profileName: string,
  oldKey: string,
  newKey: string
): Promise<void> {
  const config = await loadConfig();

  const profile = config.profiles[profileName];
  if (!profile) {
    throw new Error(`Profile '${profileName}' does not exist.`);
  }
  if (profile.ports[oldKey] === undefined) {
    throw new Error(`Port key '${oldKey}' does not exist in profile '${profileName}'.`);
  }
  if (profile.ports[newKey] !== undefined) {
    throw new Error(`Port key '${newKey}' already exists in profile '${profileName}'.`);
  }

  profile.ports[newKey] = profile.ports[oldKey];
  delete profile.ports[oldKey];

  await saveConfig(config);
}
