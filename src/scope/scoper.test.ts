import {
  getScopes,
  addScope,
  removeScope,
  getProfilesInScope,
  getScopesForProfile,
  resolveScope,
} from './scoper';

function makeConfig(extra: object = {}): any {
  return {
    profiles: {
      web: { ports: { http: 3000, ws: 3001 } },
      api: { ports: { rest: 4000, grpc: 4001 } },
    },
    ...extra,
  };
}

test('getScopes returns empty object when no scopes defined', () => {
  expect(getScopes(makeConfig())).toEqual({});
});

test('addScope creates a new scope entry', () => {
  const config = makeConfig();
  const updated = addScope(config, 'frontend', 'web', ['http', 'ws']);
  expect(getScopes(updated)['frontend']).toEqual([
    { profile: 'web', keys: ['http', 'ws'] },
  ]);
});

test('addScope updates existing profile entry in scope', () => {
  let config = makeConfig();
  config = addScope(config, 'full', 'web', ['http']);
  config = addScope(config, 'full', 'web', ['http', 'ws']);
  const entries = getScopes(config)['full'];
  expect(entries).toHaveLength(1);
  expect(entries[0].keys).toEqual(['http', 'ws']);
});

test('addScope appends multiple profiles to same scope', () => {
  let config = makeConfig();
  config = addScope(config, 'all', 'web', ['http']);
  config = addScope(config, 'all', 'api', ['rest']);
  expect(getScopes(config)['all']).toHaveLength(2);
});

test('removeScope deletes a scope', () => {
  let config = makeConfig();
  config = addScope(config, 'temp', 'web', ['http']);
  config = removeScope(config, 'temp');
  expect(getScopes(config)['temp']).toBeUndefined();
});

test('getProfilesInScope returns entries for scope', () => {
  let config = makeConfig();
  config = addScope(config, 'backend', 'api', ['rest', 'grpc']);
  expect(getProfilesInScope(config, 'backend')).toEqual([
    { profile: 'api', keys: ['rest', 'grpc'] },
  ]);
});

test('getScopesForProfile returns all scopes containing profile', () => {
  let config = makeConfig();
  config = addScope(config, 'a', 'web', ['http']);
  config = addScope(config, 'b', 'web', ['ws']);
  config = addScope(config, 'c', 'api', ['rest']);
  expect(getScopesForProfile(config, 'web').sort()).toEqual(['a', 'b']);
});

test('resolveScope returns merged port map for scope', () => {
  let config = makeConfig();
  config = addScope(config, 'mixed', 'web', ['http']);
  config = addScope(config, 'mixed', 'api', ['rest']);
  expect(resolveScope(config, 'mixed')).toEqual({
    'web.http': 3000,
    'api.rest': 4000,
  });
});

test('resolveScope ignores unknown keys', () => {
  let config = makeConfig();
  config = addScope(config, 'x', 'web', ['http', 'missing']);
  const result = resolveScope(config, 'x');
  expect(result).toEqual({ 'web.http': 3000 });
});
