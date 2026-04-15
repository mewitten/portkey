import { Command } from 'commander';
import { registerUseCommands } from './use';
import * as store from '../config/store';
import * as profileManager from '../profiles/manager';
import * as envGenerator from '../env/generator';
import * as fs from 'fs';

jest.mock('../config/store');
jest.mock('../profiles/manager');
jest.mock('../env/generator');
jest.mock('fs');

const mockLoadConfig = store.loadConfig as jest.MockedFunction<typeof store.loadConfig>;
const mockSaveConfig = store.saveConfig as jest.MockedFunction<typeof store.saveConfig>;
const mockGetProfile = profileManager.getProfile as jest.MockedFunction<typeof profileManager.getProfile>;
const mockGenerateEnvContent = envGenerator.generateEnvContent as jest.MockedFunction<typeof envGenerator.generateEnvContent>;
const mockWriteFileSync = fs.writeFileSync as jest.MockedFunction<typeof fs.writeFileSync>;

function makeProgram(): Command {
  const program = new Command();
  program.exitOverride();
  registerUseCommands(program);
  return program;
}

const sampleConfig = {
  activeProfile: null,
  profiles: {
    dev: { ports: { API: 3000, DB: 5432 } }
  }
};

beforeEach(() => {
  jest.clearAllMocks();
  jest.spyOn(console, 'log').mockImplementation(() => {});
  jest.spyOn(console, 'error').mockImplementation(() => {});
  jest.spyOn(process, 'exit').mockImplementation(() => { throw new Error('exit'); });
});

test('use: switches to existing profile and writes env file', async () => {
  mockLoadConfig.mockResolvedValue({ ...sampleConfig } as any);
  mockSaveConfig.mockResolvedValue(undefined);
  mockGetProfile.mockReturnValue({ ports: { API: 3000, DB: 5432 } } as any);
  mockGenerateEnvContent.mockReturnValue('API=3000\nDB=5432\n');

  const program = makeProgram();
  await program.parseAsync(['use', 'dev'], { from: 'user' });

  expect(mockSaveConfig).toHaveBeenCalledWith(expect.objectContaining({ activeProfile: 'dev' }));
  expect(mockWriteFileSync).toHaveBeenCalled();
  expect(console.log).toHaveBeenCalledWith('Switched to profile: dev');
});

test('use: exits when profile not found', async () => {
  mockLoadConfig.mockResolvedValue({ ...sampleConfig } as any);
  mockGetProfile.mockReturnValue(undefined);

  const program = makeProgram();
  await expect(program.parseAsync(['use', 'missing'], { from: 'user' })).rejects.toThrow('exit');
  expect(process.exit).toHaveBeenCalledWith(1);
});

test('use --no-env: skips writing env file', async () => {
  mockLoadConfig.mockResolvedValue({ ...sampleConfig } as any);
  mockSaveConfig.mockResolvedValue(undefined);
  mockGetProfile.mockReturnValue({ ports: { API: 3000 } } as any);

  const program = makeProgram();
  await program.parseAsync(['use', 'dev', '--no-env'], { from: 'user' });

  expect(mockWriteFileSync).not.toHaveBeenCalled();
});

test('current: shows active profile', async () => {
  mockLoadConfig.mockResolvedValue({ activeProfile: 'dev', profiles: {} } as any);
  mockGetProfile.mockReturnValue({ ports: { API: 3000 } } as any);

  const program = makeProgram();
  await program.parseAsync(['current'], { from: 'user' });

  expect(console.log).toHaveBeenCalledWith('Current profile: dev');
});

test('current: informs user when no active profile', async () => {
  mockLoadConfig.mockResolvedValue({ activeProfile: null, profiles: {} } as any);

  const program = makeProgram();
  await program.parseAsync(['current'], { from: 'user' });

  expect(console.log).toHaveBeenCalledWith(expect.stringContaining('No active profile'));
});
