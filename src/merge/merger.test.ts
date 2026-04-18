import { mergeProfiles } from './merger';
import { loadConfig, saveConfig } from '../config/store';

jest.mock('../config/store');

const mockConfig = {
  profiles: {
    base: { API_PORT: 3000, DB_PORT: 5432 },
    dev: { API_PORT: 4000 }
  },
  activeProfile: 'dev'
};

beforeEach(() => {
  (loadConfig as jest.Mock).mockResolvedValue(JSON.parse(JSON.stringify(mockConfig)));
  (saveConfig as jest.Mock).mockResolvedValue(undefined);
});

test('merges new keys from source into target', async () => {
  const result = await mergeProfiles('base', 'dev');
  expect(result.merged).toContain('DB_PORT');
  expect(result.skipped).toContain('API_PORT');
  expect(result.overwritten).toHaveLength(0);
});

test('overwrites existing keys when overwrite=true', async () => {
  const result = await mergeProfiles('base', 'dev', true);
  expect(result.overwritten).toContain('API_PORT');
  expect(result.merged).toContain('DB_PORT');
});

test('creates target profile if it does not exist', async () => {
  const result = await mergeProfiles('base', 'newprofile');
  expect(result.merged).toContain('API_PORT');
  expect(result.merged).toContain('DB_PORT');
  expect(saveConfig).toHaveBeenCalled();
});

test('throws if source profile not found', async () => {
  await expect(mergeProfiles('nonexistent', 'dev')).rejects.toThrow("Source profile 'nonexistent' not found");
});
