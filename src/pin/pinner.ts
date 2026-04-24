import { loadConfig, saveConfig } from '../config/store';
import { PortConfig } from '../config/schema';

export interface PinnedPort {
  profile: string;
  key: string;
  port: number;
  pinnedAt: string;
}

export async function pinPort(profile: string, key: string): Promise<PinnedPort> {
  const config = await loadConfig();
  const prof = config.profiles[profile];
  if (!prof) throw new Error(`Profile '${profile}' not found`);
  const port = prof.ports[key];
  if (port === undefined) throw new Error(`Port key '${key}' not found in profile '${profile}'`);

  if (!config.pins) config.pins = [];
  const existing = config.pins.find((p: PinnedPort) => p.profile === profile && p.key === key);
  if (existing) throw new Error(`Port '${key}' in profile '${profile}' is already pinned`);

  const entry: PinnedPort = { profile, key, port, pinnedAt: new Date().toISOString() };
  config.pins.push(entry);
  await saveConfig(config);
  return entry;
}

export async function unpinPort(profile: string, key: string): Promise<void> {
  const config = await loadConfig();
  if (!config.pins) throw new Error(`No pins found`);
  const idx = config.pins.findIndex((p: PinnedPort) => p.profile === profile && p.key === key);
  if (idx === -1) throw new Error(`Pin for '${key}' in profile '${profile}' not found`);
  config.pins.splice(idx, 1);
  await saveConfig(config);
}

export async function getPinnedPorts(): Promise<PinnedPort[]> {
  const config = await loadConfig();
  return config.pins ?? [];
}

export async function isPinned(profile: string, key: string): Promise<boolean> {
  const pins = await getPinnedPorts();
  return pins.some((p) => p.profile === profile && p.key === key);
}
