import { Command } from 'commander';
import { registerLoadCommands } from './load';
import * as loader from '../env/loader';
import * as store from '../config/store';

function makeProgram() {
  const program = new Command();
  program.exitOverride();
  registerLoadCommands(program);
  return program;
}

beforeEach(() => jest.clearAllMocks());
afterEach(() => jest.restoreAllMocks());

describe('load env', () => {
  it('calls loadEnvForProfile with correct args', async () => {
    const spy = jest.spyOn(loader, 'loadEnvForProfile').mockResolvedValue();
    const program = makeProgram();
    await program.parseAsync(['node', 'portkey', 'load', 'env', 'dev', '-o', '.env.dev']);
    expect(spy).toHaveBeenCalledWith('dev', '.env.dev', false);
  });

  it('passes --overwrite flag', async () => {
    const spy = jest.spyOn(loader, 'loadEnvForProfile').mockResolvedValue();
    const program = makeProgram();
    await program.parseAsync(['node', 'portkey', 'load', 'env', 'dev', '--overwrite']);
    expect(spy).toHaveBeenCalledWith('dev', '.env', true);
  });

  it('exits on error', async () => {
    jest.spyOn(loader, 'loadEnvForProfile').mockRejectedValue(new Error('bad'));
    const exitSpy = jest.spyOn(process, 'exit').mockImplementation(() => { throw new Error('exit'); });
    const program = makeProgram();
    await expect(program.parseAsync(['node', 'portkey', 'load', 'env', 'bad'])).rejects.toThrow();
    expect(exitSpy).toHaveBeenCalledWith(1);
  });
});

describe('load merge', () => {
  it('calls mergeEnvForProfile', async () => {
    const spy = jest.spyOn(loader, 'mergeEnvForProfile').mockResolvedValue();
    const program = makeProgram();
    await program.parseAsync(['node', 'portkey', 'load', 'merge', 'dev', '-o', '.env']);
    expect(spy).toHaveBeenCalledWith('dev', '.env');
  });
});

describe('load active', () => {
  it('uses activeProfile from config', async () => {
    jest.spyOn(store, 'loadConfig').mockResolvedValue({ activeProfile: 'staging', profiles: {} } as any);
    const spy = jest.spyOn(loader, 'loadEnvForProfile').mockResolvedValue();
    const program = makeProgram();
    await program.parseAsync(['node', 'portkey', 'load', 'active']);
    expect(spy).toHaveBeenCalledWith('staging', '.env', false);
  });

  it('exits when no active profile', async () => {
    jest.spyOn(store, 'loadConfig').mockResolvedValue({ profiles: {} } as any);
    jest.spyOn(loader, 'loadEnvForProfile').mockResolvedValue();
    const exitSpy = jest.spyOn(process, 'exit').mockImplementation(() => { throw new Error('exit'); });
    const program = makeProgram();
    await expect(program.parseAsync(['node', 'portkey', 'load', 'active'])).rejects.toThrow();
    expect(exitSpy).toHaveBeenCalledWith(1);
  });
});
