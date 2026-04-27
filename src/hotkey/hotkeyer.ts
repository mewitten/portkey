import { loadConfig, saveConfig } from '../config/store';
import { PortkeyConfig } from '../config/schema';

export interface HotkeyEntry {
  key: string;
  profile: string;
  description?: string;
}

export function getHotkeys(config: PortkeyConfig): HotkeyEntry[] {
  return (config.hotkeys as HotkeyEntry[]) ?? [];
}

export function getProfileForHotkey(config: PortkeyConfig, key: string): string | undefined {
  const hotkeys = getHotkeys(config);
  return hotkeys.find((h) => h.key === key)?.profile;
}

export function addHotkey(config: PortkeyConfig, entry: HotkeyEntry): PortkeyConfig {
  const hotkeys = getHotkeys(config);
  if (hotkeys.find((h) => h.key === entry.key)) {
    throw new Error(`Hotkey '${entry.key}' already exists.`);
  }
  return { ...config, hotkeys: [...hotkeys, entry] };
}

export function removeHotkey(config: PortkeyConfig, key: string): PortkeyConfig {
  const hotkeys = getHotkeys(config);
  if (!hotkeys.find((h) => h.key === key)) {
    throw new Error(`Hotkey '${key}' not found.`);
  }
  return { ...config, hotkeys: hotkeys.filter((h) => h.key !== key) };
}

export function updateHotkey(
  config: PortkeyConfig,
  key: string,
  updates: Partial<Omit<HotkeyEntry, 'key'>>
): PortkeyConfig {
  const hotkeys = getHotkeys(config);
  const idx = hotkeys.findIndex((h) => h.key === key);
  if (idx === -1) {
    throw new Error(`Hotkey '${key}' not found.`);
  }
  const updated = hotkeys.map((h, i) => (i === idx ? { ...h, ...updates } : h));
  return { ...config, hotkeys: updated };
}

export function listHotkeys(config: PortkeyConfig): HotkeyEntry[] {
  return getHotkeys(config);
}
