import { addTag, removeTag, listByTag, listTags } from './tagger';
import { loadConfig, saveConfig } from '../config/store';

jest.mock('../config/store');

const mockLoad = loadConfig as jest.MockedFunction<typeof loadConfig>;
const mockSave = saveConfig as jest.MockedFunction<typeof saveConfig>;

function makeConfig(profiles: any) {
  return { profiles };
}

beforeEach(() => jest.clearAllMocks());

test('addTag adds a tag to a profile', async () => {
  const config = makeConfig({ dev: { tags: [] } });
  mockLoad.mockResolvedValue(config as any);
  mockSave.mockResolvedValue(undefined);
  await addTag('dev', 'frontend');
  expect(config.profiles.dev.tags).toContain('frontend');
  expect(mockSave).toHaveBeenCalled();
});

test('addTag throws if profile not found', async () => {
  mockLoad.mockResolvedValue(makeConfig({}) as any);
  await expect(addTag('ghost', 'x')).rejects.toThrow("Profile 'ghost' not found");
});

test('addTag throws if tag already exists', async () => {
  mockLoad.mockResolvedValue(makeConfig({ dev: { tags: ['frontend'] } }) as any);
  await expect(addTag('dev', 'frontend')).rejects.toThrow("Tag 'frontend' already exists");
});

test('removeTag removes a tag', async () => {
  const config = makeConfig({ dev: { tags: ['frontend', 'backend'] } });
  mockLoad.mockResolvedValue(config as any);
  mockSave.mockResolvedValue(undefined);
  await removeTag('dev', 'frontend');
  expect(config.profiles.dev.tags).not.toContain('frontend');
});

test('listByTag returns matching profiles', async () => {
  mockLoad.mockResolvedValue(makeConfig({
    dev: { tags: ['frontend'] },
    api: { tags: ['backend'] },
    web: { tags: ['frontend', 'backend'] },
  }) as any);
  const result = await listByTag('frontend');
  expect(result).toEqual(['dev', 'web']);
});

test('listTags returns tags for profile', async () => {
  mockLoad.mockResolvedValue(makeConfig({ dev: { tags: ['a', 'b'] } }) as any);
  expect(await listTags('dev')).toEqual(['a', 'b']);
});
