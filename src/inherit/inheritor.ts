import { loadConfig, saveConfig } from '../config/store';
import { PortConfig, Profile } from '../config/schema';

export interface InheritanceMap {
  [profileName: string]: string; // child -> parent
}

export function getInheritanceMap(config: PortConfig): InheritanceMap {
  return (config.inheritance as InheritanceMap) ?? {};
}

export function setParent(
  config: PortConfig,
  child: string,
  parent: string
): PortConfig {
  if (!config.profiles[child]) throw new Error(`Profile '${child}' not found`);
  if (!config.profiles[parent]) throw new Error(`Profile '${parent}' not found`);
  if (child === parent) throw new Error('A profile cannot inherit from itself');
  if (wouldCreateCycle(config, child, parent)) {
    throw new Error(`Setting '${parent}' as parent of '${child}' would create a cycle`);
  }
  const inheritance = getInheritanceMap(config);
  inheritance[child] = parent;
  return { ...config, inheritance };
}

export function removeParent(config: PortConfig, child: string): PortConfig {
  const inheritance = { ...getInheritanceMap(config) };
  delete inheritance[child];
  return { ...config, inheritance };
}

export function resolveProfile(
  config: PortConfig,
  profileName: string
): Profile {
  const visited = new Set<string>();
  const chain: Profile[] = [];

  let current: string | undefined = profileName;
  while (current) {
    if (visited.has(current)) break;
    visited.add(current);
    const profile = config.profiles[current];
    if (!profile) break;
    chain.unshift(profile);
    const inheritance = getInheritanceMap(config);
    current = inheritance[current];
  }

  return chain.reduce<Profile>(
    (merged, profile) => ({ ...merged, ...profile }),
    {} as Profile
  );
}

function wouldCreateCycle(
  config: PortConfig,
  child: string,
  parent: string
): boolean {
  const inheritance = getInheritanceMap(config);
  let current: string | undefined = parent;
  const visited = new Set<string>();
  while (current) {
    if (current === child) return true;
    if (visited.has(current)) break;
    visited.add(current);
    current = inheritance[current];
  }
  return false;
}
