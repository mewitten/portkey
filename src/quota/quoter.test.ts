import { describe, it, expect } from 'vitest';
import { checkQuota, isWithinQuota, DEFAULT_QUOTA, QuotaRule } from './quoter';
import { PortConfig } from '../config/schema';

function makeConfig(overrides: Partial<PortConfig> = {}): PortConfig {
  return {
    version: 1,
    active: 'default',
    profiles: {
      default: { ports: { web: 3000, api: 4000 } },
    },
    ...overrides,
  };
}

describe('checkQuota', () => {
  it('returns no violations for a valid config', () => {
    const config = makeConfig();
    expect(checkQuota(config)).toEqual([]);
  });

  it('detects too many profiles', () => {
    const profiles: Record<string, { ports: Record<string, number> }> = {};
    for (let i = 0; i < 51; i++) {
      profiles[`profile${i}`] = { ports: { web: 3000 + i } };
    }
    const config = makeConfig({ profiles });
    const violations = checkQuota(config);
    expect(violations.some(v => v.rule === 'maxProfiles')).toBe(true);
  });

  it('detects too many ports in a single profile', () => {
    const ports: Record<string, number> = {};
    for (let i = 0; i < 21; i++) {
      ports[`service${i}`] = 3000 + i;
    }
    const config = makeConfig({ profiles: { big: { ports } } });
    const violations = checkQuota(config);
    expect(violations.some(v => v.rule === 'maxPortsPerProfile')).toBe(true);
    expect(violations[0].message).toContain('big');
  });

  it('detects port below minimum range', () => {
    const config = makeConfig({
      profiles: { dev: { ports: { db: 80 } } },
    });
    const violations = checkQuota(config);
    expect(violations.some(v => v.rule === 'portRangeMin')).toBe(true);
  });

  it('detects port above maximum range', () => {
    const config = makeConfig({
      profiles: { dev: { ports: { db: 70000 } } },
    });
    const violations = checkQuota(config);
    expect(violations.some(v => v.rule === 'portRangeMax')).toBe(true);
  });

  it('respects custom quota rules', () => {
    const customQuota: QuotaRule = { ...DEFAULT_QUOTA, maxPortsPerProfile: 1 };
    const config = makeConfig();
    const violations = checkQuota(config, customQuota);
    expect(violations.some(v => v.rule === 'maxPortsPerProfile')).toBe(true);
  });
});

describe('isWithinQuota', () => {
  it('returns true for a valid config', () => {
    expect(isWithinQuota(makeConfig())).toBe(true);
  });

  it('returns false when violations exist', () => {
    const config = makeConfig({
      profiles: { dev: { ports: { db: 80 } } },
    });
    expect(isWithinQuota(config)).toBe(false);
  });
});
