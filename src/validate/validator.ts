import { loadConfig } from '../config/store';
import { getProfile } from '../profiles/manager';

export interface ValidationIssue {
  type: 'error' | 'warning';
  message: string;
}

export interface ValidationResult {
  profile: string;
  valid: boolean;
  issues: ValidationIssue[];
}

export function validatePortRange(port: number): boolean {
  return Number.isInteger(port) && port >= 1 && port <= 65535;
}

export function validateNoDuplicatePorts(ports: Record<string, number>): ValidationIssue[] {
  const seen = new Map<number, string>();
  const issues: ValidationIssue[] = [];
  for (const [name, port] of Object.entries(ports)) {
    if (seen.has(port)) {
      issues.push({
        type: 'warning',
        message: `Port ${port} is used by both '${seen.get(port)}' and '${name}'`,
      });
    } else {
      seen.set(port, name);
    }
  }
  return issues;
}

export async function validateProfile(profileName: string): Promise<ValidationResult> {
  const config = await loadConfig();
  const profile = getProfile(config, profileName);
  const issues: ValidationIssue[] = [];

  if (!profile) {
    return { profile: profileName, valid: false, issues: [{ type: 'error', message: `Profile '${profileName}' not found` }] };
  }

  for (const [name, port] of Object.entries(profile.ports)) {
    if (!validatePortRange(port)) {
      issues.push({ type: 'error', message: `'${name}' has invalid port ${port} (must be 1-65535)` });
    }
  }

  issues.push(...validateNoDuplicatePorts(profile.ports));

  return {
    profile: profileName,
    valid: !issues.some(i => i.type === 'error'),
    issues,
  };
}
