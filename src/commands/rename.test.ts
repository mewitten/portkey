import { Command } from 'commander';
import { registerRenameCommands } from './rename';

jest.mock('../rename/renamer');

import { renameProfile } from '../rename/renamer';

const mockRenameProfile = renameProfile as jest.MockedFunction<typeof renameProfile>;

function makeProgram() {
  const program = new Command();
  program.exitOverride();
  registerRenameCommands(program);
  return program;
}

describe('rename command', () => {
  beforeEach(() => jest.clearAllMocks());

  it('calls renameProfile with old and new names', async () => {
    mockRenameProfile.mockResolvedValue(undefined);
    const program = makeProgram();
    await program.parseAsync(['node', 'test', 'rename', 'dev', 'development']);
    expect(mockRenameProfile).toHaveBeenCalledWith('dev', 'development');
  });

  it('logs success message after rename', async () => {
    mockRenameProfile.mockResolvedValue(undefined);
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
    const program = makeProgram();
    await program.parseAsync(['node', 'test', 'rename', 'dev', 'development']);
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('development'));
    consoleSpy.mockRestore();
  });

  it('logs error if renameProfile throws', async () => {
    mockRenameProfile.mockRejectedValue(new Error('Profile not found'));
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    const program = makeProgram();
    await program.parseAsync(['node', 'test', 'rename', 'ghost', 'new']);
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Profile not found'));
    consoleSpy.mockRestore();
  });

  it('requires two arguments', async () => {
    const program = makeProgram();
    await expect(
      program.parseAsync(['node', 'test', 'rename', 'onlyone'])
    ).rejects.toThrow();
  });
});
