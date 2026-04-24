import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import {
  generateShareToken,
  resolveShareToken,
  revokeShareToken,
  listShareTokens,
  getShareStorePath,
} from './sharer';
import { saveConfig } from '../config/store';

function makeTempDir(): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'portkey-share-'));
}

function makeConfig(configDir: string) {
  saveConfig(configDir, {
    activeProfile: 'dev',
    profiles: {
      dev: { ports: { API: 3000, DB: 5432 } },
    },
  });
}

describe('sharer', () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = makeTempDir();
    makeConfig(tmpDir);
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it('generates a share token for a valid profile', () => {
    const token = generateShareToken(tmpDir, 'dev');
    expect(token.profile).toBe('dev');
    expect(token.token).toHaveLength(32);
    expect(token.expiresAt).toBeUndefined();
  });

  it('generates a token with TTL', () => {
    const token = generateShareToken(tmpDir, 'dev', 60);
    expect(token.expiresAt).toBeDefined();
    const exp = new Date(token.expiresAt!);
    expect(exp.getTime()).toBeGreaterThan(Date.now());
  });

  it('throws when profile does not exist', () => {
    expect(() => generateShareToken(tmpDir, 'nonexistent')).toThrow('not found');
  });

  it('resolves a valid token', () => {
    const { token } = generateShareToken(tmpDir, 'dev');
    const result = resolveShareToken(tmpDir, token);
    expect(result.profile).toBe('dev');
    expect(result.ports.API).toBe(3000);
  });

  it('throws on unknown token', () => {
    expect(() => resolveShareToken(tmpDir, 'badtoken')).toThrow('not found');
  });

  it('revokes a token', () => {
    const { token } = generateShareToken(tmpDir, 'dev');
    const revoked = revokeShareToken(tmpDir, token);
    expect(revoked).toBe(true);
    expect(() => resolveShareToken(tmpDir, token)).toThrow();
  });

  it('returns false when revoking unknown token', () => {
    expect(revokeShareToken(tmpDir, 'ghost')).toBe(false);
  });

  it('lists all tokens', () => {
    generateShareToken(tmpDir, 'dev');
    generateShareToken(tmpDir, 'dev');
    expect(listShareTokens(tmpDir)).toHaveLength(2);
  });
});
