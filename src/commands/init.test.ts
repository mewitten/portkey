import { Command } from 'commander';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { registerInitCommands } from './init';
import { loadConfig } from '../config/store';

function makeProgram() {
  const program = new Command();
  program.exitOverride();
  registerInitCommands(program);
  return program;
}

describe('init command', () => {
  let tmpDir: string;
  let originalHome: string | undefined;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'portkey-init-test-'));
    originalHome = process.env.HOME;
    process.env.HOME = tmpDir;
  });

  afterEach(() => {
    process.env.HOME = originalHome;
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it('should register the init command', () => {
    const program = makeProgram();
    const cmd = program.commands.find((c) => c.name() === 'init');
    expect(cmd).toBeDefined();
  });

  it('should create config file with default values on init', async () => {
    const program = makeProgram();
    await program.parseAsync(['node', 'portkey', 'init'], { from: 'user' });
    const config = loadConfig();
    expect(config).toBeDefined();
    expect(config.version).toBe('1.0.0');
    expect(config.ports).toBeDefined();
    expect(config.activeProfile).toBe('default');
  });

  it('should create default profile on init', async () => {
    const program = makeProgram();
    await program.parseAsync(['node', 'portkey', 'init'], { from: 'user' });
    const config = loadConfig();
    expect(config.profiles).toBeDefined();
    expect(config.profiles['default']).toBeDefined();
  });

  it('should not overwrite existing config without --force flag', async () => {
    const program = makeProgram();
    await program.parseAsync(['node', 'portkey', 'init'], { from: 'user' });
    const config1 = loadConfig();
    // Run init again without --force
    await program.parseAsync(['node', 'portkey', 'init'], { from: 'user' });
    const config2 = loadConfig();
    expect(config2).toEqual(config1);
  });
});
