import { exportConfig, ExportOptions } from './exporter';
import * as store from '../config/store';
import * as profileManager from '../profiles/manager';
import * as fs from 'fs';

jest.mock('../config/store');
jest.mock('../profiles/manager');
jest.mock('fs');

const mockConfig = { activeProfile: 'default' };
const mockProfiles = {
  default: {
    name: 'default',
    ports: { api: 3000, web: 8080, db: 5432 },
  },
};

beforeEach(() => {
  jest.clearAllMocks();
  (store.loadConfig as jest.Mock).mockReturnValue(mockConfig);
  (profileManager.loadProfiles as jest.Mock).mockReturnValue(mockProfiles);
});

describe('exportConfig', () => {
  it('exports JSON format', () => {
    const result = exportConfig({ format: 'json' });
    const parsed = JSON.parse(result);
    expect(parsed.profile).toBe('default');
    expect(parsed.ports.api).toBe(3000);
  });

  it('exports dotenv format', () => {
    const result = exportConfig({ format: 'dotenv' });
    expect(result).toContain('API_PORT=3000');
    expect(result).toContain('WEB_PORT=8080');
    expect(result).toContain('DB_PORT=5432');
  });

  it('exports env format same as dotenv', () => {
    const result = exportConfig({ format: 'env' });
    expect(result).toContain('API_PORT=3000');
  });

  it('throws for unknown profile', () => {
    expect(() =>
      exportConfig({ format: 'json', profile: 'nonexistent' })
    ).toThrow('Profile "nonexistent" not found.');
  });

  it('writes to file when outputPath is provided', () => {
    exportConfig({ format: 'json', outputPath: './ports.json' });
    expect(fs.writeFileSync).toHaveBeenCalled();
  });

  it('uses specified profile over active profile', () => {
    (profileManager.loadProfiles as jest.Mock).mockReturnValue({
      ...mockProfiles,
      staging: { name: 'staging', ports: { api: 4000 } },
    });
    const result = exportConfig({ format: 'json', profile: 'staging' });
    const parsed = JSON.parse(result);
    expect(parsed.profile).toBe('staging');
    expect(parsed.ports.api).toBe(4000);
  });
});
