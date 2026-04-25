import { PortConfig } from '../config/schema';

export interface QuotaRule {
  maxPortsPerProfile: number;
  maxProfiles: number;
  portRangeMin: number;
  portRangeMax: number;
}

export interface QuotaViolation {
  rule: keyof QuotaRule;
  message: string;
  current: number;
  limit: number;
}

export const DEFAULT_QUOTA: QuotaRule = {
  maxPortsPerProfile: 20,
  maxProfiles: 50,
  portRangeMin: 1024,
  portRangeMax: 65535,
};

export function checkQuota(
  config: PortConfig,
  quota: QuotaRule = DEFAULT_QUOTA
): QuotaViolation[] {
  const violations: QuotaViolation[] = [];
  const profiles = config.profiles ?? {};
  const profileNames = Object.keys(profiles);

  if (profileNames.length > quota.maxProfiles) {
    violations.push({
      rule: 'maxProfiles',
      message: `Profile count ${profileNames.length} exceeds limit of ${quota.maxProfiles}`,
      current: profileNames.length,
      limit: quota.maxProfiles,
    });
  }

  for (const [name, profile] of Object.entries(profiles)) {
    const ports = profile.ports ?? {};
    const portEntries = Object.entries(ports);

    if (portEntries.length > quota.maxPortsPerProfile) {
      violations.push({
        rule: 'maxPortsPerProfile',
        message: `Profile "${name}" has ${portEntries.length} ports, exceeds limit of ${quota.maxPortsPerProfile}`,
        current: portEntries.length,
        limit: quota.maxPortsPerProfile,
      });
    }

    for (const [key, port] of portEntries) {
      if (port < quota.portRangeMin || port > quota.portRangeMax) {
        violations.push({
          rule: port < quota.portRangeMin ? 'portRangeMin' : 'portRangeMax',
          message: `Profile "${name}" key "${key}" port ${port} is outside allowed range [${quota.portRangeMin}, ${quota.portRangeMax}]`,
          current: port,
          limit: port < quota.portRangeMin ? quota.portRangeMin : quota.portRangeMax,
        });
      }
    }
  }

  return violations;
}

export function isWithinQuota(
  config: PortConfig,
  quota: QuotaRule = DEFAULT_QUOTA
): boolean {
  return checkQuota(config, quota).length === 0;
}
