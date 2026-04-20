import { detectFormat, parseEnvImport, parseJsonImport, importConfig } from './importer';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';

describe('detectFormat', () => {
  it('returns json for .json files', () => {
    expect(detectFormat('config.json')).toBe('json');
  });

  it('returns yaml for .yaml files', () => {
    expect(detectFormat('config.yaml')).toBe('yaml');
  });

  it('returns yaml for .yml files', () => {
    expect(detectFormat('config.yml')).toBe('yaml');
  });

  it('returns env for .env files', () => {
    expect(detectFormat('.env')).toBe('env');
  });

  it('returns env for unknown extensions', () => {
    expect(detectFormat('ports.txt')).toBe('env');
  });
});

describe('parseEnvImport', () => {
  it('parses valid port assignments', () => {
    const content = 'PORT=3000\nDB_PORT=5432\nREDIS_PORT=6379';
    expect(parseEnvImport(content)).toEqual({ PORT: 3000, DB_PORT: 5432, REDIS_PORT: 6379 });
  });

  it('ignores comments and blank lines', () => {
    const content = '# comment\n\nPORT=3000';
    expect(parseEnvImport(content)).toEqual({ PORT: 3000 });
  });

  it('strips quotes from values', () => {
    const content = 'PORT="8080"';
    expect(parseEnvImport(content)).toEqual({ PORT: 8080 });
  });

  it('ignores non-numeric values', () => {
    const content = 'HOST=localhost\nPORT=3000';
    expect(parseEnvImport(content)).toEqual({ PORT: 3000 });
  });
});

describe('parseJsonImport', () => {
  it('parses flat port map', () => {
    const content = JSON.stringify({ PORT: 3000, DB_PORT: 5432 });
    expect(parseJsonImport(content)).toEqual({ PORT: 3000, DB_PORT: 5432 });
  });

  it('parses nested ports key', () => {
    const content = JSON.stringify({ name: 'dev', ports: { API: 4000 } });
    expect(parseJsonImport(content)).toEqual({ API: 4000 });
  });
});

describe('importConfig', () => {
  it('imports from a .env file', () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'portkey-'));
    const file = path.join(dir, '.env');
    fs.writeFileSync(file, 'PORT=3000\nDB_PORT=5432');
    const result = importConfig(file, 'dev');
    expect(result.profile).toBe('dev');
    expect(result.ports).toEqual({ PORT: 3000, DB_PORT: 5432 });
  });

  it('throws if file does not exist', () => {
    expect(() => importConfig('/nonexistent/.env', 'dev')).toThrow('File not found');
  });

  it('throws if no valid ports found', () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'portkey-'));
    const file = path.join(dir, '.env');
    fs.writeFileSync(file, '# no ports here\nHOST=localhost');
    expect(() => importConfig(file, 'dev')).toThrow('No valid port entries found');
  });
});
