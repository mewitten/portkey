import { createSnapshot, loadSnapshots, restoreSnapshot, deleteSnapshot } from './snapshot';
import * as store from '../config/store';

const baseConfig = { activeProfile: 'default', profiles: { default: { ports: { web: 3000 } } } };

beforeEach(() => {
  jest.resetAllMocks();
  jest.spyOn(store, 'loadConfig').mockResolvedValue({ ...baseConfig } as any);
  jest.spyOn(store, 'saveConfig').mockResolvedValue(undefined);
});

test('createSnapshot saves a snapshot', async () => {
  const snap = await createSnapshot('before-upgrade');
  expect(snap.name).toBe('before-upgrade');
  expect(snap.config).toMatchObject(baseConfig);
  expect(store.saveConfig).toHaveBeenCalled();
});

test('loadSnapshots returns empty array when none exist', async () => {
  const snaps = await loadSnapshots();
  expect(snaps).toEqual([]);
});

test('restoreSnapshot throws when snapshot not found', async () => {
  await expect(restoreSnapshot('missing')).rejects.toThrow('Snapshot "missing" not found.');
});

test('deleteSnapshot throws when snapshot not found', async () => {
  await expect(deleteSnapshot('missing')).rejects.toThrow('Snapshot "missing" not found.');
});

test('restoreSnapshot restores config', async () => {
  const snap = { name: 'v1', timestamp: '2024-01-01T00:00:00.000Z', config: baseConfig };
  jest.spyOn(store, 'loadConfig').mockResolvedValue({ ...baseConfig, __snapshots__: [snap] } as any);
  await restoreSnapshot('v1');
  expect(store.saveConfig).toHaveBeenCalled();
});
