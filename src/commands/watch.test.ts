import { Command } from 'commander';
import { registerWatchCommands } from './watch';
import * as watcher from '../watch/watcher';
import * as store from '../config/store';

jest.mock('../watch/watcher');
jest.mock('../config/store');

const mockWatchAndReload = watcher.watchAndReload as jest.Mock;
const mockStopWatch = watcher.stopWatch as jest.Mock;
const mockIsWatching = watcher.isWatching as jest.Mock;
const mockGetConfigPath = store.getConfigPath as jest.Mock;

function makeProgram() {
  const program = new Command();
  program.exitOverride();
  registerWatchCommands(program);
  return program;
}

describe('watch command', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetConfigPath.mockReturnValue('/mock/portkey.json');
    mockWatchAndReload.mockResolvedValue(jest.fn());
  });

  it('starts watching config file', async () => {
    const program = makeProgram();
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
    await program.parseAsync(['watch'], { from: 'user' });
    expect(mockWatchAndReload).toHaveBeenCalledWith(
      '/mock/portkey.json',
      expect.any(Function)
    );
    consoleSpy.mockRestore();
  });

  it('stops watch when --stop passed and watching', async () => {
    mockIsWatching.mockReturnValue(true);
    const program = makeProgram();
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
    await program.parseAsync(['watch', '--stop'], { from: 'user' });
    expect(mockStopWatch).toHaveBeenCalled();
    expect(consoleSpy).toHaveBeenCalledWith('Watch stopped.');
    consoleSpy.mockRestore();
  });

  it('reports no active watch when --stop passed and not watching', async () => {
    mockIsWatching.mockReturnValue(false);
    const program = makeProgram();
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
    await program.parseAsync(['watch', '--stop'], { from: 'user' });
    expect(mockStopWatch).not.toHaveBeenCalled();
    expect(consoleSpy).toHaveBeenCalledWith('No active watch to stop.');
    consoleSpy.mockRestore();
  });
});
