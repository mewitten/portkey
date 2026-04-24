import { getAliases, resolveAlias, addAlias, removeAlias, updateAlias } from './aliaser';

type Config = any;

function makeConfig(aliases: Record<string, string> = {}): Config {
  return { profiles: {}, aliases, active: null };
}

describe('aliaser', () => {
  describe('getAliases', () => {
    it('returns aliases map', () => {
      const config = makeConfig({ dev: 'development' });
      expect(getAliases(config)).toEqual({ dev: 'development' });
    });

    it('returns empty object when no aliases key', () => {
      const config = { profiles: {}, active: null };
      expect(getAliases(config)).toEqual({});
    });
  });

  describe('resolveAlias', () => {
    it('returns target profile for known alias', () => {
      const config = makeConfig({ staging: 'prod' });
      expect(resolveAlias(config, 'staging')).toBe('prod');
    });

    it('returns null for unknown alias', () => {
      const config = makeConfig({});
      expect(resolveAlias(config, 'nope')).toBeNull();
    });
  });

  describe('addAlias', () => {
    it('adds a new alias', () => {
      const config = makeConfig({});
      const result = addAlias(config, 'dev', 'development');
      expect(result.aliases['dev']).toBe('development');
    });

    it('throws if alias already exists', () => {
      const config = makeConfig({ dev: 'development' });
      expect(() => addAlias(config, 'dev', 'other')).toThrow();
    });

    it('does not mutate original config', () => {
      const config = makeConfig({});
      addAlias(config, 'x', 'y');
      expect(config.aliases['x']).toBeUndefined();
    });
  });

  describe('removeAlias', () => {
    it('removes an existing alias', () => {
      const config = makeConfig({ dev: 'development' });
      const result = removeAlias(config, 'dev');
      expect(result.aliases['dev']).toBeUndefined();
    });

    it('throws if alias does not exist', () => {
      const config = makeConfig({});
      expect(() => removeAlias(config, 'missing')).toThrow();
    });
  });

  describe('updateAlias', () => {
    it('updates an existing alias', () => {
      const config = makeConfig({ staging: 'prod' });
      const result = updateAlias(config, 'staging', 'staging-v2');
      expect(result.aliases['staging']).toBe('staging-v2');
    });

    it('throws if alias does not exist', () => {
      const config = makeConfig({});
      expect(() => updateAlias(config, 'ghost', 'target')).toThrow();
    });
  });
});
