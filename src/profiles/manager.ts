import { PortConfig } from '../config/schema';

export interface Profile {
  ports: Record<string, number>;
}

export interface ConfigWithProfiles extends PortConfig {
  activeProfile?: string | null;
  profiles?: Record<string, Profile>;
}

export function getProfile(
  config: ConfigWithProfiles,
  name: string
): Profile | undefined {
  return config.profiles?.[name];
}

export function listProfiles(config: ConfigWithProfiles): string[] {
  return Object.keys(config.profiles ?? {});
}

export function addProfile(
  config: ConfigWithProfiles,
  name: string,
  ports: Record<string, number>
): ConfigWithProfiles {
  if (!config.profiles) config.profiles = {};
  if (config.profiles[name]) {
    throw new Error(`Profile "${name}" already exists.`);
  }
  config.profiles[name] = { ports };
  return config;
}

export function removeProfile(
  config: ConfigWithProfiles,
  name: string
): ConfigWithProfiles {
  if (!config.profiles?.[name]) {
    throw new Error(`Profile "${name}" not found.`);
  }
  delete config.profiles[name];
  if (config.activeProfile === name) {
    config.activeProfile = null;
  }
  return config;
}

export function updateProfile(
  config: ConfigWithProfiles,
  name: string,
  ports: Record<string, number>
): ConfigWithProfiles {
  if (!config.profiles?.[name]) {
    throw new Error(`Profile "${name}" not found.`);
  }
  config.profiles[name] = { ports: { ...config.profiles[name].ports, ...ports } };
  return config;
}
