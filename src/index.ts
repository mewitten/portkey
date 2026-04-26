#!/usr/bin/env node

/**
 * portkey — CLI tool for managing and switching between local development port configurations.
 * Main entry point: registers all commands and parses CLI arguments.
 */

import { Command } from 'commander';
import { registerInitCommands } from './commands/init';
import { registerPortCommands } from './commands/port';
import { registerProfileCommands } from './commands/profile';
import { registerListCommands } from './commands/list';
import { registerSwitchCommands } from './commands/switch';
import { registerUseCommands } from './commands/use';
import { registerEnvCommands } from './commands/env';
import { registerExportCommands } from './commands/export';
import { registerImportCommands } from './commands/import';
import { registerDoctorCommands } from './commands/doctor';
import { registerSyncCommands } from './commands/sync';
import { registerSnapshotCommands } from './commands/snapshot';
import { registerAuditCommands } from './commands/audit';
import { registerTemplateCommands } from './commands/template';
import { registerWatchCommands } from './commands/watch';
import { registerDiffCommands } from './commands/diff';
import { registerRenameCommands } from './commands/rename';
import { registerCopyCommands } from './commands/copy';
import { registerMergeCommands } from './commands/merge';
import { registerTagCommands } from './commands/tag';
import { registerSearchCommands } from './commands/search';
import { registerPinCommands } from './commands/pin';
import { registerLockCommands } from './commands/lock';
import { registerHistoryCommands } from './commands/history';
import { registerAliasCommands } from './commands/alias';
import { registerGroupCommands } from './commands/group';
import { registerPriorityCommands } from './commands/priority';
import { registerShareCommands } from './commands/share';
import { registerNamespaceCommands } from './commands/namespace';
import { registerPresetCommands } from './commands/preset';
import { registerLintCommands } from './commands/lint';
import { registerQuotaCommands } from './commands/quota';
import { registerInheritCommands } from './commands/inherit';
import { registerLoadCommands } from './commands/load';

const program = new Command();

program
  .name('portkey')
  .description('Manage and switch between local development port configurations across projects')
  .version('1.0.0');

// Register all command groups
registerInitCommands(program);
registerPortCommands(program);
registerProfileCommands(program);
registerListCommands(program);
registerSwitchCommands(program);
registerUseCommands(program);
registerEnvCommands(program);
registerLoadCommands(program);
registerExportCommands(program);
registerImportCommands(program);
registerDoctorCommands(program);
registerSyncCommands(program);
registerSnapshotCommands(program);
registerAuditCommands(program);
registerTemplateCommands(program);
registerWatchCommands(program);
registerDiffCommands(program);
registerRenameCommands(program);
registerCopyCommands(program);
registerMergeCommands(program);
registerTagCommands(program);
registerSearchCommands(program);
registerPinCommands(program);
registerLockCommands(program);
registerHistoryCommands(program);
registerAliasCommands(program);
registerGroupCommands(program);
registerPriorityCommands(program);
registerShareCommands(program);
registerNamespaceCommands(program);
registerPresetCommands(program);
registerLintCommands(program);
registerQuotaCommands(program);
registerInheritCommands(program);

// Show help if no arguments provided
if (process.argv.length <= 2) {
  program.help();
}

program.parse(process.argv);
