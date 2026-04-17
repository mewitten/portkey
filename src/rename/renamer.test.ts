import { renameProfile, renamePort } from './renamer';
import { loadConfig, saveConfig } from '../config/store';

jest.mock('../config/store');

const mockLoad = loadConfig as jest.MockedFunction<typeof loadConfig>;
const mockSave = saveConfig as jest.MockedFunction<typeof saveConfig>;

const baseConfig = () => ({
  activeProfile: 'dev',
  profiles: {
    dev: { ports: { api: 3000, web: 8080 } },
    prod: { ports: { api: 80 } },
  },
});

beforeEach(() => {
  mockSave.mockResolvedValue(undefined);
});

describe('renameProfile', () => {
  it('renames a profile', async () => {
    mockLoad.mockResolvedValue(baseConfig() as any);
    await renameProfile('prod', 'production');
    const saved = mockSave.mock.calls[0][0] as any;
    expect(saved.profiles['production']).toBeDefined();
    expect(saved.profiles['prod']).toBeUndefined();
  });

  it('updates activeProfile if renamed', async () => {
    mockLoad.mockResolvedValue(baseConfig() as any);
    await renameProfile('dev', 'development');
    const saved = mockSave.mock.calls[0][0] as any;
    expect(saved.activeProfile).toBe('development');
  });

  it('throws if old profile missing', async () => {
    mockLoad.mockResolvedValue(baseConfig() as any);
    await expect(renameProfile('nope', 'x')).rejects.toThrow("Profile 'nope' does not exist.");
  });

  it('throws if new profile already exists', async () => {
    mockLoad.mockResolvedValue(baseConfig() as any);
    await expect(renameProfile('dev', 'prod')).rejects.toThrow("Profile 'prod' already exists.");
  });
});

describe('renamePort', () => {
  it('renames a port key', async () => {
    mockLoad.mockResolvedValue(baseConfig() as any);
    await renamePort('dev', 'api', 'backend');
    const saved = mockSave.mock.calls[0][0] as any;
    expect(saved.profiles.dev.ports['backend']).toBe(3000);
    expect(saved.profiles.dev.ports['api']).toBeUndefined();
  });

  it('throws if profile missing', async () => {
    mockLoad.mockResolvedValue(baseConfig() as any);
    await expect(renamePort('nope', 'api', 'x')).rejects.toThrow("Profile 'nope' does not exist.");
  });

  it('throws if port key missing', async () => {
    mockLoad.mockResolvedValue(baseConfig() as any);
    await expect(renamePort('dev', 'db', 'database')).rejects.toThrow("Port key 'db' does not exist");
  });
});
