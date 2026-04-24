import { Command } from 'commander';
import { loadConfig, saveConfig } from '../config/store';
import {
  savePreset,
  deletePreset,
  applyPreset,
  listPresets,
  getPreset,
} from '../preset/presetter';

export function registerPresetCommands(program: Command): void {
  const preset = program.command('preset').description('Manage port presets');

  preset
    .command('save <name>')
    .description('Save current profile ports as a preset')
    .option('-p, --profile <profile>', 'Source profile to snapshot')
    .option('-d, --description <desc>', 'Description for the preset')
    .action(async (name: string, opts) => {
      const config = await loadConfig();
      const profileName = opts.profile ?? config.activeProfile;
      if (!profileName) {
        console.error('No active profile. Use --profile to specify one.');
        process.exit(1);
      }
      const ports = (config.profiles as any)?.[profileName];
      if (!ports) {
        console.error(`Profile "${profileName}" not found.`);
        process.exit(1);
      }
      const updated = savePreset(config, name, ports, opts.description);
      await saveConfig(updated);
      console.log(`Preset "${name}" saved from profile "${profileName}".`);
    });

  preset
    .command('apply <name>')
    .description('Apply a preset to a profile')
    .option('-p, --profile <profile>', 'Target profile')
    .action(async (name: string, opts) => {
      const config = await loadConfig();
      const profileName = opts.profile ?? config.activeProfile;
      if (!profileName) {
        console.error('No active profile. Use --profile to specify one.');
        process.exit(1);
      }
      try {
        const updated = applyPreset(config, name, profileName);
        await saveConfig(updated);
        console.log(`Preset "${name}" applied to profile "${profileName}".`);
      } catch (err: any) {
        console.error(err.message);
        process.exit(1);
      }
    });

  preset
    .command('list')
    .description('List all saved presets')
    .action(async () => {
      const config = await loadConfig();
      const presets = listPresets(config);
      if (presets.length === 0) {
        console.log('No presets saved.');
        return;
      }
      presets.forEach((p) => {
        const desc = p.description ? ` — ${p.description}` : '';
        const keys = Object.keys(p.ports).join(', ');
        console.log(`  ${p.name}${desc}  [${keys}]`);
      });
    });

  preset
    .command('remove <name>')
    .description('Remove a saved preset')
    .action(async (name: string) => {
      const config = await loadConfig();
      if (!getPreset(config, name)) {
        console.error(`Preset "${name}" not found.`);
        process.exit(1);
      }
      const updated = deletePreset(config, name);
      await saveConfig(updated);
      console.log(`Preset "${name}" removed.`);
    });
}
