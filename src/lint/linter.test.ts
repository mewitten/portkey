import { describe, it, expect } from 'vitest';
import { lintConfig } from './linter';
import { PortConfig } from '../config/schema';

function makeConfig(overrides: Partial<PortConfig> = {}): PortConfig {
  return {
    version: 1,
    active: 'default',
    profiles: {
      default: { ports: { api: 3000, web: 4000 } },
    },
    ...overrides,
  } as PortConfig;
}

describe('lintConfig', () => {
  it('returns valid for a clean config', () => {
    const result = lintConfig(makeConfig());
    expect(result.valid).toBe(true);
    expect(result.issues).toHaveLength(0);
  });

  it('warns when no profiles are defined', () => {
    const result = lintConfig(makeConfig({ profiles: {} }));
    expect(result.valid).toBe(true);
    const warn = result.issues.find((i) => i.message.includes('No profiles'));
    expect(warn).toBeDefined();
    expect(warn?.level).toBe('warning');
  });

  it('warns when a profile has no ports', () => {
    const result = lintConfig(
      makeConfig({ profiles: { empty: { ports: {} } } })
    );
    expect(result.valid).toBe(true);
    const warn = result.issues.find((i) => i.profile === 'empty');
    expect(warn).toBeDefined();
    expect(warn?.level).toBe('warning');
  });

  it('errors when a port is out of range', () => {
    const result = lintConfig(
      makeConfig({
        profiles: { dev: { ports: { api: 99999 } } },
      })
    );
    expect(result.valid).toBe(false);
    const err = result.issues.find((i) => i.level === 'error' && i.key === 'api');
    expect(err).toBeDefined();
  });

  it('errors when a port is not an integer', () => {
    const result = lintConfig(
      makeConfig({
        profiles: { dev: { ports: { api: 3000.5 } } },
      })
    );
    expect(result.valid).toBe(false);
    const err = result.issues.find((i) => i.key === 'api' && i.level === 'error');
    expect(err).toBeDefined();
  });

  it('accumulates multiple issues across profiles', () => {
    const result = lintConfig(
      makeConfig({
        profiles: {
          a: { ports: { x: 99999 } },
          b: { ports: {} },
        },
      })
    );
    expect(result.issues.length).toBeGreaterThanOrEqual(2);
  });
});
