import { Command } from 'commander';
import * as path from 'path';
import * as fs from 'fs';
import { ensureConfigDir, loadConfig, saveConfig } from '../config/store';
import { createProfile, switchProfile } from '../profiles/manager';

const DEFAULT_PORTS = [
  { name: 'frontend', port: 3000 },
  { name: 'backend', port: 8080 },
  { name: 'database', port: 5432 },
];

export interface InitOptions {
  name?: string;
  defaults?: boolean;
  force?: boolean;
}

export async function initProject(options: InitOptions = {}): Promise<void> {
  const configDir = ensureConfigDir();
  const projectName = options.name || path.basename(process.cwd());

  const config = loadConfig();

  if (config.profiles && config.profiles[projectName] && !options.force) {
    throw new Error(
      `Profile "${projectName}" already exists. Use --force to overwrite.`
    );
  }

  const ports: Record<string, number> = {};

  if (options.defaults) {
    for (const { name, port } of DEFAULT_PORTS) {
      ports[name] = port;
    }
  }

  createProfile(projectName, ports);
  switchProfile(projectName);

  console.log(`✔ Initialized portkey for project "${projectName}"`);
  if (options.defaults) {
    console.log('  Default ports assigned:');
    for (const { name, port } of DEFAULT_PORTS) {
      console.log(`    ${name}: ${port}`);
    }
  }
  console.log(`  Config stored in: ${configDir}`);
}

export function registerInitCommands(program: Command): void {
  program
    .command('init')
    .description('Initialize portkey for the current project')
    .option('-n, --name <name>', 'Project profile name (defaults to current directory name)')
    .option('-d, --defaults', 'Seed with default port assignments', false)
    .option('-f, --force', 'Overwrite existing profile if it exists', false)
    .action(async (opts: InitOptions) => {
      try {
        await initProject(opts);
      } catch (err: any) {
        console.error(`Error: ${err.message}`);
        process.exit(1);
      }
    });
}
