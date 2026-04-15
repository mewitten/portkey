import { syncProfile, syncAllProfiles } from './syncer';
import * as store from '../config/store';
import * as generator from '../env/generator';
import * as fs from 'fs';

jest.mock('../config/store');
jest.mock('../env/generator');
jest.mock('fs');

const mockLoadConfig = store.loadConfig as jest.MockedFunction<typeof store.loadConfig>;
const mockGenerateEnv = generator.generateEnvContent as jest.MockedFunction<typeof generator.generateEnvContent>;
const mockWriteFileSync = fs.writeFileSync as jest.MockedFunction<typeof fs.writeFileSync>;

const sampleConfig = {
  version: '1.0',
  activeProfile: 'dev',
  profiles: {
    dev: { ports: { API: 3000, DB: 5432 } },
    staging: { ports: { API: 4000, DB: 5433 } },
  },
};

beforeEach(() => {
  jest.clearAllMocks();
  mockLoadConfig.mockResolvedValue(sampleConfig as any);
  mockGenerateEnv.mockReturnValue('API=3000\nDB=5432\n');
});

describe('syncProfile', () => {
  it('writes env file for a valid profile', async () => {
    const result = await syncProfile('dev', { outputDir: '/tmp' });
    expect(result.errors).toHaveLength(0);
    expect(result.filesWritten).toContain('/tmp/.env.dev');
    expect(mockWriteFileSync).toHaveBeenCalledWith(
      '/tmp/.env.dev',
      'API=3000\nDB=5432\n',
      'utf-8'
    );
  });

  it('returns error for unknown profile', async () => {
    const result = await syncProfile('production', { outputDir: '/tmp' });
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0]).toMatch(/not found/);
    expect(mockWriteFileSync).not.toHaveBeenCalled();
  });

  it('dry run does not write files', async () => {
    const result = await syncProfile('dev', { outputDir: '/tmp', dryRun: true });
    expect(result.filesWritten).toContain('/tmp/.env.dev');
    expect(mockWriteFileSync).not.toHaveBeenCalled();
  });

  it('captures write errors', async () => {
    mockWriteFileSync.mockImplementation(() => { throw new Error('permission denied'); });
    const result = await syncProfile('dev', { outputDir: '/tmp' });
    expect(result.errors[0]).toMatch(/permission denied/);
  });
});

describe('syncAllProfiles', () => {
  it('syncs all profiles', async () => {
    const results = await syncAllProfiles({ outputDir: '/tmp', dryRun: true });
    expect(results).toHaveLength(2);
    expect(results.map((r) => r.profile)).toEqual(expect.arrayContaining(['dev', 'staging']));
  });
});
