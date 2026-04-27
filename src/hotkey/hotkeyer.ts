import { loadConfig, saveConfig } from '../config/store';
import { PortConfig } from '../config/schema';

export interface HotkeyMap {
  [shortcut: string]: string; // shortcut -> profile name
}

export function getHotkeys(config: PortConfig): HotkeyMap {
  return (config.hotkeys as HotkeyMap) ?? {};
}

export function getProfileForHotkey(config: PortConfig, shortcut: string): string | undefined {
  const hotkeys = getHotkeys(config);
  return hotkeys[shortcut];
}

export function addHotkey(config: PortConfig, shortcut: string, profileName: string): PortConfig {
  const hotkeys = getHotkeys(config);
  if (hotkeys[shortcut]) {
    throw new Error(`Hotkey '${shortcut}' is already assigned to profile '${hotkeys[shortcut]}'`);
  }
  if (!config.profiles?.[profileName]) {
    throw new Error(`Profile '${profileName}' does not exist`);
  }
  return {
    ...config,
    hotkeys: { ...hotkeys, [shortcut]: profileName },
  };
}

export function removeHotkey(config: PortConfig, shortcut: string): PortConfig {
  const hotkeys = getHotkeys(config);
  if (!hotkeys[shortcut]) {
    throw new Error(`Hotkey '${shortcut}' is not assigned`);
  }
  const updated = { ...hotkeys };
  delete updated[shortcut];
  return { ...config, hotkeys: updated };
}

export function updateHotkey(config: PortConfig, shortcut: string, profileName: string): PortConfig {
  const hotkeys = getHotkeys(config);
  if (!hotkeys[shortcut]) {
    throw new Error(`Hotkey '${shortcut}' is not assigned`);
  }
  if (!config.profiles?.[profileName]) {
    throw new Error(`Profile '${profileName}' does not exist`);
  }
  return {
    ...config,
    hotkeys: { ...hotkeys, [shortcut]: profileName },
  };
}

export function listHotkeys(config: PortConfig): Array<{ shortcut: string; profile: string }> {
  const hotkeys = getHotkeys(config);
  return Object.entries(hotkeys).map(([shortcut, profile]) => ({ shortcut, profile }));
}
