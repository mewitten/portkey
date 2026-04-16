import { loadConfig } from '../config/store';
import { getProfile } from '../profiles/manager';

export interface ResolvedPort {
  name: string;
  port: number;
  profile: string;
}

export async function resolvePort(
  portName: string,
  profileName?: string
): Promise<ResolvedPort | null> {
  const config = await loadConfig();
  const activeProfile = profileName ?? config.activeProfile;

  if (!activeProfile) {
    const entry = config.ports?.[portName];
    if (entry == null) return null;
    return { name: portName, port: entry, profile: 'default' };
  }

  const profile = await getProfile(activeProfile);
  if (!profile) return null;

  const port = profile.ports?.[portName];
  if (port == null) return null;

  return { name: portName, port, profile: activeProfile };
}

export async function resolveAllPorts(
  profileName?: string
): Promise<ResolvedPort[]> {
  const config = await loadConfig();
  const activeProfile = profileName ?? config.activeProfile;

  if (!activeProfile) {
    return Object.entries(config.ports ?? {}).map(([name, port]) => ({
      name,
      port: port as number,
      profile: 'default',
    }));
  }

  const profile = await getProfile(activeProfile);
  if (!profile) return [];

  return Object.entries(profile.ports ?? {}).map(([name, port]) => ({
    name,
    port: port as number,
    profile: activeProfile,
  }));
}
