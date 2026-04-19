import { searchByPort, searchByKey, searchByProfile } from './searcher';
import * as store from '../config/store';

const mockConfig = {
  profiles: {
    dev: { ports: { api: 3000, web: 3001 } },
    staging: { ports: { api: 4000, db: 5432 } },
  },
  active: 'dev',
};

beforeEach(() => {
  jest.spyOn(store, 'loadConfig').mockReturnValue(mockConfig as any);
});

afterEach(() => jest.restoreAllMocks());

describe('searchByPort', () => {
  it('finds matching port across profiles', () => {
    const results = searchByPort(3000);
    expect(results).toHaveLength(1);
    expect(results[0]).toEqual({ profile: 'dev', key: 'api', port: 3000 });
  });

  it('returns empty when port not found', () => {
    expect(searchByPort(9999)).toHaveLength(0);
  });
});

describe('searchByKey', () => {
  it('finds keys matching keyword', () => {
    const results = searchByKey('api');
    expect(results).toHaveLength(2);
    expect(results.map(r => r.profile)).toContain('dev');
    expect(results.map(r => r.profile)).toContain('staging');
  });

  it('is case insensitive', () => {
    expect(searchByKey('API')).toHaveLength(2);
  });

  it('returns empty when no match', () => {
    expect(searchByKey('xyz')).toHaveLength(0);
  });
});

describe('searchByProfile', () => {
  it('returns all ports for a profile', () => {
    const results = searchByProfile('dev');
    expect(results).toHaveLength(2);
  });

  it('filters by keyword within profile', () => {
    const results = searchByProfile('dev', 'web');
    expect(results).toHaveLength(1);
    expect(results[0].key).toBe('web');
  });

  it('returns empty for unknown profile', () => {
    expect(searchByProfile('unknown')).toHaveLength(0);
  });
});
