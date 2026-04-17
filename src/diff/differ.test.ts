import { diffProfilesFlat } from './differ';
import * as store from '../config/store';

jest.mock('../config/store');

const mockLoad = store.loadConfig as jest.Mock;

describe('diffProfilesFlat', () => {
  beforeEach(() => {
    mockLoad.mockReturnValue({
      profiles: {
        dev: { ports: { API: 3000, DB: 5432 } },
        staging: { ports: { API: 4000, CACHE: 6379 } },
      },
    });
  });

  it('detects changed ports', () => {
    const diffs = diffProfilesFlat('dev', 'staging');
    const changed = diffs.find(d => d.key === 'API');
    expect(changed).toBeDefined();
    expect(changed?.type).toBe('changed');
    expect(changed?.from).toBe(3000);
    expect(changed?.to).toBe(4000);
  });

  it('detects removed ports', () => {
    const diffs = diffProfilesFlat('dev', 'staging');
    const removed = diffs.find(d => d.key === 'DB');
    expect(removed?.type).toBe('removed');
    expect(removed?.to).toBeUndefined();
  });

  it('detects added ports', () => {
    const diffs = diffProfilesFlat('dev', 'staging');
    const added = diffs.find(d => d.key === 'CACHE');
    expect(added?.type).toBe('added');
    expect(added?.from).toBeUndefined();
  });

  it('returns empty array for identical profiles', () => {
    mockLoad.mockReturnValue({
      profiles: {
        a: { ports: { API: 3000 } },
        b: { ports: { API: 3000 } },
      },
    });
    expect(diffProfilesFlat('a', 'b')).toHaveLength(0);
  });
});
