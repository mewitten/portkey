import { pinPort, unpinPort, listPinned, isPinned } from './pinner';
import * as store from '../config/store';

jest.mock('../config/store');

const mockLoadConfig = store.loadConfig as jest.MockedFunction<typeof store.loadConfig>;
const mockSaveConfig = store.saveConfig as jest.MockedFunction<typeof store.saveConfig>;

function makeConfig(overrides = {}) {
  return {
    profiles: {
      dev: { ports: { api: 3000, db: 5432 } },
    },
    pinned: {},
    ...overrides,
  } as any;
}

beforeEach(() => {
  jest.clearAllMocks();
  mockSaveConfig.mockResolvedValue(undefined);
});

describe('pinPort', () => {
  it('pins an existing port key', async () => {
    mockLoadConfig.mockResolvedValue(makeConfig());
    const result = await pinPort('dev', 'api');
    expect(result.key).toBe('api');
    expect(result.port).toBe(3000);
    expect(result.profile).toBe('dev');
    expect(result.pinnedAt).toBeDefined();
    expect(mockSaveConfig).toHaveBeenCalled();
  });

  it('throws if profile not found', async () => {
    mockLoadConfig.mockResolvedValue(makeConfig());
    await expect(pinPort('prod', 'api')).rejects.toThrow('Profile "prod" not found');
  });

  it('throws if key not found in profile', async () => {
    mockLoadConfig.mockResolvedValue(makeConfig());
    await expect(pinPort('dev', 'missing')).rejects.toThrow('Port key "missing" not found');
  });
});

describe('unpinPort', () => {
  it('removes a pinned port', async () => {
    const config = makeConfig({ pinned: { api: { key: 'api', port: 3000, profile: 'dev', pinnedAt: '' } } });
    mockLoadConfig.mockResolvedValue(config);
    await unpinPort('api');
    expect(mockSaveConfig).toHaveBeenCalled();
  });

  it('throws if key is not pinned', async () => {
    mockLoadConfig.mockResolvedValue(makeConfig());
    await expect(unpinPort('notpinned')).rejects.toThrow('No pinned port found for key "notpinned"');
  });
});

describe('listPinned', () => {
  it('returns all pinned ports', async () => {
    const pinned = { api: { key: 'api', port: 3000, profile: 'dev', pinnedAt: '' } };
    mockLoadConfig.mockResolvedValue(makeConfig({ pinned }));
    const result = await listPinned();
    expect(result).toHaveLength(1);
    expect(result[0].key).toBe('api');
  });

  it('returns empty array when nothing pinned', async () => {
    mockLoadConfig.mockResolvedValue(makeConfig());
    const result = await listPinned();
    expect(result).toEqual([]);
  });
});

describe('isPinned', () => {
  it('returns true for pinned key', async () => {
    const pinned = { api: { key: 'api', port: 3000, profile: 'dev', pinnedAt: '' } };
    mockLoadConfig.mockResolvedValue(makeConfig({ pinned }));
    expect(await isPinned('api')).toBe(true);
  });

  it('returns false for unpinned key', async () => {
    mockLoadConfig.mockResolvedValue(makeConfig());
    expect(await isPinned('api')).toBe(false);
  });
});
