import { PortConfig } from '../config/schema';
import { validatePortRange, validateNoDuplicatePorts } from '../validate/validator';

export interface LintIssue {
  level: 'error' | 'warning';
  profile?: string;
  key?: string;
  message: string;
}

export interface LintResult {
  issues: LintIssue[];
  valid: boolean;
}

export function lintConfig(config: PortConfig): LintResult {
  const issues: LintIssue[] = [];

  if (!config.profiles || Object.keys(config.profiles).length === 0) {
    issues.push({ level: 'warning', message: 'No profiles defined in config' });
  }

  for (const [profileName, profile] of Object.entries(config.profiles ?? {})) {
    if (!profile.ports || Object.keys(profile.ports).length === 0) {
      issues.push({
        level: 'warning',
        profile: profileName,
        message: `Profile "${profileName}" has no ports defined`,
      });
      continue;
    }

    for (const [key, port] of Object.entries(profile.ports)) {
      const rangeError = validatePortRange(port);
      if (rangeError) {
        issues.push({
          level: 'error',
          profile: profileName,
          key,
          message: rangeError,
        });
      }

      if (typeof port !== 'number' || !Number.isInteger(port)) {
        issues.push({
          level: 'error',
          profile: profileName,
          key,
          message: `Port "${key}" in profile "${profileName}" must be an integer`,
        });
      }
    }

    const dupError = validateNoDuplicatePorts(profile.ports);
    if (dupError) {
      issues.push({
        level: 'warning',
        profile: profileName,
        message: dupError,
      });
    }
  }

  const hasErrors = issues.some((i) => i.level === 'error');
  return { issues, valid: !hasErrors };
}
