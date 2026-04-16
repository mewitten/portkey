import { resolvePort, resolveAllPorts } from './resolver';
import { loadConfig } from '../config/store';
import { getProfile } from '../profiles/manager';

jest.mock('../config/store');
jest.mock('../profiles/manager');

const mockLoadConfig = loadConfig as jest.MockedFunction<typeof loadConfig>;
const mockGetProfile = getProfile as jest.MockedFunction<typeof getProfile>;

const fakeProfile = {
  name: 'default',
  ports: [
    { name: 'api', port: 3000, aliases: ['backend'] },
    { name: 'web', port: 8080, aliases: [] },
  ],
};

beforeEach(() => {
  jest.clearAllMocks();
  mockLoadConfig.mockResolvedValue({ activeProfile: 'default', profiles: {} } as any);
  mockGetProfile.mockResolvedValue(fakeProfile as any);
});

describe('resolvePort', () => {
  it('resolves port by name', async () => {
    const result = await resolvePort('api');
    expect(result).toEqual({ name: 'api', port: 3000, profile: 'default' });
  });

  it('resolves port by alias', async () => {
    const result = await resolvePort('backend');
    expect(result).toEqual({ name: 'api', port: 3000, profile: 'default' });
  });

  it('returns null when port not found', async () => {
    const result = await resolvePort('unknown');
    expect(result).toBeNull();
  });

  it('returns null when no active profile', async () => {
    mockLoadConfig.mockResolvedValue({ activeProfile: null, profiles: {} } as any);
    const result = await resolvePort('api');
    expect(result).toBeNull();
  });

  it('returns null when profile not found', async () => {
    mockGetProfile.mockResolvedValue(null as any);
    const result = await resolvePort('api');
    expect(result).toBeNull();
  });

  it('uses explicit profileName override', async () => {
    const result = await resolvePort('web', 'staging');
    expect(mockGetProfile).toHaveBeenCalledWith('staging');
    expect(result?.port).toBe(8080);
  });
});

describe('resolveAllPorts', () => {
  it('returns all ports for active profile', async () => {
    const results = await resolveAllPorts();
    expect(results).toHaveLength(2);
    expect(results[0]).toEqual({ name: 'api', port: 3000, profile: 'default' });
  });

  it('returns empty array when no active profile', async () => {
    mockLoadConfig.mockResolvedValue({ activeProfile: null, profiles: {} } as any);
    const results = await resolveAllPorts();
    expect(results).toEqual([]);
  });
});
