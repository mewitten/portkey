import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  createProfile,
  deleteProfile,
  switchProfile,
  getActiveProfile,
  listProfiles,
  loadProfiles,
} from './manager';

vi.mock('../config/store', () => {
  let store: any = {};
  return {
    loadConfig: () => ({ ...store }),
    saveConfig: (cfg: any) => {
      store = { ...cfg };
    },
  };
});

beforeEach(() => {
  vi.resetModules();
});

describe('createProfile', () => {
  it('creates a new profile', () => {
    const profile = createProfile('dev', 'Development');
    expect(profile.name).toBe('dev');
    expect(profile.description).toBe('Development');
    expect(profile.ports).toEqual({});
  });

  it('throws if profile already exists', () => {
    createProfile('staging');
    expect(() => createProfile('staging')).toThrow('already exists');
  });
});

describe('deleteProfile', () => {
  it('deletes an existing profile', () => {
    createProfile('temp');
    deleteProfile('temp');
    const profiles = listProfiles();
    expect(profiles.find((p) => p.name === 'temp')).toBeUndefined();
  });

  it('throws if profile not found', () => {
    expect(() => deleteProfile('nonexistent')).toThrow('not found');
  });
});

describe('switchProfile', () => {
  it('sets the active profile', () => {
    createProfile('prod');
    switchProfile('prod');
    const active = getActiveProfile();
    expect(active?.name).toBe('prod');
  });

  it('throws if profile does not exist', () => {
    expect(() => switchProfile('ghost')).toThrow('not found');
  });
});

describe('listProfiles', () => {
  it('returns all profiles', () => {
    createProfile('alpha');
    createProfile('beta');
    const profiles = listProfiles();
    const names = profiles.map((p) => p.name);
    expect(names).toContain('alpha');
    expect(names).toContain('beta');
  });
});
