import { PortConfig } from '../config/schema';

export type PermissionLevel = 'read' | 'write' | 'admin';

export interface ProfilePermission {
  profile: string;
  level: PermissionLevel;
  users: string[];
}

export interface PermissionStore {
  permissions: ProfilePermission[];
}

export function getPermissions(config: PortConfig): PermissionStore {
  return (config as any).permissions ?? { permissions: [] };
}

export function getProfilePermission(
  config: PortConfig,
  profile: string
): ProfilePermission | undefined {
  const store = getPermissions(config);
  return store.permissions.find((p) => p.profile === profile);
}

export function setProfilePermission(
  config: PortConfig,
  profile: string,
  level: PermissionLevel,
  users: string[]
): PortConfig {
  const store = getPermissions(config);
  const existing = store.permissions.findIndex((p) => p.profile === profile);
  const entry: ProfilePermission = { profile, level, users };
  if (existing >= 0) {
    store.permissions[existing] = entry;
  } else {
    store.permissions.push(entry);
  }
  return { ...config, permissions: store } as PortConfig;
}

export function removeProfilePermission(
  config: PortConfig,
  profile: string
): PortConfig {
  const store = getPermissions(config);
  store.permissions = store.permissions.filter((p) => p.profile !== profile);
  return { ...config, permissions: store } as PortConfig;
}

export function canAccess(
  config: PortConfig,
  profile: string,
  user: string,
  required: PermissionLevel
): boolean {
  const perm = getProfilePermission(config, profile);
  if (!perm) return true; // no restriction
  const levels: PermissionLevel[] = ['read', 'write', 'admin'];
  const userLevel = perm.users.includes(user) ? perm.level : 'read';
  return levels.indexOf(userLevel) >= levels.indexOf(required);
}
