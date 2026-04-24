import { loadConfig, saveConfig } from '../config/store';
import { PortConfig } from '../config/schema';

export interface AliasMap {
  [alias: string]: string; // alias -> profile name
}

export function getAliases(config: PortConfig): AliasMap {
  return config.aliases ?? {};
}

export function resolveAlias(config: PortConfig, nameOrAlias: string): string {
  const aliases = getAliases(config);
  return aliases[nameOrAlias] ?? nameOrAlias;
}

export function addAlias(
  alias: string,
  profileName: string,
  config: PortConfig
): PortConfig {
  if (!config.profiles || !config.profiles[profileName]) {
    throw new Error(`Profile "${profileName}" does not exist.`);
  }
  const existing = getAliases(config);
  if (existing[alias]) {
    throw new Error(
      `Alias "${alias}" already exists and points to "${existing[alias]}". Use update to change it.`
    );
  }
  return {
    ...config,
    aliases: { ...existing, [alias]: profileName },
  };
}

export function removeAlias(alias: string, config: PortConfig): PortConfig {
  const existing = getAliases(config);
  if (!existing[alias]) {
    throw new Error(`Alias "${alias}" does not exist.`);
  }
  const updated = { ...existing };
  delete updated[alias];
  return { ...config, aliases: updated };
}

export function updateAlias(
  alias: string,
  newProfileName: string,
  config: PortConfig
): PortConfig {
  if (!config.profiles || !config.profiles[newProfileName]) {
    throw new Error(`Profile "${newProfileName}" does not exist.`);
  }
  const existing = getAliases(config);
  if (!existing[alias]) {
    throw new Error(`Alias "${alias}" does not exist. Use add to create it.`);
  }
  return {
    ...config,
    aliases: { ...existing, [alias]: newProfileName },
  };
}

export function listAliases(config: PortConfig): Array<{ alias: string; profile: string }> {
  return Object.entries(getAliases(config)).map(([alias, profile]) => ({
    alias,
    profile,
  }));
}
