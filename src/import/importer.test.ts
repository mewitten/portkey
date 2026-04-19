import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { detectFormat, parseEnvImport, importConfig } from './importer';
import { loadConfig, saveConfig } from '../config/store';

jest.mock('../config/store');

const mockLoad = loadConfig as jest.MockedFunction<typeof loadConfig>;
const mockSave = saveConfig as jest.MockedFunction<typeof saveConfig>;

describe('detectFormat', () => {
  it('detects env format by extension', () => {
    expect(detectFormat('config.env')).toBe('env');
  });

  it('detects env format by filename prefix', () => {
    expect(detectFormat('/some/path/.env.local')).toBe('env');
  });

  it('defaults to json', () => {
    expect(detectFormat('ports.json')).toBe('json');
    expect(detectFormat('config.yaml')).toBe('json');
  });
});

describe('parseEnvImport', () => {
  it('parses valid env lines', () => {
    const content = 'API_PORT=3000\nDB_PORT=5432';
    expect(parseEnvImport(content)).toEqual({ API_PORT: 3000, DB_PORT: 5432 });
  });

  it('skips comments and blank lines', () => {
    const content = '# comment\n\nPORT=8080';
    expect(parseEnvImport(content)).toEqual({ PORT: 8080 });
  });

  it('skips non-numeric values', () => {
    const content = 'HOST=localhost\nPORT=9000';
    expect(parseEnvImport(content)).toEqual({ PORT: 9000 });
  });
});

describe('importConfig', () => {
  let tmpFile: string;

  beforeEach(() => {
    tmpFile = path.join(os.tmpdir(), `portkey-test-${Date.now()}.json`);
    mockLoad.mockResolvedValue({ profiles: {}, active: null } as any);
    mockSave.mockResolvedValue(undefined);
  });

  afterEach(() => {
    if (fs.existsSync(tmpFile)) fs.unlinkSync(tmpFile);
  });

  it('imports ports from json file', async () => {
    fs.writeFileSync(tmpFile, JSON.stringify({ ports: { WEB: 3000 } }));
    const result = await importConfig(tmpFile, 'dev');
    expect(result.imported).toBe(1);
    expect(result.skipped).toBe(0);
    expect(mockSave).toHaveBeenCalled();
  });

  it('skips existing keys when merge is true', async () => {
    mockLoad.mockResolvedValue({ profiles: { dev: { name: 'dev', ports: { WEB: 4000 } } }, active: null } as any);
    fs.writeFileSync(tmpFile, JSON.stringify({ ports: { WEB: 3000, API: 8080 } }));
    const result = await importConfig(tmpFile, 'dev', { merge: true });
    expect(result.imported).toBe(1);
    expect(result.skipped).toBe(1);
  });

  it('throws if file not found', async () => {
    await expect(importConfig('/nonexistent/file.json', 'dev')).rejects.toThrow('File not found');
  });
});
