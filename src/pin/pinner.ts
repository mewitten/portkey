import { loadConfig, saveConfig } from '../config/store';
import { PortConfig } from '../config/schema';

export interface PinnedPort {
  key: string;
  port: number;
  profile: string;
  pinnedAt: string;
}

export async function pinPort(profile: string, key: string): Promise<PinnedPort> {
  const config = await loadConfig();
  const prof = config.profiles?.[profile];
  if (!prof) {
    throw new Error(`Profile "${profile}" not found`);
  }
  const port = prof.ports?.[key];
  if (port === undefined) {
    throw new Error(`Port key "${key}" not found in profile "${profile}"`);
  }
  if (!config.pinned) {
    config.pinned = {};
  }
  const entry: PinnedPort = {
    key,
    port,
    profile,
    pinnedAt: new Date().toISOString(),
  };
  config.pinned[key] = entry;
  await saveConfig(config);
  return entry;
}

export async function unpinPort(key: string): Promise<void> {
  const config = await loadConfig();
  if (!config.pinned?.[key]) {
    throw new Error(`No pinned port found for key "${key}"`);
  }
  delete config.pinned[key];
  await saveConfig(config);
}

export async function listPinned(): Promise<PinnedPort[]> {
  const config = await loadConfig();
  return Object.values(config.pinned ?? {}) as PinnedPort[];
}

export async function isPinned(key: string): Promise<boolean> {
  const config = await loadConfig();
  return key in (config.pinned ?? {});
}
