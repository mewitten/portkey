import { loadConfig } from '../config/store';
import { listProfiles } from '../profiles/manager';

export interface CheckResult {
  name: string;
  status: 'ok' | 'warn' | 'error';
  message: string;
}

export async function checkConfigExists(): Promise<CheckResult> {
  try {
    const config = await loadConfig();
    const hasProfiles = Object.keys(config.profiles || {}).length > 0;
    return {
      name: 'config',
      status: hasProfiles ? 'ok' : 'warn',
      message: hasProfiles
        ? 'Configuration file found with profiles'
        : 'Configuration file exists but has no profiles',
    };
  } catch {
    return {
      name: 'config',
      status: 'error',
      message: 'No configuration file found. Run `portkey init` to create one.',
    };
  }
}

export async function checkActiveProfile(): Promise<CheckResult> {
  try {
    const config = await loadConfig();
    if (!config.activeProfile) {
      return {
        name: 'active-profile',
        status: 'warn',
        message: 'No active profile set. Use `portkey switch <profile>` to activate one.',
      };
    }
    const profiles = await listProfiles();
    const exists = profiles.some((p) => p.name === config.activeProfile);
    return {
      name: 'active-profile',
      status: exists ? 'ok' : 'error',
      message: exists
        ? `Active profile '${config.activeProfile}' is valid`
        : `Active profile '${config.activeProfile}' does not exist`,
    };
  } catch {
    return { name: 'active-profile', status: 'error', message: 'Could not determine active profile' };
  }
}

export async function checkPortConflicts(): Promise<CheckResult> {
  try {
    const profiles = await listProfiles();
    const allPorts: number[] = profiles.flatMap((p) => Object.values(p.ports || {}));
    const duplicates = allPorts.filter((port, idx) => allPorts.indexOf(port) !== idx);
    if (duplicates.length > 0) {
      return {
        name: 'port-conflicts',
        status: 'warn',
        message: `Duplicate ports detected across profiles: ${[...new Set(duplicates)].join(', ')}`,
      };
    }
    return { name: 'port-conflicts', status: 'ok', message: 'No port conflicts detected' };
  } catch {
    return { name: 'port-conflicts', status: 'error', message: 'Could not check port conflicts' };
  }
}

export async function runAllChecks(): Promise<CheckResult[]> {
  return Promise.all([checkConfigExists(), checkActiveProfile(), checkPortConflicts()]);
}
