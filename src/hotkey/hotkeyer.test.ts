import { describe, it, expect } from 'vitest';
import {
  getHotkeys,
  getProfileForHotkey,
  addHotkey,
  removeHotkey,
  updateHotkey,
  listHotkeys,
} from './hotkeyer';
import { PortConfig } from '../config/schema';

function makeConfig(overrides: Partial<PortConfig> = {}): PortConfig {
  return {
    version: 1,
    activeProfile: 'dev',
    profiles: {
      dev: { ports: { app: 3000 } },
      staging: { ports: { app: 4000 } },
    },
    hotkeys: { d: 'dev' },
    ...overrides,
  } as unknown as PortConfig;
}

describe('getHotkeys', () => {
  it('returns hotkeys map from config', () => {
    const config = makeConfig();
    expect(getHotkeys(config)).toEqual({ d: 'dev' });
  });

  it('returns empty object when no hotkeys defined', () => {
    const config = makeConfig({ hotkeys: undefined });
    expect(getHotkeys(config)).toEqual({});
  });
});

describe('getProfileForHotkey', () => {
  it('returns profile name for a known shortcut', () => {
    const config = makeConfig();
    expect(getProfileForHotkey(config, 'd')).toBe('dev');
  });

  it('returns undefined for unknown shortcut', () => {
    const config = makeConfig();
    expect(getProfileForHotkey(config, 'x')).toBeUndefined();
  });
});

describe('addHotkey', () => {
  it('adds a new hotkey assignment', () => {
    const config = makeConfig();
    const updated = addHotkey(config, 's', 'staging');
    expect((updated.hotkeys as any)['s']).toBe('staging');
  });

  it('throws if shortcut already assigned', () => {
    const config = makeConfig();
    expect(() => addHotkey(config, 'd', 'staging')).toThrow("Hotkey 'd' is already assigned");
  });

  it('throws if profile does not exist', () => {
    const config = makeConfig();
    expect(() => addHotkey(config, 'z', 'nonexistent')).toThrow("Profile 'nonexistent' does not exist");
  });
});

describe('removeHotkey', () => {
  it('removes an existing hotkey', () => {
    const config = makeConfig();
    const updated = removeHotkey(config, 'd');
    expect((updated.hotkeys as any)['d']).toBeUndefined();
  });

  it('throws if hotkey not assigned', () => {
    const config = makeConfig();
    expect(() => removeHotkey(config, 'x')).toThrow("Hotkey 'x' is not assigned");
  });
});

describe('updateHotkey', () => {
  it('updates an existing hotkey to a new profile', () => {
    const config = makeConfig();
    const updated = updateHotkey(config, 'd', 'staging');
    expect((updated.hotkeys as any)['d']).toBe('staging');
  });

  it('throws if hotkey does not exist', () => {
    const config = makeConfig();
    expect(() => updateHotkey(config, 'z', 'dev')).toThrow("Hotkey 'z' is not assigned");
  });
});

describe('listHotkeys', () => {
  it('returns array of shortcut/profile pairs', () => {
    const config = makeConfig({ hotkeys: { d: 'dev', s: 'staging' } } as any);
    const list = listHotkeys(config);
    expect(list).toContainEqual({ shortcut: 'd', profile: 'dev' });
    expect(list).toContainEqual({ shortcut: 's', profile: 'staging' });
  });

  it('returns empty array when no hotkeys', () => {
    const config = makeConfig({ hotkeys: undefined });
    expect(listHotkeys(config)).toEqual([]);
  });
});
