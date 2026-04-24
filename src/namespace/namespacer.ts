import { loadConfig, saveConfig } from '../config/store';
import { PortConfig } from '../config/schema';

export interface NamespaceEntry {
  name: string;
  prefix: string;
  profiles: string[];
  createdAt: string;
}

export function getNamespaces(config: PortConfig): Record<string, NamespaceEntry> {
  return (config as any).namespaces ?? {};
}

export function addNamespace(
  config: PortConfig,
  name: string,
  prefix: string,
  profiles: string[] = []
): PortConfig {
  const namespaces = getNamespaces(config);
  if (namespaces[name]) {
    throw new Error(`Namespace "${name}" already exists.`);
  }
  const entry: NamespaceEntry = {
    name,
    prefix,
    profiles,
    createdAt: new Date().toISOString(),
  };
  return { ...config, namespaces: { ...namespaces, [name]: entry } } as PortConfig;
}

export function removeNamespace(config: PortConfig, name: string): PortConfig {
  const namespaces = getNamespaces(config);
  if (!namespaces[name]) {
    throw new Error(`Namespace "${name}" not found.`);
  }
  const updated = { ...namespaces };
  delete updated[name];
  return { ...config, namespaces: updated } as PortConfig;
}

export function assignProfileToNamespace(
  config: PortConfig,
  namespace: string,
  profile: string
): PortConfig {
  const namespaces = getNamespaces(config);
  if (!namespaces[namespace]) {
    throw new Error(`Namespace "${namespace}" not found.`);
  }
  const entry = namespaces[namespace];
  if (entry.profiles.includes(profile)) {
    throw new Error(`Profile "${profile}" is already in namespace "${namespace}".`);
  }
  const updated: NamespaceEntry = { ...entry, profiles: [...entry.profiles, profile] };
  return { ...config, namespaces: { ...namespaces, [namespace]: updated } } as PortConfig;
}

export function unassignProfileFromNamespace(
  config: PortConfig,
  namespace: string,
  profile: string
): PortConfig {
  const namespaces = getNamespaces(config);
  if (!namespaces[namespace]) {
    throw new Error(`Namespace "${namespace}" not found.`);
  }
  const entry = namespaces[namespace];
  const profiles = entry.profiles.filter((p) => p !== profile);
  const updated: NamespaceEntry = { ...entry, profiles };
  return { ...config, namespaces: { ...namespaces, [namespace]: updated } } as PortConfig;
}

export function getProfileNamespace(
  config: PortConfig,
  profile: string
): NamespaceEntry | undefined {
  const namespaces = getNamespaces(config);
  return Object.values(namespaces).find((ns) => ns.profiles.includes(profile));
}
