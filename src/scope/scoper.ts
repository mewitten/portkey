import { PortConfig } from '../config/schema';

export interface ScopeEntry {
  profile: string;
  keys: string[];
}

export interface ScopeMap {
  [scope: string]: ScopeEntry[];
}

export function getScopes(config: PortConfig): ScopeMap {
  return (config as any).scopes ?? {};
}

export function addScope(
  config: PortConfig,
  scope: string,
  profile: string,
  keys: string[]
): PortConfig {
  const scopes = getScopes(config);
  const existing = scopes[scope] ?? [];
  const idx = existing.findIndex((e) => e.profile === profile);
  if (idx >= 0) {
    existing[idx] = { profile, keys };
  } else {
    existing.push({ profile, keys });
  }
  return { ...config, scopes: { ...scopes, [scope]: existing } } as any;
}

export function removeScope(config: PortConfig, scope: string): PortConfig {
  const scopes = { ...getScopes(config) };
  delete scopes[scope];
  return { ...config, scopes } as any;
}

export function getProfilesInScope(
  config: PortConfig,
  scope: string
): ScopeEntry[] {
  return getScopes(config)[scope] ?? [];
}

export function getScopesForProfile(
  config: PortConfig,
  profile: string
): string[] {
  const scopes = getScopes(config);
  return Object.entries(scopes)
    .filter(([, entries]) => entries.some((e) => e.profile === profile))
    .map(([scope]) => scope);
}

export function resolveScope(
  config: PortConfig,
  scope: string
): Record<string, number> {
  const entries = getProfilesInScope(config, scope);
  const profiles = (config as any).profiles ?? {};
  const result: Record<string, number> = {};
  for (const { profile, keys } of entries) {
    const ports = profiles[profile]?.ports ?? {};
    for (const key of keys) {
      if (key in ports) {
        result[`${profile}.${key}`] = ports[key];
      }
    }
  }
  return result;
}
