import {
  getPermissions,
  getProfilePermission,
  setProfilePermission,
  removeProfilePermission,
  canAccess,
} from './permissioner';
import { PortConfig } from '../config/schema';

function makeConfig(overrides: Partial<PortConfig> = {}): PortConfig {
  return {
    version: 1,
    activeProfile: 'default',
    profiles: { default: { ports: { web: 3000 } } },
    ...overrides,
  } as PortConfig;
}

describe('getPermissions', () => {
  it('returns empty store when no permissions set', () => {
    const config = makeConfig();
    expect(getPermissions(config)).toEqual({ permissions: [] });
  });
});

describe('setProfilePermission', () => {
  it('adds a new permission entry', () => {
    const config = makeConfig();
    const updated = setProfilePermission(config, 'default', 'write', ['alice']);
    const perm = getProfilePermission(updated, 'default');
    expect(perm).toEqual({ profile: 'default', level: 'write', users: ['alice'] });
  });

  it('updates an existing permission entry', () => {
    let config = makeConfig();
    config = setProfilePermission(config, 'default', 'read', ['bob']);
    config = setProfilePermission(config, 'default', 'admin', ['bob', 'carol']);
    const perm = getProfilePermission(config, 'default');
    expect(perm?.level).toBe('admin');
    expect(perm?.users).toContain('carol');
  });
});

describe('removeProfilePermission', () => {
  it('removes an existing permission', () => {
    let config = makeConfig();
    config = setProfilePermission(config, 'default', 'write', ['alice']);
    config = removeProfilePermission(config, 'default');
    expect(getProfilePermission(config, 'default')).toBeUndefined();
  });
});

describe('canAccess', () => {
  it('allows access when no permission is set', () => {
    const config = makeConfig();
    expect(canAccess(config, 'default', 'anyone', 'admin')).toBe(true);
  });

  it('grants access for user with sufficient level', () => {
    let config = makeConfig();
    config = setProfilePermission(config, 'default', 'write', ['alice']);
    expect(canAccess(config, 'default', 'alice', 'write')).toBe(true);
    expect(canAccess(config, 'default', 'alice', 'read')).toBe(true);
  });

  it('denies access for user with insufficient level', () => {
    let config = makeConfig();
    config = setProfilePermission(config, 'default', 'write', ['alice']);
    expect(canAccess(config, 'default', 'alice', 'admin')).toBe(false);
  });

  it('denies write access for unknown user', () => {
    let config = makeConfig();
    config = setProfilePermission(config, 'default', 'admin', ['alice']);
    expect(canAccess(config, 'default', 'bob', 'write')).toBe(false);
  });
});
