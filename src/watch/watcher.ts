import * as fs from 'fs';
import { loadConfig, saveConfig } from '../config/store';
import { writeAuditEntry } from '../audit/logger';

export type WatchCallback = (event: 'change' | 'rename', filename: string) => void;

let watcher: fs.FSWatcher | null = null;

export function startWatch(configPath: string, callback: WatchCallback): void {
  if (watcher) {
    stopWatch();
  }
  watcher = fs.watch(configPath, { persistent: false }, (event, filename) => {
    if (filename) {
      callback(event as 'change' | 'rename', filename);
    }
  });
}

export function stopWatch(): void {
  if (watcher) {
    watcher.close();
    watcher = null;
  }
}

export function isWatching(): boolean {
  return watcher !== null;
}

export async function watchAndReload(
  configPath: string,
  onReload: (config: unknown) => void
): Promise<() => void> {
  startWatch(configPath, async (event) => {
    if (event === 'change') {
      try {
        const config = await loadConfig();
        await writeAuditEntry({ action: 'watch-reload', details: { configPath } });
        onReload(config);
      } catch {
        // ignore parse errors during watch
      }
    }
  });
  return stopWatch;
}
