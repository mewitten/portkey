import { Command } from 'commander';
import { registerHistoryCommands } from './history';
import * as historyModule from '../history';
import * as store from '../config/store';

function makeProgram() {
  const program = new Command();
  program.exitOverride();
  registerHistoryCommands(program);
  return program;
}

const mockConfig = {
  activeProfile: 'dev',
  profiles: { dev: { ports: { APP: 3000 } } },
};

const mockEntries = [
  { timestamp: '2024-01-01T10:00:00Z', fromProfile: 'staging', toProfile: 'dev', note: undefined },
  { timestamp: '2024-01-01T09:00:00Z', fromProfile: undefined, toProfile: 'staging', note: 'initial' },
];

beforeEach(() => {
  jest.spyOn(store, 'loadConfig').mockResolvedValue(mockConfig as any);
  jest.spyOn(historyModule, 'getRecentHistory').mockResolvedValue(mockEntries as any);
  jest.spyOn(historyModule, 'clearHistory').mockResolvedValue(undefined);
  jest.spyOn(console, 'log').mockImplementation(() => {});
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => jest.restoreAllMocks());

describe('history list', () => {
  it('prints entries in human-readable format', async () => {
    const program = makeProgram();
    await program.parseAsync(['node', 'test', 'history', 'list']);
    expect(console.log).toHaveBeenCalledWith(expect.stringContaining('staging → dev'));
  });

  it('outputs JSON when --json flag is set', async () => {
    const program = makeProgram();
    await program.parseAsync(['node', 'test', 'history', 'list', '--json']);
    const calls = (console.log as jest.Mock).mock.calls.map((c: any) => c[0]);
    const jsonOutput = calls.find((c: string) => c.startsWith('['));
    expect(jsonOutput).toBeDefined();
    expect(JSON.parse(jsonOutput)).toEqual(mockEntries);
  });

  it('shows message when no history exists', async () => {
    jest.spyOn(historyModule, 'getRecentHistory').mockResolvedValue([]);
    const program = makeProgram();
    await program.parseAsync(['node', 'test', 'history', 'list']);
    expect(console.log).toHaveBeenCalledWith('No history found.');
  });

  it('respects --limit option', async () => {
    const program = makeProgram();
    await program.parseAsync(['node', 'test', 'history', 'list', '--limit', '5']);
    expect(historyModule.getRecentHistory).toHaveBeenCalledWith(mockConfig, 5);
  });
});

describe('history clear', () => {
  it('clears history when --force is passed', async () => {
    const program = makeProgram();
    await program.parseAsync(['node', 'test', 'history', 'clear', '--force']);
    expect(historyModule.clearHistory).toHaveBeenCalledWith(mockConfig);
    expect(console.log).toHaveBeenCalledWith('History cleared.');
  });

  it('does not clear without --force', async () => {
    const program = makeProgram();
    await program.parseAsync(['node', 'test', 'history', 'clear']);
    expect(historyModule.clearHistory).not.toHaveBeenCalled();
    expect(console.log).toHaveBeenCalledWith(expect.stringContaining('--force'));
  });
});
