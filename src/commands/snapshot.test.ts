import { Command } from 'commander';
import { registerSnapshotCommands } from './snapshot';
import * as snapshotModule from '../snapshot';

function makeProgram() {
  const program = new Command();
  program.exitOverride();
  registerSnapshotCommands(program);
  return program;
}

beforeEach(() => jest.resetAllMocks());

test('snapshot create calls createSnapshot', async () => {
  jest.spyOn(snapshotModule, 'createSnapshot').mockResolvedValue({ name: 'v1', timestamp: '2024-01-01T00:00:00.000Z', config: {} as any });
  const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
  await makeProgram().parseAsync(['node', 'test', 'snapshot', 'create', 'v1']);
  expect(snapshotModule.createSnapshot).toHaveBeenCalledWith('v1');
  consoleSpy.mockRestore();
});

test('snapshot list prints no snapshots message', async () => {
  jest.spyOn(snapshotModule, 'loadSnapshots').mockResolvedValue([]);
  const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
  await makeProgram().parseAsync(['node', 'test', 'snapshot', 'list']);
  expect(consoleSpy).toHaveBeenCalledWith('No snapshots found.');
  consoleSpy.mockRestore();
});

test('snapshot restore calls restoreSnapshot', async () => {
  jest.spyOn(snapshotModule, 'restoreSnapshot').mockResolvedValue(undefined);
  const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
  await makeProgram().parseAsync(['node', 'test', 'snapshot', 'restore', 'v1']);
  expect(snapshotModule.restoreSnapshot).toHaveBeenCalledWith('v1');
  consoleSpy.mockRestore();
});

test('snapshot delete calls deleteSnapshot', async () => {
  jest.spyOn(snapshotModule, 'deleteSnapshot').mockResolvedValue(undefined);
  const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
  await makeProgram().parseAsync(['node', 'test', 'snapshot', 'delete', 'v1']);
  expect(snapshotModule.deleteSnapshot).toHaveBeenCalledWith('v1');
  consoleSpy.mockRestore();
});
