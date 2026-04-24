import {
  getNamespaces,
  addNamespace,
  removeNamespace,
  assignProfileToNamespace,
  unassignProfileFromNamespace,
  getProfileNamespace,
} from './namespacer';
import { PortConfig } from '../config/schema';

function makeConfig(extra: Partial<PortConfig> = {}): PortConfig {
  return {
    version: 1,
    activeProfile: 'default',
    profiles: {
      default: { ports: { web: 3000 } },
      api: { ports: { server: 4000 } },
    },
    ...extra,
  } as PortConfig;
}

describe('getNamespaces', () => {
  it('returns empty object when no namespaces exist', () => {
    expect(getNamespaces(makeConfig())).toEqual({});
  });

  it('returns existing namespaces', () => {
    const ns = { frontend: { name: 'frontend', prefix: 'fe', profiles: [], createdAt: '' } };
    expect(getNamespaces(makeConfig({ namespaces: ns } as any))).toEqual(ns);
  });
});

describe('addNamespace', () => {
  it('adds a new namespace', () => {
    const config = addNamespace(makeConfig(), 'frontend', 'fe');
    const ns = getNamespaces(config);
    expect(ns['frontend']).toBeDefined();
    expect(ns['frontend'].prefix).toBe('fe');
    expect(ns['frontend'].profiles).toEqual([]);
  });

  it('throws if namespace already exists', () => {
    const config = addNamespace(makeConfig(), 'frontend', 'fe');
    expect(() => addNamespace(config, 'frontend', 'fe2')).toThrow('already exists');
  });

  it('stores provided profiles', () => {
    const config = addNamespace(makeConfig(), 'backend', 'be', ['api']);
    expect(getNamespaces(config)['backend'].profiles).toContain('api');
  });
});

describe('removeNamespace', () => {
  it('removes an existing namespace', () => {
    let config = addNamespace(makeConfig(), 'frontend', 'fe');
    config = removeNamespace(config, 'frontend');
    expect(getNamespaces(config)['frontend']).toBeUndefined();
  });

  it('throws if namespace does not exist', () => {
    expect(() => removeNamespace(makeConfig(), 'ghost')).toThrow('not found');
  });
});

describe('assignProfileToNamespace', () => {
  it('assigns a profile to a namespace', () => {
    let config = addNamespace(makeConfig(), 'backend', 'be');
    config = assignProfileToNamespace(config, 'backend', 'api');
    expect(getNamespaces(config)['backend'].profiles).toContain('api');
  });

  it('throws if profile already assigned', () => {
    let config = addNamespace(makeConfig(), 'backend', 'be', ['api']);
    expect(() => assignProfileToNamespace(config, 'backend', 'api')).toThrow('already in namespace');
  });
});

describe('unassignProfileFromNamespace', () => {
  it('removes a profile from a namespace', () => {
    let config = addNamespace(makeConfig(), 'backend', 'be', ['api']);
    config = unassignProfileFromNamespace(config, 'backend', 'api');
    expect(getNamespaces(config)['backend'].profiles).not.toContain('api');
  });
});

describe('getProfileNamespace', () => {
  it('returns the namespace containing the profile', () => {
    const config = addNamespace(makeConfig(), 'backend', 'be', ['api']);
    const ns = getProfileNamespace(config, 'api');
    expect(ns?.name).toBe('backend');
  });

  it('returns undefined if profile is not in any namespace', () => {
    expect(getProfileNamespace(makeConfig(), 'default')).toBeUndefined();
  });
});
