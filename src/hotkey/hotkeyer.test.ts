import { describe, it, expect } from 'vitest';
import {
  getHotkeys,
  getProfileForHotkey,
  addHotkey,
  removeHotkey,
  updateHotkey,
  listHotkeys,
} from './hotkeyer';
import { PortkeyConfig } from '../config/schema';

function makeConfig(hotkeys: any[] = []): PortkeyConfig {
  return { profiles: {}, activeProfile: null, hotkeys } as any;
}

describe('getHotkeys', () => {
  it('returns empty array when no hotkeys', () => {
    expect(getHotkeys(makeConfig())).toEqual([]);
  });

  it('returns existing hotkeys', () => {
    const cfg = makeConfig([{ key: 'ctrl+1', profile: 'dev' }]);
    expect(getHotkeys(cfg)).toHaveLength(1);
  });
});

describe('getProfileForHotkey', () => {
  it('returns profile for known key', () => {
    const cfg = makeConfig([{ key: 'ctrl+1', profile: 'dev' }]);
    expect(getProfileForHotkey(cfg, 'ctrl+1')).toBe('dev');
  });

  it('returns undefined for unknown key', () => {
    expect(getProfileForHotkey(makeConfig(), 'ctrl+9')).toBeUndefined();
  });
});

describe('addHotkey', () => {
  it('adds a new hotkey entry', () => {
    const cfg = makeConfig();
    const updated = addHotkey(cfg, { key: 'ctrl+1', profile: 'dev', description: 'Dev env' });
    expect(getHotkeys(updated)).toHaveLength(1);
    expect(getHotkeys(updated)[0].profile).toBe('dev');
  });

  it('throws if hotkey already exists', () => {
    const cfg = makeConfig([{ key: 'ctrl+1', profile: 'dev' }]);
    expect(() => addHotkey(cfg, { key: 'ctrl+1', profile: 'staging' })).toThrow();
  });
});

describe('removeHotkey', () => {
  it('removes an existing hotkey', () => {
    const cfg = makeConfig([{ key: 'ctrl+1', profile: 'dev' }]);
    const updated = removeHotkey(cfg, 'ctrl+1');
    expect(getHotkeys(updated)).toHaveLength(0);
  });

  it('throws if hotkey not found', () => {
    expect(() => removeHotkey(makeConfig(), 'ctrl+1')).toThrow();
  });
});

describe('updateHotkey', () => {
  it('updates description of existing hotkey', () => {
    const cfg = makeConfig([{ key: 'ctrl+1', profile: 'dev' }]);
    const updated = updateHotkey(cfg, 'ctrl+1', { description: 'Updated' });
    expect(getHotkeys(updated)[0].description).toBe('Updated');
  });

  it('throws if hotkey not found', () => {
    expect(() => updateHotkey(makeConfig(), 'ctrl+9', { profile: 'prod' })).toThrow();
  });
});

describe('listHotkeys', () => {
  it('returns all hotkeys', () => {
    const cfg = makeConfig([
      { key: 'ctrl+1', profile: 'dev' },
      { key: 'ctrl+2', profile: 'prod' },
    ]);
    expect(listHotkeys(cfg)).toHaveLength(2);
  });
});
