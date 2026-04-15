import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Command } from 'commander';
import { registerDoctorCommands } from './doctor';

vi.mock('../doctor/checker');

import { runAllChecks } from '../doctor/checker';

const mockRunAllChecks = vi.mocked(runAllChecks);

function makeProgram() {
  const program = new Command();
  program.exitOverride();
  registerDoctorCommands(program);
  return program;
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.spyOn(console, 'log').mockImplementation(() => {});
  vi.spyOn(process, 'exit').mockImplementation((() => {}) as any);
});

describe('doctor command', () => {
  it('runs all checks and exits 0 on success', async () => {
    mockRunAllChecks.mockResolvedValue([
      { name: 'config', status: 'ok', message: 'OK' },
      { name: 'active-profile', status: 'ok', message: 'OK' },
      { name: 'port-conflicts', status: 'ok', message: 'No conflicts' },
    ]);
    const program = makeProgram();
    await program.parseAsync(['node', 'portkey', 'doctor']);
    expect(mockRunAllChecks).toHaveBeenCalledOnce();
    expect(process.exit).not.toHaveBeenCalled();
  });

  it('calls process.exit(1) when there are errors', async () => {
    mockRunAllChecks.mockResolvedValue([
      { name: 'config', status: 'error', message: 'No config found' },
    ]);
    const program = makeProgram();
    await program.parseAsync(['node', 'portkey', 'doctor']);
    expect(process.exit).toHaveBeenCalledWith(1);
  });

  it('does not exit with 1 on warnings only', async () => {
    mockRunAllChecks.mockResolvedValue([
      { name: 'active-profile', status: 'warn', message: 'No active profile' },
    ]);
    const program = makeProgram();
    await program.parseAsync(['node', 'portkey', 'doctor']);
    expect(process.exit).not.toHaveBeenCalledWith(1);
  });
});
