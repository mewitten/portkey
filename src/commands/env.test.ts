import { Command } from 'commander';
import { registerEnvCommands } from './env';
import * as generator from '../env/generator';
import * as store from '../config/store';

jest.mock('../env/generator');
jest.mock('../config/store');

const mockConfig = {
  version: '1.0',
  activeProfile: 'default',
  profiles: {
    default: {
      name: 'default',
      ports: { API: 3000, DB: 5432 },
    },
  },
};

function makeProgram() {
  const program = new Command();
  program.exitOverride();
  registerEnvCommands(program);
  return program;
}

beforeEach(() => {
  jest.clearAllMocks();
  (store.loadConfig as jest.Mock).mockReturnValue(mockConfig);
  (generator.generateEnvContent as jest.Mock).mockReturnValue('API=3000\nDB=5432\n');
});

describe('env command', () => {
  it('prints env content for active profile', async () => {
    const spy = jest.spyOn(process.stdout, 'write').mockImplementation(() => true);
    const program = makeProgram();
    await program.parseAsync(['node', 'test', 'env']);
    expect(generator.generateEnvContent).toHaveBeenCalledWith({ API: 3000, DB: 5432 });
    spy.mockRestore();
  });

  it('prints env content for specified profile', async () => {
    const spy = jest.spyOn(process.stdout, 'write').mockImplementation(() => true);
    const program = makeProgram();
    await program.parseAsync(['node', 'test', 'env', '--profile', 'default']);
    expect(generator.generateEnvContent).toHaveBeenCalledWith({ API: 3000, DB: 5432 });
    spy.mockRestore();
  });

  it('throws if profile not found', async () => {
    const program = makeProgram();
    await expect(
      program.parseAsync(['node', 'test', 'env', '--profile', 'missing'])
    ).rejects.toThrow();
  });

  it('throws if no active profile and none specified', async () => {
    (store.loadConfig as jest.Mock).mockReturnValue({ ...mockConfig, activeProfile: undefined });
    const program = makeProgram();
    await expect(
      program.parseAsync(['node', 'test', 'env'])
    ).rejects.toThrow();
  });
});
