import { loadConfig } from '../config/store';

export interface PortDiff {
  key: string;
  from: number | undefined;
  to: number | undefined;
  type: 'added' | 'removed' | 'changed';
}

export interface ProfileDiff {
  profile: string;
  diffs: PortDiff[];
}

export function diffProfiles(profileA: string, profileB: string): ProfileDiff[] {
  const config = loadConfig();
  const a = config.profiles?.[profileA]?.ports ?? {};
  const b = config.profiles?.[profileB]?.ports ?? {};

  const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
  const diffs: PortDiff[] = [];

  for (const key of keys) {
    const fromVal = a[key] as number | undefined;
    const toVal = b[key] as number | undefined;
    if (fromVal === undefined) {
      diffs.push({ key, from: undefined, to: toVal, type: 'added' });
    } else if (toVal === undefined) {
      diffs.push({ key, from: fromVal, to: undefined, type: 'removed' });
    } else if (fromVal !== toVal) {
      diffs.push({ key, from: fromVal, to: toVal, type: 'changed' });
    }
  }

  return [
    { profile: profileA, diffs },
    { profile: profileB, diffs },
  ];
}

export function diffProfilesFlat(profileA: string, profileB: string): PortDiff[] {
  const config = loadConfig();
  const a = config.profiles?.[profileA]?.ports ?? {};
  const b = config.profiles?.[profileB]?.ports ?? {};

  const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
  const diffs: PortDiff[] = [];

  for (const key of keys) {
    const fromVal = a[key] as number | undefined;
    const toVal = b[key] as number | undefined;
    if (fromVal === undefined) {
      diffs.push({ key, from: undefined, to: toVal, type: 'added' });
    } else if (toVal === undefined) {
      diffs.push({ key, from: fromVal, to: undefined, type: 'removed' });
    } else if (fromVal !== toVal) {
      diffs.push({ key, from: fromVal, to: toVal, type: 'changed' });
    }
  }

  return diffs;
}
