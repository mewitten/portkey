import { Command } from 'commander';
import { registerQuotaCommands } from './quota';
import * as quoter from '../quota/quoter';
import { PortConfig } from '../config/schema';

function makeProgram() {
  const program = new Command();
  program.exitOverride();
  registerQuotaCommands(program);
  return program;
}

const baseConfig: PortConfig = {
  activeProfile: 'dev',
  profiles: {
    dev: { ports: { web: 3000, api: 4000, db: 5432 } },
    staging: { ports: { web: 8080, api: 8081 } },
  },
};

describe('quota command', () => {
  let checkQuotaSpy: jest.SpyInstance;

  beforeEach(() => {
    checkQuotaSpy = jest.spyOn(quoter, 'checkQuota');
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('quota check passes with no violations', async () => {
    checkQuotaSpy.mockResolvedValue([]);
    const program = makeProgram();
    const logs: string[] = [];
    jest.spyOn(console, 'log').mockImplementation((msg) => logs.push(msg));
    await program.parseAsync(['node', 'portkey', 'quota', 'check']);
    expect(logs.some((l) => l.includes('within quota'))).toBe(true);
  });

  it('quota check reports violations', async () => {
    checkQuotaSpy.mockResolvedValue([
      { profile: 'dev', portCount: 3, limit: 2, exceeded: true },
    ]);
    const program = makeProgram();
    const logs: string[] = [];
    jest.spyOn(console, 'log').mockImplementation((msg) => logs.push(msg));
    await program.parseAsync(['node', 'portkey', 'quota', 'check']);
    expect(logs.some((l) => l.includes('dev'))).toBe(true);
    expect(logs.some((l) => l.includes('3'))).toBe(true);
  });

  it('quota check for specific profile', async () => {
    checkQuotaSpy.mockResolvedValue([]);
    const program = makeProgram();
    await program.parseAsync(['node', 'portkey', 'quota', 'check', '--profile', 'dev']);
    expect(checkQuotaSpy).toHaveBeenCalledWith(expect.anything(), 'dev');
  });

  it('isWithinQuota returns true message', async () => {
    jest.spyOn(quoter, 'isWithinQuota').mockResolvedValue(true);
    const program = makeProgram();
    const logs: string[] = [];
    jest.spyOn(console, 'log').mockImplementation((msg) => logs.push(msg));
    await program.parseAsync(['node', 'portkey', 'quota', 'status', 'dev']);
    expect(logs.some((l) => l.includes('within'))).toBe(true);
  });
});
