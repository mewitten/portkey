import { PortConfig } from '../config/schema';
import { loadConfig, saveConfig } from '../config/store';

export interface ProfilePriority {
  profile: string;
  priority: number;
}

export function getPriorities(config: PortConfig): ProfilePriority[] {
  const priorities: ProfilePriority[] = Object.entries(
    config.priorities ?? {}
  ).map(([profile, priority]) => ({ profile, priority }));
  return priorities.sort((a, b) => b.priority - a.priority);
}

export function setProfilePriority(
  config: PortConfig,
  profile: string,
  priority: number
): PortConfig {
  if (!config.profiles[profile]) {
    throw new Error(`Profile "${profile}" does not exist.`);
  }
  if (priority < 0) {
    throw new Error('Priority must be a non-negative integer.');
  }
  return {
    ...config,
    priorities: {
      ...(config.priorities ?? {}),
      [profile]: priority,
    },
  };
}

export function removeProfilePriority(
  config: PortConfig,
  profile: string
): PortConfig {
  const priorities = { ...(config.priorities ?? {}) };
  delete priorities[profile];
  return { ...config, priorities };
}

export function getHighestPriorityProfile(
  config: PortConfig
): string | undefined {
  const sorted = getPriorities(config);
  return sorted.length > 0 ? sorted[0].profile : undefined;
}

export async function applyPriority(
  profile: string,
  priority: number
): Promise<void> {
  const config = await loadConfig();
  const updated = setProfilePriority(config, profile, priority);
  await saveConfig(updated);
}

export async function clearPriority(profile: string): Promise<void> {
  const config = await loadConfig();
  const updated = removeProfilePriority(config, profile);
  await saveConfig(updated);
}
