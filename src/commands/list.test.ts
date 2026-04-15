import { Command } from 'commander';
import { registerListCommands } from './list';
import { loadConfig } from '../config/store';
import { loadProfiles, getActiveProfile } from '../profiles/manager';

jest.mock('../config/store');
jest.mock('../profiles/manager');

const mockLoadConfig = loadConfig as jest.MockedFunction<typeof loadConfig>;
const mockLoadProfiles = loadProfiles as jest.MockedFunction<typeof loadProfiles>;
const mockGetActiveProfile = getActiveProfile as jest.MockedFunction<typeof getActiveProfile>;

function makeProgram(): Command {
  const program = new Command();
  program.exitOverride();
  registerListCommands(program);
  return program;
}

describe('list command', () => {
  let consoleSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleSpy.mockRestore();
  });

  it('lists ports for the active profile', async () => {
    mockGetActiveProfile.mockResolvedValue('default');
    mockLoadProfiles.mockResolvedValue([{ name: 'default', ports: {} }]);
    mockLoadConfig.mockResolvedValue({ ports: { api: 3000, web: 8080 } });

    const program = makeProgram();
    await program.parseAsync(['node', 'test', 'list']);

    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('default'));
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('api'));
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('3000'));
  });

  it('shows message when no ports configured', async () => {
    mockGetActiveProfile.mockResolvedValue('default');
    mockLoadProfiles.mockResolvedValue([{ name: 'default', ports: {} }]);
    mockLoadConfig.mockResolvedValue({ ports: {} });

    const program = makeProgram();
    await program.parseAsync(['node', 'test', 'list']);

    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('No ports configured'));
  });

  it('lists profiles when --profiles flag is used', async () => {
    mockGetActiveProfile.mockResolvedValue('default');
    mockLoadProfiles.mockResolvedValue([
      { name: 'default', ports: {} },
      { name: 'staging', ports: {} },
    ]);

    const program = makeProgram();
    await program.parseAsync(['node', 'test', 'list', '--profiles']);

    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('default'));
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('staging'));
  });

  it('shows message when no profiles exist', async () => {
    mockGetActiveProfile.mockResolvedValue('default');
    mockLoadProfiles.mockResolvedValue([]);

    const program = makeProgram();
    await program.parseAsync(['node', 'test', 'list', '--profiles']);

    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('No profiles found'));
  });
});
