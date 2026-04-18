import { loadConfig, saveConfig } from '../config/store';
import { PortConfig } from '../config/schema';

export interface MergeResult {
  merged: string[];
  skipped: string[];
  overwritten: string[];
}

export async function mergeProfiles(
  sourceProfile: string,
  targetProfile: string,
  overwrite = false
): Promise<MergeResult> {
  const config = await loadConfig();
  const result: MergeResult = { merged: [], skipped: [], overwritten: [] };

  const source = config.profiles[sourceProfile];
  if (!source) throw new Error(`Source profile '${sourceProfile}' not found`);

  if (!config.profiles[targetProfile]) {
    config.profiles[targetProfile] = {};
  }
  const target = config.profiles[targetProfile];

  for (const [key, value] of Object.entries(source)) {
    if (key in target) {
      if (overwrite) {
        target[key] = value;
        result.overwritten.push(key);
      } else {
        result.skipped.push(key);
      }
    } else {
      target[key] = value;
      result.merged.push(key);
    }
  }

  await saveConfig(config);
  return result;
}
