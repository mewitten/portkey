export interface PortConfig {
  name: string;
  port: number;
  description?: string;
  tags?: string[];
}

export interface PortkeyConfig {
  version: string;
  activeProfile: string | null;
  profiles: Record<string, PortConfig[]>;
}

export const DEFAULT_CONFIG: PortkeyConfig = {
  version: "1.0.0",
  activeProfile: null,
  profiles: {},
};

export function validatePortConfig(config: unknown): config is PortkeyConfig {
  if (typeof config !== "object" || config === null) return false;

  const c = config as Record<string, unknown>;

  if (typeof c.version !== "string") return false;
  if (c.activeProfile !== null && typeof c.activeProfile !== "string") return false;
  if (typeof c.profiles !== "object" || c.profiles === null) return false;

  for (const [, ports] of Object.entries(c.profiles as Record<string, unknown>)) {
    if (!Array.isArray(ports)) return false;
    for (const entry of ports) {
      if (typeof entry !== "object" || entry === null) return false;
      const e = entry as Record<string, unknown>;
      if (typeof e.name !== "string") return false;
      if (typeof e.port !== "number" || e.port < 1 || e.port > 65535) return false;
    }
  }

  return true;
}
