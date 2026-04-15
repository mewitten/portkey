import { describe, it, expect, vi, beforeEach } from 'vitest';
import { checkConfigExists, checkActiveProfile, checkPortConflicts } from './checker';

vi.mock('../config/store');
vi.mock('../profiles/manager');

import { loadConfig } from '../config/store';
import { listProfiles } from '../profiles/manager';

const mockLoadConfig = vi.mocked(loadConfig);
const mockListProfiles = vi.mocked(listProfiles);

beforeEach(() => vi.clearAllMocks());

describe('checkConfigExists', () => {
  it('returns ok when config has profiles', async () => {
    mockLoadConfig.mockResolvedValue({ profiles: { dev: { name: 'dev', ports: {} } }, activeProfile: 'dev' } as any);
    const result = await checkConfigExists();
    expect(result.status).toBe('ok');
  });

  it('returns warn when config has no profiles', async () => {
    mockLoadConfig.mockResolvedValue({ profiles: {}, activeProfile: null } as any);
    const result = await checkConfigExists();
    expect(result.status).toBe('warn');
  });

  it('returns error when config cannot be loaded', async () => {
    mockLoadConfig.mockRejectedValue(new Error('not found'));
    const result = await checkConfigExists();
    expect(result.status).toBe('error');
  });
});

describe('checkActiveProfile', () => {
  it('returns ok when active profile exists', async () => {
    mockLoadConfig.mockResolvedValue({ activeProfile: 'dev', profiles: {} } as any);
    mockListProfiles.mockResolvedValue([{ name: 'dev', ports: {} }] as any);
    const result = await checkActiveProfile();
    expect(result.status).toBe('ok');
  });

  it('returns warn when no active profile is set', async () => {
    mockLoadConfig.mockResolvedValue({ activeProfile: null, profiles: {} } as any);
    const result = await checkActiveProfile();
    expect(result.status).toBe('warn');
  });

  it('returns error when active profile does not exist', async () => {
    mockLoadConfig.mockResolvedValue({ activeProfile: 'ghost', profiles: {} } as any);
    mockListProfiles.mockResolvedValue([{ name: 'dev', ports: {} }] as any);
    const result = await checkActiveProfile();
    expect(result.status).toBe('error');
  });
});

describe('checkPortConflicts', () => {
  it('returns ok when no conflicts', async () => {
    mockListProfiles.mockResolvedValue([
      { name: 'dev', ports: { api: 3000 } },
      { name: 'prod', ports: { api: 4000 } },
    ] as any);
    const result = await checkPortConflicts();
    expect(result.status).toBe('ok');
  });

  it('returns warn when duplicate ports exist', async () => {
    mockListProfiles.mockResolvedValue([
      { name: 'dev', ports: { api: 3000 } },
      { name: 'staging', ports: { api: 3000 } },
    ] as any);
    const result = await checkPortConflicts();
    expect(result.status).toBe('warn');
    expect(result.message).toContain('3000');
  });
});
