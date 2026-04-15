import { Command } from 'commander';
import { registerSwitchCommands } from './switch';
import * as store from '../config/store';

jest.mock('../config/store');

const mockLoadConfig = store.loadConfig as jest.MockedFunction<typeof store.loadConfig>;
const mockSaveConfig = store.saveConfig as jest.MockedFunction<typeof store.saveConfig>;

function makeProgram(): Command {
  const program = new Command();
  program.exitOverride();
  registerSwitchCommands(program);
  return program;
}

const baseConfig = {
  activeProfile: null,
  profiles: {
    dev: { ports: { api: 3000, web: 4000 } },
    staging: { ports: { api: 4000, web: 5000 } },
  },
  ports: {},
};

describe('switch command', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSaveConfig.mockResolvedValue(undefined);
  });

  it('switches to an existing profile', async () => {
    mockLoadConfig.mockResolvedValue({ ...baseConfig });
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

    await makeProgram().parseAsync(['switch', 'dev'], { from: 'user' });

    expect(mockSaveConfig).toHaveBeenCalledWith(
      expect.objectContaining({ activeProfile: 'dev' })
    );
    expect(consoleSpy).toHaveBeenCalledWith('Switched to profile: dev');
    consoleSpy.mockRestore();
  });

  it('prints dry-run output without saving', async () => {
    mockLoadConfig.mockResolvedValue({ ...baseConfig });
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

    await makeProgram().parseAsync(['switch', 'dev', '--dry-run'], { from: 'user' });

    expect(mockSaveConfig).not.toHaveBeenCalled();
    expect(consoleSpy).toHaveBeenCalledWith('[dry-run] Would switch to profile: dev');
    consoleSpy.mockRestore();
  });

  it('shows error for unknown profile', async () => {
    mockLoadConfig.mockResolvedValue({ ...baseConfig });
    const errorSpy = jest.spyOn(console, 'error').mockImplementation();
    const exitSpy = jest.spyOn(process, 'exit').mockImplementation(() => { throw new Error('exit'); });

    await expect(
      makeProgram().parseAsync(['switch', 'unknown'], { from: 'user' })
    ).rejects.toThrow();

    expect(errorSpy).toHaveBeenCalledWith('Profile "unknown" not found.');
    errorSpy.mockRestore();
    exitSpy.mockRestore();
  });
});

describe('current command', () => {
  it('shows the active profile', async () => {
    mockLoadConfig.mockResolvedValue({ ...baseConfig, activeProfile: 'dev' });
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

    await makeProgram().parseAsync(['current'], { from: 'user' });

    expect(consoleSpy).toHaveBeenCalledWith('Active profile: dev');
    consoleSpy.mockRestore();
  });

  it('shows message when no profile is active', async () => {
    mockLoadConfig.mockResolvedValue({ ...baseConfig, activeProfile: null });
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

    await makeProgram().parseAsync(['current'], { from: 'user' });

    expect(consoleSpy).toHaveBeenCalledWith('No active profile set.');
    consoleSpy.mockRestore();
  });
});
