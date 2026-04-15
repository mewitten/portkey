import fs from "fs";
import path from "path";
import os from "os";
import { PortkeyConfig, DEFAULT_CONFIG, validatePortConfig } from "./schema";

const CONFIG_DIR = path.join(os.homedir(), ".portkey");
const CONFIG_FILE = path.join(CONFIG_DIR, "config.json");

export function getConfigPath(): string {
  return CONFIG_FILE;
}

export function ensureConfigDir(): void {
  if (!fs.existsSync(CONFIG_DIR)) {
    fs.mkdirSync(CONFIG_DIR, { recursive: true });
  }
}

export function loadConfig(): PortkeyConfig {
  ensureConfigDir();

  if (!fs.existsSync(CONFIG_FILE)) {
    saveConfig(DEFAULT_CONFIG);
    return { ...DEFAULT_CONFIG };
  }

  try {
    const raw = fs.readFileSync(CONFIG_FILE, "utf-8");
    const parsed = JSON.parse(raw);

    if (!validatePortConfig(parsed)) {
      throw new Error("Invalid config file format");
    }

    return parsed;
  } catch (err) {
    throw new Error(`Failed to load config: ${(err as Error).message}`);
  }
}

export function saveConfig(config: PortkeyConfig): void {
  ensureConfigDir();

  try {
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2), "utf-8");
  } catch (err) {
    throw new Error(`Failed to save config: ${(err as Error).message}`);
  }
}
