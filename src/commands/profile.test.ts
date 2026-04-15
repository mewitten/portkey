import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Command } from 'commander';
import { registerProfileCommands } from './profile';

const mockCreate = vi.fn();
const mockDelete = vi.fn();
const mockSwitch = vi.fn();
const mockGetActive = vi.fn();
const mockList = vi.fn();

vi.mock('../profiles/manager', () => ({
  createProfile: (...a: any[]) => mockCreate(...a),
  deleteProfile: (...a: any[]) => mockDelete(...a),
  switchProfile: (...a: any[]) => mockSwitch(...a),
  getActiveProfile: () => mockGetActive(),
  listProfiles: () => mockList(),
}));

function makeProgram() {
  const program = new Command();
  program.exitOverride();
  registerProfileCommands(program);
  return program;
}

beforeEach(() => {
  vi.clearAllMocks();
  mockCreate.mockReturnValue({ name: 'dev', ports: {} });
  mockList.mockReturnValue([]);
  mockGetActive.mockReturnValue(null);
});

describe('profile create', () => {
  it('calls createProfile with name and description', async () => {
    const program = makeProgram();
    await program.parseAsync(['node', 'cli', 'profile', 'create', 'dev', '-d', 'Development']);
    expect(mockCreate).toHaveBeenCalledWith('dev', 'Development');
  });
});

describe('profile delete', () => {
  it('calls deleteProfile with name', async () => {
    const program = makeProgram();
    await program.parseAsync(['node', 'cli', 'profile', 'delete', 'dev']);
    expect(mockDelete).toHaveBeenCalledWith('dev');
  });
});

describe('profile use', () => {
  it('calls switchProfile with name', async () => {
    const program = makeProgram();
    await program.parseAsync(['node', 'cli', 'profile', 'use', 'dev']);
    expect(mockSwitch).toHaveBeenCalledWith('dev');
  });
});

describe('profile list', () => {
  it('prints message when no profiles exist', async () => {
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {});
    const program = makeProgram();
    await program.parseAsync(['node', 'cli', 'profile', 'list']);
    expect(spy).toHaveBeenCalledWith(expect.stringContaining('No profiles'));
    spy.mockRestore();
  });
});
