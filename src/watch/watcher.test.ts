import * as fs from 'fs';
import { startWatch, stopWatch, isWatching } from './watcher';

jest.mock('fs');

const mockWatch = fs.watch as jest.Mock;

describe('watcher', () => {
  let mockWatcher: { close: jest.Mock };

  beforeEach(() => {
    mockWatcher = { close: jest.fn() };
    mockWatch.mockReturnValue(mockWatcher);
  });

  afterEach(() => {
    stopWatch();
    jest.clearAllMocks();
  });

  it('starts watching a file', () => {
    const cb = jest.fn();
    startWatch('/some/path/config.json', cb);
    expect(CalledWith(
      '/some/path/config.json',
      { persistent: false },
      expect.any(Function)
    );
    expect(isWatching()).toBe(true);
  });

  it('invokes callback on change event', () => {
    const cb = jest.fn();
    startWatch('/some/path/config.json', cb);
    const handler = mockWatch.mock.calls[0][2];
    handler('change', 'config.json');
    expect(cb).toHaveBeenCalledWith('change', 'config.json');
  });

  it('does not invoke callback when filename is null', () => {
    const cb = jest.fn();
    startWatch('/some/path/config.json', cb);
    const handler = mockWatch.mock.calls[0][2];
    handler('change', null);
    expect(cb).not.toHaveBeenCalled();
  });

  it('stops watching', () => {
    startWatch('/some/path/config.json', jest.fn());
    stopWatch();
    expect(mockWatcher.close).toHaveBeenCalled();
    expect(isWatching()).toBe(false);
  });

  it('replaces existing watcher on re-start', () => {
    startWatch('/path/a', jest.fn());
    startWatch('/path/b', jest.fn());
    expect(mockWatcher.close).toHaveBeenCalledTimes(1);
    expect(mockWatch).toHaveBeenCalledTimes(2);
  });
});
