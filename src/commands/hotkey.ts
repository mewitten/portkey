import { Command } from 'commander';
import { loadConfig, saveConfig } from '../config/store';
import {
  addHotkey,
  removeHotkey,
  updateHotkey,
  listHotkeys,
  getProfileForHotkey,
} from '../hotkey/hotkeyer';

export function registerHotkeyCommands(program: Command): void {
  const hotkey = program.command('hotkey').description('Manage profile hotkeys');

  hotkey
    .command('add <key> <profile>')
    .description('Bind a hotkey to a profile')
    .option('-d, --description <desc>', 'Optional description')
    .action(async (key: string, profile: string, opts: { description?: string }) => {
      const config = await loadConfig();
      const updated = addHotkey(config, { key, profile, description: opts.description });
      await saveConfig(updated);
      console.log(`Hotkey '${key}' bound to profile '${profile}'.`);
    });

  hotkey
    .command('remove <key>')
    .description('Remove a hotkey binding')
    .action(async (key: string) => {
      const config = await loadConfig();
      const updated = removeHotkey(config, key);
      await saveConfig(updated);
      console.log(`Hotkey '${key}' removed.`);
    });

  hotkey
    .command('update <key>')
    .description('Update a hotkey binding')
    .option('-p, --profile <profile>', 'New profile')
    .option('-d, --description <desc>', 'New description')
    .action(async (key: string, opts: { profile?: string; description?: string }) => {
      const config = await loadConfig();
      const updates: Record<string, string> = {};
      if (opts.profile) updates.profile = opts.profile;
      if (opts.description) updates.description = opts.description;
      const updated = updateHotkey(config, key, updates);
      await saveConfig(updated);
      console.log(`Hotkey '${key}' updated.`);
    });

  hotkey
    .command('list')
    .description('List all hotkey bindings')
    .action(async () => {
      const config = await loadConfig();
      const hotkeys = listHotkeys(config);
      if (hotkeys.length === 0) {
        console.log('No hotkeys configured.');
        return;
      }
      hotkeys.forEach((h) => {
        const desc = h.description ? `  # ${h.description}` : '';
        console.log(`  ${h.key.padEnd(14)} -> ${h.profile}${desc}`);
      });
    });

  hotkey
    .command('resolve <key>')
    .description('Show which profile a hotkey resolves to')
    .action(async (key: string) => {
      const config = await loadConfig();
      const profile = getProfileForHotkey(config, key);
      if (!profile) {
        console.error(`No profile bound to hotkey '${key}'.`);
        process.exit(1);
      }
      console.log(profile);
    });
}
