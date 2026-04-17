import { Command } from 'commander';
import { registerDiffCommands } from './diff';
import * as differ from '../diff';

jest.mock('../diff');

const mockDiff = differ.diffProfilesFlat as jest.Mock;

function makeProgram() {
  const program = new Command();
  program.exitOverride();
  registerDiffCommands(program);
  return program;
}

describe('diff command', () => {
  let consoleLog: jest.SpyInstance;
  let consoleError: jest.SpyInstance;

  beforeEach(() => {
    consoleLog = jest.spyOn(console, 'log').mockImplementation(() => {});
    consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => jest.restoreAllMocks());

  it('prints no differences message when profiles are identical', async () => {
    mockDiff.mockReturnValue([]);
    makeProgram().parse(['diff', 'dev', 'dev'], { from: 'user' });
    expect(consoleLog).toHaveBeenCalledWith(expect.stringContaining('No differences'));
  });

  it('prints diffs when profiles differ', async () => {
    mockDiff.mockReturnValue([
      { key: 'API', from: 3000, to: 4000, type: 'changed' },
    ]);
    makeProgram().parse(['diff', 'dev', 'staging'], { from: 'user' });
    expect(consoleLog).toHaveBeenCalledWith(expect.stringContaining('API'));
  });

  it('outputs JSON when --json flag is set', async () => {
    const data = [{ key: 'API', from: 3000, to: 4000, type: 'changed' }];
    mockDiff.mockReturnValue(data);
    makeProgram().parse(['diff', 'dev', 'staging', '--json'], { from: 'user' });
    expect(consoleLog).toHaveBeenCalledWith(JSON.stringify(data, null, 2));
  });

  it('exits with error on exception', async () => {
    mockDiff.mockImplementation(() => { throw new Error('fail'); });
    const exitSpy = jest.spyOn(process, 'exit').mockImplementation(() => { throw new Error('exit'); });
    expect(() => makeProgram().parse(['diff', 'a', 'b'], { from: 'user' })).toThrow('exit');
    expect(consoleError).toHaveBeenCalled();
    exitSpy.mockRestore();
  });
});
