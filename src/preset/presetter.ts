import { PortConfig } from '../config/schema';
import { loadConfig, saveConfig } from '../config/store';

export interface Preset {
  name: string;
  description?: string;
  ports: Record<string, number>;
  createdAt: string;
}

export function getPresets(config: PortConfig): Record<string, Preset> {
  return (config as any).presets ?? {};
}

export function getPreset(config: PortConfig, name: string): Preset | undefined {
  return getPresets(config)[name];
}

export function savePreset(
  config: PortConfig,
  name: string,
  ports: Record<string, number>,
  description?: string
): PortConfig {
  const presets = getPresets(config);
  presets[name] = {
    name,
    description,
    ports,
    createdAt: new Date().toISOString(),
  };
  return { ...config, presets } as PortConfig;
}

export function deletePreset(config: PortConfig, name: string): PortConfig {
  const presets = { ...getPresets(config) };
  delete presets[name];
  return { ...config, presets } as PortConfig;
}

export function applyPreset(
  config: PortConfig,
  presetName: string,
  targetProfile: string
): PortConfig {
  const preset = getPreset(config, presetName);
  if (!preset) {
    throw new Error(`Preset "${presetName}" not found.`);
  }
  const profiles = { ...(config.profiles ?? {}) };
  const existing = profiles[targetProfile] ?? {};
  profiles[targetProfile] = { ...existing, ...preset.ports };
  return { ...config, profiles };
}

export function listPresets(config: PortConfig): Preset[] {
  return Object.values(getPresets(config));
}
