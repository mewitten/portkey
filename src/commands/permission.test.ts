import { Command } from 'commander';
import { registerPermissionCommands } from './permission';
import * as store from '../config/store';
import { PortConfig } from '../config/schema';

function makeConfig(overrides: Partial<PortConfig> = {}): PortConfig {
  return {
    version: 1,
    activeProfile: 'default',
    profiles: { default: { ports: { web: 3000 } } },
    ...overrides,
  } as PortConfig;
}

function makeProgram() {
  const program = new Command();
  program.exitOverride();
  registerPermissionCommands(program);
  return program;
}

describe('permission set', () => {
  it('saves updated permissions', async () => {
    const config = makeConfig();
    jest.spyOn(store, 'loadConfig').mockResolvedValue(config);
    const saveSpy = jest.spyOn(store, 'saveConfig').mockResolvedValue(undefined);
    const program = makeProgram();
    await program.parseAsync(['permission', 'set', 'default', 'write', 'alice'], { from: 'user' });
    expect(saveSpy).toHaveBeenCalled();
    const saved = saveSpy.mock.calls[0][0] as any;
    expect(saved.permissions.permissions[0]).toMatchObject({ profile: 'default', level: 'write', users: ['alice'] });
  });

  it('exits on invalid level', async () => {
    const config = makeConfig();
    jest.spyOn(store, 'loadConfig').mockResolvedValue(config);
    const program = makeProgram();
    const exitSpy = jest.spyOn(process, 'exit').mockImplementation(() => { throw new Error('exit'); });
    await expect(program.parseAsync(['permission', 'set', 'default', 'superuser', 'alice'], { from: 'user' })).rejects.toThrow();
    exitSpy.mockRestore();
  });
});

describe('permission remove', () => {
  it('removes permissions for profile', async () => {
    const config = makeConfig();
    jest.spyOn(store, 'loadConfig').mockResolvedValue(config);
    const saveSpy = jest.spyOn(store, 'saveConfig').mockResolvedValue(undefined);
    const program = makeProgram();
    await program.parseAsync(['permission', 'remove', 'default'], { from: 'user' });
    expect(saveSpy).toHaveBeenCalled();
  });
});

describe('permission list', () => {
  it('prints no permissions message when empty', async () => {
    const config = makeConfig();
    jest.spyOn(store, 'loadConfig').mockResolvedValue(config);
    const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    const program = makeProgram();
    await program.parseAsync(['permission', 'list'], { from: 'user' });
    expect(logSpy).toHaveBeenCalledWith('No permissions configured.');
    logSpy.mockRestore();
  });
});

describe('permission check', () => {
  it('reports access correctly', async () => {
    const config = makeConfig();
    jest.spyOn(store, 'loadConfig').mockResolvedValue(config);
    const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    const program = makeProgram();
    await program.parseAsync(['permission', 'check', 'default', 'alice', 'read'], { from: 'user' });
    expect(logSpy.mock.calls[0][0]).toContain('✔');
    logSpy.mockRestore();
  });
});
