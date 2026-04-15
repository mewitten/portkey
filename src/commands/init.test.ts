import { Command } from 'commander';
import { initProject } from './init';
import * as store from '../config/store';
import * as profileManager from '../profiles/manager';

jest.mock('../config/store');
jest.mock('../profiles/manager');

const mockEnsureConfigDir = store.ensureConfigDir as jest.MockedFunction<typeof store.ensureConfigDir>;
const mockLoadConfig = store.loadConfig as jest.MockedFunction<typeof store.loadConfig>;
const mockCreateProfile = profileManager.createProfile as jest.MockedFunction<typeof profileManager.createProfile>;
const mockSwitchProfile = profileManager.switchProfile as jest.MockedFunction<typeof profileManager.switchProfile>;

describe('initProject', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockEnsureConfigDir.mockReturnValue('/home/user/.portkey');
    mockLoadConfig.mockReturnValue({ profiles: {}, activeProfile: null });
    mockCreateProfile.mockReturnValue({ name: 'myapp', ports: {} });
    mockSwitchProfile.mockReturnValue(undefined as any);
  });

  it('creates and switches to a new profile with given name', async () => {
    await initProject({ name: 'myapp' });
    expect(mockCreateProfile).toHaveBeenCalledWith('myapp', {});
    expect(mockSwitchProfile).toHaveBeenCalledWith('myapp');
  });

  it('seeds default ports when --defaults flag is set', async () => {
    await initProject({ name: 'myapp', defaults: true });
    expect(mockCreateProfile).toHaveBeenCalledWith('myapp', {
      frontend: 3000,
      backend: 8080,
      database: 5432,
    });
  });

  it('throws if profile already exists without --force', async () => {
    mockLoadConfig.mockReturnValue({
      profiles: { myapp: { name: 'myapp', ports: {} } },
      activeProfile: 'myapp',
    });
    await expect(initProject({ name: 'myapp' })).rejects.toThrow(
      'Profile "myapp" already exists. Use --force to overwrite.'
    );
  });

  it('overwrites existing profile when --force is set', async () => {
    mockLoadConfig.mockReturnValue({
      profiles: { myapp: { name: 'myapp', ports: {} } },
      activeProfile: 'myapp',
    });
    await expect(initProject({ name: 'myapp', force: true })).resolves.not.toThrow();
    expect(mockCreateProfile).toHaveBeenCalledWith('myapp', {});
  });

  it('uses current directory name when no name is provided', async () => {
    const dirName = require('path').basename(process.cwd());
    await initProject({});
    expect(mockCreateProfile).toHaveBeenCalledWith(dirName, {});
  });
});
