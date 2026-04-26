import { describe, it, expect } from 'vitest';
import {
  getInheritanceMap,
  setParent,
  removeParent,
  resolveProfile,
} from './inheritor';
import { PortConfig } from '../config/schema';

function makeConfig(overrides: Partial<PortConfig> = {}): PortConfig {
  return {
    activeProfile: 'base',
    profiles: {
      base: { API_PORT: 3000, DB_PORT: 5432 },
      dev: { API_PORT: 4000 },
      local: { REDIS_PORT: 6379 },
    },
    ...overrides,
  } as unknown as PortConfig;
}

describe('getInheritanceMap', () => {
  it('returns empty object when no inheritance set', () => {
    expect(getInheritanceMap(makeConfig())).toEqual({});
  });

  it('returns existing inheritance map', () => {
    const config = makeConfig({ inheritance: { dev: 'base' } } as any);
    expect(getInheritanceMap(config)).toEqual({ dev: 'base' });
  });
});

describe('setParent', () => {
  it('sets a parent for a child profile', () => {
    const config = makeConfig();
    const updated = setParent(config, 'dev', 'base');
    expect((updated as any).inheritance).toEqual({ dev: 'base' });
  });

  it('throws if child profile does not exist', () => {
    expect(() => setParent(makeConfig(), 'ghost', 'base')).toThrow("Profile 'ghost' not found");
  });

  it('throws if parent profile does not exist', () => {
    expect(() => setParent(makeConfig(), 'dev', 'ghost')).toThrow("Profile 'ghost' not found");
  });

  it('throws if child equals parent', () => {
    expect(() => setParent(makeConfig(), 'dev', 'dev')).toThrow('cannot inherit from itself');
  });

  it('throws on cycle detection', () => {
    const config = makeConfig({ inheritance: { base: 'dev' } } as any);
    expect(() => setParent(config, 'dev', 'base')).toThrow('cycle');
  });
});

describe('removeParent', () => {
  it('removes parent from child profile', () => {
    const config = makeConfig({ inheritance: { dev: 'base' } } as any);
    const updated = removeParent(config, 'dev');
    expect((updated as any).inheritance).toEqual({});
  });
});

describe('resolveProfile', () => {
  it('returns own profile when no parent', () => {
    const resolved = resolveProfile(makeConfig(), 'dev');
    expect(resolved).toMatchObject({ API_PORT: 4000 });
  });

  it('merges parent ports into child, child wins', () => {
    const config = makeConfig({ inheritance: { dev: 'base' } } as any);
    const resolved = resolveProfile(config, 'dev');
    expect(resolved).toMatchObject({ API_PORT: 4000, DB_PORT: 5432 });
  });

  it('handles multi-level inheritance', () => {
    const config = makeConfig({ inheritance: { local: 'dev', dev: 'base' } } as any);
    const resolved = resolveProfile(config, 'local');
    expect(resolved).toMatchObject({ API_PORT: 4000, DB_PORT: 5432, REDIS_PORT: 6379 });
  });
});
