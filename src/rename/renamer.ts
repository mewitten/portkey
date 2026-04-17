import { loadConfig, saveConfig } from '../config/store';

export async function renameProfile(oldName: string, newName: string): Promise<void> {
  const config = await loadConfig();

  if (!config.profiles[oldName]) {
    throw new Error(`Profile not found: ${oldName}`);
  }

  if (config.profiles[newName]) {
    throw new Error(`Profile already exists: ${newName}`);
  }

  config.profiles[newName] = { ...config.profiles[oldName], name: newName };
  delete config.profiles[oldName];

  if (config.activeProfile === oldName) {
    config.activeProfile = newName;
  }

  await saveConfig(config);
}
