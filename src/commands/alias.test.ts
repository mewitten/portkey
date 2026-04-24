import { Command } from 'commander';
import { registerAliasCommands } from './alias';
import * as store from '../config/store';
import * as aliaser from '../alias/aliaser';

function makeProgram() {
  const program = new Command();
  program.exitOverride();
  registerAliasCommands(program);
  return program;
}

describe('alias commands', () => {
  const baseConfig = {
    profiles: {},
    aliases: { staging: 'prod' },
    active: null,
  };

  beforeEach(() => {
    jest.spyOn(store, 'loadConfig').mockResolvedValue(baseConfig as any);
    jest.spyOn(store, 'saveConfig').mockResolvedValue(undefined);
  });

  afterEach(() => jest.restoreAllMocks());

  it('list prints aliases', async () => {
    jest.spyOn(aliaser, 'getAliases').mockReturnValue({ staging: 'prod' });
    const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
    await makeProgram().parseAsync(['alias', 'list'], { from: 'user' });
    expect(spy).toHaveBeenCalledWith(expect.stringContaining('staging'));
    spy.mockRestore();
  });

  it('list prints empty message when no aliases', async () => {
    jest.spyOn(aliaser, 'getAliases').mockReturnValue({});
    const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
    await makeProgram().parseAsync(['alias', 'list'], { from: 'user' });
    expect(spy).toHaveBeenCalledWith('No aliases defined.');
    spy.mockRestore();
  });

  it('add saves new alias', async () => {
    jest.spyOn(aliaser, 'addAlias').mockReturnValue(baseConfig as any);
    const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
    await makeProgram().parseAsync(['alias', 'add', 'dev', 'development'], { from: 'user' });
    expect(aliaser.addAlias).toHaveBeenCalledWith(baseConfig, 'dev', 'development');
    expect(store.saveConfig).toHaveBeenCalled();
    spy.mockRestore();
  });

  it('remove deletes alias', async () => {
    jest.spyOn(aliaser, 'removeAlias').mockReturnValue(baseConfig as any);
    const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
    await makeProgram().parseAsync(['alias', 'remove', 'staging'], { from: 'user' });
    expect(aliaser.removeAlias).toHaveBeenCalledWith(baseConfig, 'staging');
    spy.mockRestore();
  });

  it('resolve prints target profile', async () => {
    jest.spyOn(aliaser, 'resolveAlias').mockReturnValue('prod');
    const spy = jest.spyOn(console, 'log').mockImplementation(() => {});
    await makeProgram().parseAsync(['alias', 'resolve', 'staging'], { from: 'user' });
    expect(spy).toHaveBeenCalledWith('prod');
    spy.mockRestore();
  });

  it('resolve exits with error when alias not found', async () => {
    jest.spyOn(aliaser, 'resolveAlias').mockReturnValue(null);
    const errSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const exitSpy = jest.spyOn(process, 'exit').mockImplementation(() => { throw new Error('exit'); });
    await expect(
      makeProgram().parseAsync(['alias', 'resolve', 'missing'], { from: 'user' })
    ).rejects.toThrow('exit');
    expect(exitSpy).toHaveBeenCalledWith(1);
    errSpy.mockRestore();
    exitSpy.mockRestore();
  });
});
