import fs from "fs";
import path from "path";
import os from "os";
import { loadConfig, saveConfig, getConfigPath } from "./store";
import { DEFAULT_CONFIG, PortkeyConfig } from "./schema";

const TEST_HOME = path.join(os.tmpdir(), `portkey-test-${Date.now()}`);

beforeAll(() => {
  process.env.HOME = TEST_HOME;
  jest.resetModules();
});

afterAll(() => {
  fs.rmSync(TEST_HOME, { recursive: true, force: true });
});

describe("store", () => {
  it("returns default config when no file exists", () => {
    const config = loadConfig();
    expect(config).toEqual(DEFAULT_CONFIG);
  });

  it("saves and reloads config correctly", () => {
    const updated: PortkeyConfig = {
      version: "1.0.0",
      activeProfile: "dev",
      profiles: {
        dev: [
          { name: "api", port: 3000, description: "API server" },
          { name: "web", port: 3001 },
        ],
      },
    };

    saveConfig(updated);
    const loaded = loadConfig();
    expect(loaded).toEqual(updated);
  });

  it("getConfigPath returns a string path", () => {
    expect(typeof getConfigPath()).toBe("string");
    expect(getConfigPath()).toContain(".portkey");
  });

  it("throws on corrupted config file", () => {
    const configPath = getConfigPath();
    fs.writeFileSync(configPath, "{ invalid json ", "utf-8");
    expect(() => loadConfig()).toThrow("Failed to load config");
    fs.unlinkSync(configPath);
  });
});
