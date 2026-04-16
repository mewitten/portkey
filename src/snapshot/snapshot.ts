import { loadConfig, saveConfig } from '../config/store';
import { PortConfig } from '../config/schema';

export interface Snapshot {
  name: string;
  timestamp: string;
  config: PortConfig;
}

export async function createSnapshot(name: string): Promise<Snapshot> {
  const config = await loadConfig();
  const snapshot: Snapshot = {
    name,
    timestamp: new Date().toISOString(),
    config,
  };
  const existing = await loadSnapshots();
  existing.push(snapshot);
  await saveSnapshots(existing);
  return snapshot;
}

export async function loadSnapshots(): Promise<Snapshot[]> {
  const config = await loadConfig();
  return (config as any).__snapshots__ ?? [];
}

export async function saveSnapshots(snapshots: Snapshot[]): Promise<void> {
  const config = await loadConfig();
  (config as any).__snapshots__ = snapshots;
  await saveConfig(config);
}

export async function restoreSnapshot(name: string): Promise<void> {
  const snapshots = await loadSnapshots();
  const snap = snapshots.find((s) => s.name === name);
  if (!snap) throw new Error(`Snapshot "${name}" not found.`);
  const restored = { ...snap.config, __snapshots__: snapshots };
  await saveConfig(restored as any);
}

export async function deleteSnapshot(name: string): Promise<void> {
  const snapshots = await loadSnapshots();
  const filtered = snapshots.filter((s) => s.name !== name);
  if (filtered.length === snapshots.length) throw new Error(`Snapshot "${name}" not found.`);
  await saveSnapshots(filtered);
}
