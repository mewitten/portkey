import { resolvePort, resolveAllPorts } from './resolver';
import * as store from '../config/store';
import * as profileManager from '../profiles/manager';

jest.mock('../config/store');
jest.mock('../profiles/manager');

const mockLoadConfig = store.loadConfig as jest.Mock;
const mockGetProfile = profileManager.getProfile as jest.Mock;

describe('resolvePort', () => {
  beforeEach(() => jest.clearAllMocks());

  it('resolves port from default config when no active profile', async () => {
    mockLoadConfig.mockResolvedValue({ ports: { web: 3000 } });
    const result = await resolvePort('web');
    expect(result).toEqual({ name: 'web', port: 3000, profile: 'default' });
  });

  it('returns null if port not found in default config', async () => {
    mockLoadConfig.mockResolvedValue({ ports: {} });
    const result = await resolvePort('missing');
    expect(result).toBeNull();
  });

  it('resolves port from active profile', async () => {
    mockLoadConfig.mockResolvedValue({ activeProfile: 'dev', ports: {} });
    mockGetProfile.mockResolvedValue({ ports: { api: 4000 } });
    const result = await resolvePort('api');
    expect(result).toEqual({ name: 'api', port: 4000, profile: 'dev' });
  });

  it('returns null if profile not found', async () => {
    mockLoadConfig.mockResolvedValue({ activeProfile: 'missing', ports: {} });
    mockGetProfile.mockResolvedValue(null);
    const result = await resolvePort('api');
    expect(result).toBeNull();
  });
});

describe('resolveAllPorts', () => {
  beforeEach(() => jest.clearAllMocks());

  it('returns all ports from default config', async () => {
    mockLoadConfig.mockResolvedValue({ ports: { web: 3000, api: 4000 } });
    const results = await resolveAllPorts();
    expect(results).toHaveLength(2);
    expect(results[0].profile).toBe('default');
  });

  it('returns all ports from active profile', async () => {
    mockLoadConfig.mockResolvedValue({ activeProfile: 'staging', ports: {} });
    mockGetProfile.mockResolvedValue({ ports: { web: 8080, db: 5432 } });
    const results = await resolveAllPorts();
    expect(results).toHaveLength(2);
    expect(results.every(r => r.profile === 'staging')).toBe(true);
  });

  it('returns empty array if profile missing', async () => {
    mockLoadConfig.mockResolvedValue({ activeProfile: 'ghost', ports: {} });
    mockGetProfile.mockResolvedValue(null);
    const results = await resolveAllPorts();
    expect(results).toEqual([]);
  });
});
