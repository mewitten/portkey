import { validatePortConfig, DEFAULT_CONFIG } from "./schema";

describe("validatePortConfig", () => {
  it("accepts the default config", () => {
    expect(validatePortConfig(DEFAULT_CONFIG)).toBe(true);
  });

  it("accepts a valid config with profiles", () => {
    const config = {
      version: "1.0.0",
      activeProfile: "dev",
      profiles: {
        dev: [
          { name: "api", port: 3000, description: "API", tags: ["backend"] },
        ],
      },
    };
    expect(validatePortConfig(config)).toBe(true);
  });

  it("rejects null", () => {
    expect(validatePortConfig(null)).toBe(false);
  });

  it("rejects missing version", () => {
    expect(validatePortConfig({ activeProfile: null, profiles: {} })).toBe(false);
  });

  it("rejects port out of range", () => {
    const config = {
      version: "1.0.0",
      activeProfile: null,
      profiles: {
        dev: [{ name: "bad", port: 99999 }],
      },
    };
    expect(validatePortConfig(config)).toBe(false);
  });

  it("rejects non-array profile entries", () => {
    const config = {
      version: "1.0.0",
      activeProfile: null,
      profiles: { dev: "not-an-array" },
    };
    expect(validatePortConfig(config)).toBe(false);
  });

  it("rejects entry missing name", () => {
    const config = {
      version: "1.0.0",
      activeProfile: null,
      profiles: { dev: [{ port: 3000 }] },
    };
    expect(validatePortConfig(config)).toBe(false);
  });
});
