import { loadConfig, saveConfig } from '../config/store';
import { validatePortConfig } from '../config/schema';

export interface PortEntry {
  name: string;
  port: number;
  description?: string;
  project?: string;
}

export async function listPorts(): Promise<PortEntry[]> {
  const config = await loadConfig();
  return config.ports ?? [];
}

export async function addPort(entry: PortEntry): Promise<void> {
  const config = await loadConfig();
  const ports: PortEntry[] = config.ports ?? [];

  const duplicate = ports.find(
    (p) => p.name === entry.name || p.port === entry.port
  );
  if (duplicate) {
    throw new Error(
      `Conflict: port name "${duplicate.name}" or port ${duplicate.port} already exists.`
    );
  }

  const updated = { ...config, ports: [...ports, entry] };
  validatePortConfig(updated);
  await saveConfig(updated);
}

export async function removePort(name: string): Promise<void> {
  const config = await loadConfig();
  const ports: PortEntry[] = config.ports ?? [];

  const index = ports.findIndex((p) => p.name === name);
  if (index === -1) {
    throw new Error(`Port entry "${name}" not found.`);
  }

  const updated = { ...config, ports: ports.filter((p) => p.name !== name) };
  await saveConfig(updated);
}

export async function getPort(name: string): Promise<PortEntry | undefined> {
  const ports = await listPorts();
  return ports.find((p) => p.name === name);
}
