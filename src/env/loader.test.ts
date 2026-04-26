import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { loadEnvForProfile, mergeEnvForProfile } from './loader';
import * as store from '../config/store';

function makeTempDir() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'portkey-loader-'));
}

const mockConfig = {
  profiles: {
    dev: { ports: { API: 3000, UI: 4000 } },
    prod: { ports: { API: 8080 } },
  },
  activeProfile: 'dev',
};

beforeEach(() => {
  jest.spyOn(store, 'loadConfig').mockResolvedValue(mockConfig as any);
});

afterEach(() => jest.restoreAllMocks());

describe('loadEnvForProfile', () => {
  it('writes env file for a valid profile', async () => {
    const dir = makeTempDir();
    const out = path.join(dir, '.env');
    await loadEnvForProfile('dev', out);
    const content = fs.readFileSync(out, 'utf-8');
    expect(content).toContain('API=3000');
    expect(content).toContain('UI=4000');
  });

  it('throws if profile does not exist', async () => {
    const dir = makeTempDir();
    await expect(loadEnvForProfile('missing', path.join(dir, '.env'))).rejects.toThrow(
      'Profile "missing" not found.'
    );
  });

  it('throws if file exists and overwrite is false', async () => {
    const dir = makeTempDir();
    const out = path.join(dir, '.env');
    fs.writeFileSync(out, 'existing');
    await expect(loadEnvForProfile('dev', out, false)).rejects.toThrow('already exists');
  });

  it('overwrites when overwrite is true', async () => {
    const dir = makeTempDir();
    const out = path.join(dir, '.env');
    fs.writeFileSync(out, 'old=1');
    await loadEnvForProfile('dev', out, true);
    const content = fs.readFileSync(out, 'utf-8');
    expect(content).toContain('API=3000');
  });
});

describe('mergeEnvForProfile', () => {
  it('merges with existing env file', async () => {
    const dir = makeTempDir();
    const out = path.join(dir, '.env');
    fs.writeFileSync(out, 'EXISTING=9999\n');
    await mergeEnvForProfile('dev', out);
    const content = fs.readFileSync(out, 'utf-8');
    expect(content).toContain('EXISTING=9999');
    expect(content).toContain('API=3000');
  });

  it('creates file if it does not exist', async () => {
    const dir = makeTempDir();
    const out = path.join(dir, '.env');
    await mergeEnvForProfile('prod', out);
    const content = fs.readFileSync(out, 'utf-8');
    expect(content).toContain('API=8080');
  });
});
