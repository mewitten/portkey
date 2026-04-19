import { validatePortRange, validateNoDuplicatePorts, validateProfile } from './validator';
import * as store from '../config/store';

jest.mock('../config/store');

const mockConfig = {
  profiles: {
    dev: { ports: { api: 3000, web: 3001 } },
    dup: { ports: { api: 3000, web: 3000 } },
    bad: { ports: { api: 0, web: 99999 } },
  },
  active: 'dev',
};

beforeEach(() => {
  (store.loadConfig as jest.Mock).mockResolvedValue(mockConfig);
});

describe('validatePortRange', () => {
  it('accepts valid ports', () => {
    expect(validatePortRange(1)).toBe(true);
    expect(validatePortRange(3000)).toBe(true);
    expect(validatePortRange(65535)).toBe(true);
  });

  it('rejects invalid ports', () => {
    expect(validatePortRange(0)).toBe(false);
    expect(validatePortRange(65536)).toBe(false);
    expect(validatePortRange(3.5)).toBe(false);
  });
});

describe('validateNoDuplicatePorts', () => {
  it('returns empty for unique ports', () => {
    expect(validateNoDuplicatePorts({ a: 3000, b: 3001 })).toHaveLength(0);
  });

  it('warns on duplicate ports', () => {
    const issues = validateNoDuplicatePorts({ a: 3000, b: 3000 });
    expect(issues).toHaveLength(1);
    expect(issues[0].type).toBe('warning');
    expect(issues[0].message).toContain('3000');
  });
});

describe('validateProfile', () => {
  it('returns valid for clean profile', async () => {
    const result = await validateProfile('dev');
    expect(result.valid).toBe(true);
    expect(result.issues).toHaveLength(0);
  });

  it('returns warning for duplicate ports', async () => {
    const result = await validateProfile('dup');
    expect(result.valid).toBe(true);
    expect(result.issues.some(i => i.type === 'warning')).toBe(true);
  });

  it('returns error for out-of-range ports', async () => {
    const result = await validateProfile('bad');
    expect(result.valid).toBe(false);
    expect(result.issues.some(i => i.type === 'error')).toBe(true);
  });

  it('returns error for missing profile', async () => {
    const result = await validateProfile('nonexistent');
    expect(result.valid).toBe(false);
    expect(result.issues[0].message).toContain('not found');
  });
});
