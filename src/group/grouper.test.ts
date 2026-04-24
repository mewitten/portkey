import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  getGroups,
  getGroup,
  addGroup,
  removeGroup,
  updateGroup,
  addProfileToGroup,
  removeProfileFromGroup,
} from './grouper';

vi.mock('../config/store', () => {
  let store: any = { groups: {} };
  return {
    loadConfig: vi.fn(async () => JSON.parse(JSON.stringify(store))),
    saveConfig: vi.fn(async (cfg: any) => { store = cfg; }),
  };
});

import { loadConfig, saveConfig } from '../config/store';

beforeEach(() => {
  vi.mocked(loadConfig).mockImplementation(async () => ({ groups: {} } as any));
  vi.mocked(saveConfig).mockReset();
});

describe('addGroup', () => {
  it('creates a new group', async () => {
    await addGroup('backend', ['api', 'db'], 'Backend services');
    const saved = vi.mocked(saveConfig).mock.calls[0][0] as any;
    expect(saved.groups['backend']).toEqual({ name: 'backend', profiles: ['api', 'db'], description: 'Backend services' });
  });

  it('throws if group already exists', async () => {
    vi.mocked(loadConfig).mockResolvedValueOnce({ groups: { backend: { name: 'backend', profiles: [] } } } as any);
    await expect(addGroup('backend', [])).rejects.toThrow('already exists');
  });
});

describe('removeGroup', () => {
  it('removes an existing group', async () => {
    vi.mocked(loadConfig).mockResolvedValueOnce({ groups: { backend: { name: 'backend', profiles: [] } } } as any);
    await removeGroup('backend');
    const saved = vi.mocked(saveConfig).mock.calls[0][0] as any;
    expect(saved.groups['backend']).toBeUndefined();
  });

  it('throws if group does not exist', async () => {
    await expect(removeGroup('missing')).rejects.toThrow('does not exist');
  });
});

describe('updateGroup', () => {
  it('updates group description', async () => {
    vi.mocked(loadConfig).mockResolvedValueOnce({ groups: { backend: { name: 'backend', profiles: ['api'] } } } as any);
    await updateGroup('backend', { description: 'Updated' });
    const saved = vi.mocked(saveConfig).mock.calls[0][0] as any;
    expect(saved.groups['backend'].description).toBe('Updated');
  });
});

describe('addProfileToGroup / removeProfileFromGroup', () => {
  it('adds a profile to a group', async () => {
    vi.mocked(loadConfig).mockResolvedValueOnce({ groups: { backend: { name: 'backend', profiles: ['api'] } } } as any);
    await addProfileToGroup('backend', 'db');
    const saved = vi.mocked(saveConfig).mock.calls[0][0] as any;
    expect(saved.groups['backend'].profiles).toContain('db');
  });

  it('throws if profile already in group', async () => {
    vi.mocked(loadConfig).mockResolvedValueOnce({ groups: { backend: { name: 'backend', profiles: ['api'] } } } as any);
    await expect(addProfileToGroup('backend', 'api')).rejects.toThrow('already in group');
  });

  it('removes a profile from a group', async () => {
    vi.mocked(loadConfig).mockResolvedValueOnce({ groups: { backend: { name: 'backend', profiles: ['api', 'db'] } } } as any);
    await removeProfileFromGroup('backend', 'api');
    const saved = vi.mocked(saveConfig).mock.calls[0][0] as any;
    expect(saved.groups['backend'].profiles).not.toContain('api');
  });
});
