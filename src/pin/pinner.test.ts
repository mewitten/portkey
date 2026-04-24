import { describe, it, expect, vi, beforeEach } from 'vitest';
import { pinPort, unpinPort, getPinnedPorts, isPinned } from './pinner';
import * as store from '../config/store';

const makeConfig = (pins: any[] = []) => ({
  profiles: {
    dev: { ports: { api: 3000, web: 8080 } },
  },
  active: 'dev',
  pins,
});

beforeEach(() => vi.restoreAllMocks());

describe('pinPort', () => {
  it('pins an existing port key', async () => {
    const cfg = makeConfig();
    vi.spyOn(store, 'loadConfig').mockResolvedValue(cfg as any);
    const save = vi.spyOn(store, 'saveConfig').mockResolvedValue();
    const result = await pinPort('dev', 'api');
    expect(result.port).toBe(3000);
    expect(result.key).toBe('api');
    expect(save).toHaveBeenCalled();
  });

  it('throws if profile not found', async () => {
    vi.spyOn(store, 'loadConfig').mockResolvedValue(makeConfig() as any);
    await expect(pinPort('prod', 'api')).rejects.toThrow("Profile 'prod' not found");
  });

  it('throws if key not found', async () => {
    vi.spyOn(store, 'loadConfig').mockResolvedValue(makeConfig() as any);
    await expect(pinPort('dev', 'db')).rejects.toThrow("Port key 'db' not found");
  });

  it('throws if already pinned', async () => {
    const cfg = makeConfig([{ profile: 'dev', key: 'api', port: 3000, pinnedAt: '' }]);
    vi.spyOn(store, 'loadConfig').mockResolvedValue(cfg as any);
    await expect(pinPort('dev', 'api')).rejects.toThrow('already pinned');
  });
});

describe('unpinPort', () => {
  it('removes a pin', async () => {
    const cfg = makeConfig([{ profile: 'dev', key: 'api', port: 3000, pinnedAt: '' }]);
    vi.spyOn(store, 'loadConfig').mockResolvedValue(cfg as any);
    const save = vi.spyOn(store, 'saveConfig').mockResolvedValue();
    await unpinPort('dev', 'api');
    expect(save).toHaveBeenCalled();
  });

  it('throws if pin not found', async () => {
    vi.spyOn(store, 'loadConfig').mockResolvedValue(makeConfig() as any);
    await expect(unpinPort('dev', 'web')).rejects.toThrow('No pins found');
  });
});

describe('isPinned', () => {
  it('returns true for pinned port', async () => {
    const cfg = makeConfig([{ profile: 'dev', key: 'api', port: 3000, pinnedAt: '' }]);
    vi.spyOn(store, 'loadConfig').mockResolvedValue(cfg as any);
    expect(await isPinned('dev', 'api')).toBe(true);
  });

  it('returns false for unpinned port', async () => {
    vi.spyOn(store, 'loadConfig').mockResolvedValue(makeConfig() as any);
    expect(await isPinned('dev', 'web')).toBe(false);
  });
});
