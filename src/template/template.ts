import { loadConfig } from '../config/store';
import { PortConfig } from '../config/schema';

export interface TemplateVar {
  key: string;
  value: string | number;
}

export function resolveTemplate(template: string, vars: TemplateVar[]): string {
  return vars.reduce((result, { key, value }) => {
    const pattern = new RegExp(`\\{\\{\\s*${key}\\s*\\}\\}`, 'g');
    return result.replace(pattern, String(value));
  }, template);
}

export function extractTemplateVars(config: PortConfig, profile?: string): TemplateVar[] {
  const vars: TemplateVar[] = [];
  const ports = profile ? config.profiles?.[profile]?.ports ?? config.ports : config.ports;
  if (!ports) return vars;
  for (const [key, value] of Object.entries(ports)) {
    vars.push({ key: `PORT_${key.toUpperCase()}`, value });
    vars.push({ key: key, value });
  }
  if (profile) vars.push({ key: 'PROFILE', value: profile });
  return vars;
}

export async function renderTemplate(template: string, profile?: string): Promise<string> {
  const config = await loadConfig();
  const vars = extractTemplateVars(config, profile);
  return resolveTemplate(template, vars);
}
