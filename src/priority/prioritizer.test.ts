import {
  getPriorities,
  setProfilePriority,
  removeProfilePriority,
  getHighestPriorityProfile,
} from './prioritizer';
import { PortConfig } from '../config/schema';

function makeConfig(overrides: Partial<PortConfig> = {}): PortConfig {
  return {
    version: 1,
    activeProfile: 'dev',
    profiles: {
      dev: { PORT: 3000 },
      staging: { PORT: 4000 },
      prod: { PORT: 5000 },
    },
    priorities: { dev: 10, staging: 5 },
    ...overrides,
  } as PortConfig;
}

describe('getPriorities', () => {
  it('returns profiles sorted by priority descending', () => {
    const result = getPriorities(makeConfig());
    expect(result[0]).toEqual({ profile: 'dev', priority: 10 });
    expect(result[1]).toEqual({ profile: 'staging', priority: 5 });
  });

  it('returns empty array when no priorities set', () => {
    const config = makeConfig({ priorities: {} });
    expect(getPriorities(config)).toEqual([]);
  });
});

describe('setProfilePriority', () => {
  it('sets priority for an existing profile', () => {
    const config = makeConfig();
    const updated = setProfilePriority(config, 'prod', 20);
    expect(updated.priorities?.['prod']).toBe(20);
  });

  it('throws if profile does not exist', () => {
    const config = makeConfig();
    expect(() => setProfilePriority(config, 'ghost', 1)).toThrow(
      'Profile "ghost" does not exist.'
    );
  });

  it('throws if priority is negative', () => {
    const config = makeConfig();
    expect(() => setProfilePriority(config, 'dev', -1)).toThrow(
      'Priority must be a non-negative integer.'
    );
  });
});

describe('removeProfilePriority', () => {
  it('removes priority for a profile', () => {
    const config = makeConfig();
    const updated = removeProfilePriority(config, 'dev');
    expect(updated.priorities?.['dev']).toBeUndefined();
    expect(updated.priorities?.['staging']).toBe(5);
  });

  it('is a no-op if profile has no priority', () => {
    const config = makeConfig();
    const updated = removeProfilePriority(config, 'prod');
    expect(updated.priorities).toEqual({ dev: 10, staging: 5 });
  });
});

describe('getHighestPriorityProfile', () => {
  it('returns the profile with highest priority', () => {
    expect(getHighestPriorityProfile(makeConfig())).toBe('dev');
  });

  it('returns undefined when no priorities exist', () => {
    const config = makeConfig({ priorities: {} });
    expect(getHighestPriorityProfile(config)).toBeUndefined();
  });
});
