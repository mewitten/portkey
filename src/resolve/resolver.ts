import { loadConfig } from '../config/store';
import { getProfile } from '../profiles/manager';

export interface ResolvedPort {
  name: string;
  port: number;
  profile: string;
}

export async function resolvePort(
  nameOrAlias: string,
  profileName?: string
): Promise<ResolvedPort | null> {
  const config = await loadConfig();
  const activeProfile = profileName ?? config.activeProfile;

  if (!activeProfile) {
    return null;
  }

  const profile = await getProfile(activeProfile);
  if (!profile) {
    return null;
  }

  const entry = profile.ports.find(
    (p) => p.name === nameOrAlias || p.aliases?.includes(nameOrAlias)
  );

  if (!entry) {
    return null;
  }

  return {
    name: entry.name,
    port: entry.port,
    profile: activeProfile,
  };
}

export async function resolveAllPorts(
  profileName?: string
): Promise<ResolvedPort[]> {
  const config = await loadConfig();
  const activeProfile = profileName ?? config.activeProfile;

  if (!activeProfile) {
    return [];
  }

  const profile = await getProfile(activeProfile);
  if (!profile) {
    return [];
  }

  return profile.ports.map((p) => ({
    name: p.name,
    port: p.port,
    profile: activeProfile,
  }));
}
