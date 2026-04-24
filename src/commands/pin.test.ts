import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Command } from 'commander';
import { registerPinCommands } from './pin';
import * as pinner from '../pin/pinner';

function makeProgram() {
  const program = new Command();
  program.exitOverride();
  registerPinCommands(program);
  return program;
}

beforeEach(() => vi.restoreAllMocks());

describe('pin add', () => {
  it('prints success on pin', async () => {
    vi.spyOn(pinner, 'pinPort').mockResolvedValue({ profile: 'dev', key: 'api', port: 3000, pinnedAt: '' });
    const log = vi.spyOn(console, 'log').mockImplementation(() => {});
    await makeProgram().parseAsync(['pin', 'add', 'dev', 'api'], { from: 'user' });
    expect(log).toHaveBeenCalledWith(expect.stringContaining('Pinned api'));
  });

  it('prints error and exits on failure', async () => {
    vi.spyOn(pinner, 'pinPort').mockRejectedValue(new Error('already pinned'));
    const err = vi.spyOn(console, 'error').mockImplementation(() => {});
    const exit = vi.spyOn(process, 'exit').mockImplementation(() => { throw new Error('exit'); });
    await expect(makeProgram().parseAsync(['pin', 'add', 'dev', 'api'], { from: 'user' })).rejects.toThrow('exit');
    expect(err).toHaveBeenCalledWith(expect.stringContaining('already pinned'));
  });
});

describe('pin remove', () => {
  it('prints success on unpin', async () => {
    vi.spyOn(pinner, 'unpinPort').mockResolvedValue();
    const log = vi.spyOn(console, 'log').mockImplementation(() => {});
    await makeProgram().parseAsync(['pin', 'remove', 'dev', 'api'], { from: 'user' });
    expect(log).toHaveBeenCalledWith(expect.stringContaining('Unpinned api'));
  });
});

describe('pin list', () => {
  it('prints pinned ports', async () => {
    vi.spyOn(pinner, 'getPinnedPorts').mockResolvedValue([
      { profile: 'dev', key: 'api', port: 3000, pinnedAt: '2024-01-01T00:00:00.000Z' },
    ]);
    const log = vi.spyOn(console, 'log').mockImplementation(() => {});
    await makeProgram().parseAsync(['pin', 'list'], { from: 'user' });
    expect(log).toHaveBeenCalledWith(expect.stringContaining('api'));
    expect(log).toHaveBeenCalledWith(expect.stringContaining('3000'));
  });

  it('prints message when no pins', async () => {
    vi.spyOn(pinner, 'getPinnedPorts').mockResolvedValue([]);
    const log = vi.spyOn(console, 'log').mockImplementation(() => {});
    await makeProgram().parseAsync(['pin', 'list'], { from: 'user' });
    expect(log).toHaveBeenCalledWith('No pinned ports.');
  });
});
