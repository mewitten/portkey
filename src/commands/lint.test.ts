import { Command } from 'commander';
import { registerLintCommands } from './lint';
import * as store from '../config/store';
import * as linter from '../lint/linter';

function makeProgram() {
  const program = new Command();
  program.exitOverride();
  registerLintCommands(program);
  return program;
}

describe('lint command', () => {
  const baseConfig = {
    activeProfile: 'dev',
    profiles: {
      dev: { ports: { web: 3000, api: 4000 } },
    },
  };

  beforeEach(() => {
    jest.spyOn(store, 'loadConfig').mockResolvedValue(baseConfig as any);
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => jest.restoreAllMocks());

  it('prints success when no issues found', async () => {
    jest.spyOn(linter, 'lintConfig').mockReturnValue([]);
    await makeProgram().parseAsync(['node', 'test', 'lint']);
    expect(console.log).toHaveBeenCalledWith('✅ No lint issues found.');
  });

  it('prints warnings without exiting with error', async () => {
    jest.spyOn(linter, 'lintConfig').mockReturnValue([
      { severity: 'warning', message: 'Port 3000 is commonly used', profile: 'dev' },
    ]);
    const exitSpy = jest.spyOn(process, 'exit').mockImplementation(() => { throw new Error('exit'); });
    await makeProgram().parseAsync(['node', 'test', 'lint']);
    expect(exitSpy).not.toHaveBeenCalled();
    expect(console.log).toHaveBeenCalledWith(expect.stringContaining('⚠️'));
  });

  it('exits with code 1 when errors are found', async () => {
    jest.spyOn(linter, 'lintConfig').mockReturnValue([
      { severity: 'error', message: 'Duplicate port 3000', profile: 'dev', suggestion: 'Use a unique port' },
    ]);
    const exitSpy = jest.spyOn(process, 'exit').mockImplementation(() => { throw new Error('exit'); });
    await expect(
      makeProgram().parseAsync(['node', 'test', 'lint'])
    ).rejects.toThrow('exit');
    expect(exitSpy).toHaveBeenCalledWith(1);
  });

  it('outputs JSON when --json flag is passed', async () => {
    const results = [{ severity: 'warning', message: 'test warning' }];
    jest.spyOn(linter, 'lintConfig').mockReturnValue(results as any);
    await makeProgram().parseAsync(['node', 'test', 'lint', '--json']);
    expect(console.log).toHaveBeenCalledWith(JSON.stringify(results, null, 2));
  });

  it('passes profile option to lintConfig', async () => {
    const lintSpy = jest.spyOn(linter, 'lintConfig').mockReturnValue([]);
    await makeProgram().parseAsync(['node', 'test', 'lint', '--profile', 'dev']);
    expect(lintSpy).toHaveBeenCalledWith(baseConfig, 'dev');
  });
});
