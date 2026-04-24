import { describe, it, expect } from 'vitest';
import {
  getPresets,
  getPreset,
  savePreset,
  deletePreset,
  applyPreset,
  listPresets,
} from './presetter';
import { PortConfig } from '../config/schema';

function makeConfig(overrides: Partial<PortConfig> = {}): PortConfig {
  return { profiles: {}, activeProfile: null, ...overrides } as PortConfig;
}

describe('presetter', () => {
  it('returns empty presets when none exist', () => {
    expect(getPresets(makeConfig())).toEqual({});
  });

  it('saves and retrieves a preset', () => {
    const config = makeConfig();
    const updated = savePreset(config, 'web', { HTTP: 3000, HTTPS: 3443 }, 'Web defaults');
    const preset = getPreset(updated, 'web');
    expect(preset).toBeDefined();
    expect(preset?.ports).toEqual({ HTTP: 3000, HTTPS: 3443 });
    expect(preset?.description).toBe('Web defaults');
    expect(preset?.name).toBe('web');
  });

  it('lists all presets', () => {
    let config = makeConfig();
    config = savePreset(config, 'web', { HTTP: 3000 });
    config = savePreset(config, 'api', { API: 4000 });
    const list = listPresets(config);
    expect(list).toHaveLength(2);
    expect(list.map((p) => p.name)).toContain('web');
    expect(list.map((p) => p.name)).toContain('api');
  });

  it('deletes a preset', () => {
    let config = makeConfig();
    config = savePreset(config, 'web', { HTTP: 3000 });
    config = deletePreset(config, 'web');
    expect(getPreset(config, 'web')).toBeUndefined();
  });

  it('applies a preset to a profile', () => {
    let config = makeConfig({ profiles: { dev: { EXISTING: 9000 } } } as any);
    config = savePreset(config, 'web', { HTTP: 3000, HTTPS: 3443 });
    config = applyPreset(config, 'web', 'dev');
    expect((config.profiles as any)['dev']).toEqual({ EXISTING: 9000, HTTP: 3000, HTTPS: 3443 });
  });

  it('throws when applying a non-existent preset', () => {
    const config = makeConfig();
    expect(() => applyPreset(config, 'missing', 'dev')).toThrow('Preset "missing" not found.');
  });

  it('creates profile when applying preset to new profile', () => {
    let config = makeConfig();
    config = savePreset(config, 'api', { API: 5000 });
    config = applyPreset(config, 'api', 'newProfile');
    expect((config.profiles as any)['newProfile']).toEqual({ API: 5000 });
  });
});
