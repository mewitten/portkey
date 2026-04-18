import { getProfile, addProfile } from '../profiles/manager';
import { PortConfig } from '../config/schema';

export interface CopyResult {
  success: boolean;
  message: string;
}

export async function copyProfile(
  sourceName: string,
  destName: string,
  configPath?: string
): Promise<CopyResult> {
  const source = await getProfile(sourceName, configPath);
  if (!source) {
    return { success: false, message: `Profile '${sourceName}' not found` };
  }

  const existing = await getProfile(destName, configPath);
  if (existing) {
    return { success: false, message: `Profile '${destName}' already exists` };
  }

  const copied: PortConfig = { ...source, name: destName };
  await addProfile(copied, configPath);

  return { success: true, message: `Copied '${sourceName}' to '${destName}'` };
}
