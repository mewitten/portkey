import { addAlias, removeAlias, updateAlias, resolveAlias, listAliases } from './aliaser';
import { PortConfig } from '../config/schema';

function makeConfig(overrides: Partial<PortConfig> = {}): PortConfig {
  return {
    version: 1,
    activeProfile: 'default',
    profiles: {
      default: { ports: { web: 3000 } },
      staging: { ports: { web: 4000 } },
    },
    aliases: {},
    ...overrides,
  } as PortConfig;
}

describe('addAlias', () => {
  it('adds a new alias to an existing profile', () => {
    const config = makeConfig();
    const updated = addAlias('dev', 'default', config);
    expect(updated.aliases?.['dev']).toBe('default');
  });

  it('throws if the profile does not exist', () => {
    const config = makeConfig();
    expect(() => addAlias('ghost', 'nonexistent', config)).toThrow(
      'Profile "nonexistent" does not exist.'
    );
  });

  it('throws if alias already exists', () => {
    const config = makeConfig({ aliases: { dev: 'default' } });
    expect(() => addAlias('dev', 'staging', config)).toThrow(
      'Alias "dev" already exists'
    );
  });
});

describe('removeAlias', () => {
  it('removes an existing alias', () => {
    const config = makeConfig({ aliases: { dev: 'default' } });
    const updated = removeAlias('dev', config);
    expect(updated.aliases?.['dev']).toBeUndefined();
  });

  it('throws if alias does not exist', () => {
    const config = makeConfig();
    expect(() => removeAlias('nope', config)).toThrow('Alias "nope" does not exist.');
  });
});

describe('updateAlias', () => {
  it('updates an existing alias to a new profile', () => {
    const config = makeConfig({ aliases: { dev: 'default' } });
    const updated = updateAlias('dev', 'staging', config);
    expect(updated.aliases?.['dev']).toBe('staging');
  });

  it('throws if alias does not exist', () => {
    const config = makeConfig();
    expect(() => updateAlias('missing', 'staging', config)).toThrow(
      'Alias "missing" does not exist.'
    );
  });

  it('throws if new profile does not exist', () => {
    const config = makeConfig({ aliases: { dev: 'default' } });
    expect(() => updateAlias('dev', 'ghost', config)).toThrow(
      'Profile "ghost" does not exist.'
    );
  });
});

describe('resolveAlias', () => {
  it('resolves an alias to its profile name', () => {
    const config = makeConfig({ aliases: { dev: 'staging' } });
    expect(resolveAlias(config, 'dev')).toBe('staging');
  });

  it('returns the input unchanged if no alias matches', () => {
    const config = makeConfig();
    expect(resolveAlias(config, 'staging')).toBe('staging');
  });
});

describe('listAliases', () => {
  it('returns all aliases as an array', () => {
    const config = makeConfig({ aliases: { dev: 'default', stg: 'staging' } });
    const list = listAliases(config);
    expect(list).toHaveLength(2);
    expect(list).toContainEqual({ alias: 'dev', profile: 'default' });
    expect(list).toContainEqual({ alias: 'stg', profile: 'staging' });
  });

  it('returns empty array when no aliases defined', () => {
    const config = makeConfig();
    expect(listAliases(config)).toEqual([]);
  });
});
