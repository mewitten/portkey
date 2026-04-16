import { Command } from 'commander';
import { createSnapshot, loadSnapshots, restoreSnapshot, deleteSnapshot } from '../snapshot';

export function registerSnapshotCommands(program: Command): void {
  const snap = program.command('snapshot').description('Manage port config snapshots');

  snap
    .command('create <name>')
    .description('Create a snapshot of the current config')
    .action(async (name: string) => {
      const s = await createSnapshot(name);
      console.log(`Snapshot "${s.name}" created at ${s.timestamp}`);
    });

  snap
    .command('list')
    .description('List all snapshots')
    .action(async () => {
      const snaps = await loadSnapshots();
      if (snaps.length === 0) return console.log('No snapshots found.');
      snaps.forEach((s) => console.log(`  ${s.name}  (${s.timestamp})`));
    });

  snap
    .command('restore <name>')
    .description('Restore config from a snapshot')
    .action(async (name: string) => {
      await restoreSnapshot(name);
      console.log(`Restored config from snapshot "${name}".`);
    });

  snap
    .command('delete <name>')
    .description('Delete a snapshot')
    .action(async (name: string) => {
      await deleteSnapshot(name);
      console.log(`Snapshot "${name}" deleted.`);
    });
}
