import { Command } from 'commander';
import { loadConfig, saveConfig } from '../config/store';
import {
  getNamespaces,
  addNamespace,
  removeNamespace,
  assignProfileToNamespace,
  unassignProfileFromNamespace,
} from '../namespace/namespacer';

/**
 * Registers all namespace-related CLI commands.
 * Namespaces allow grouping profiles by project or context (e.g. "frontend", "backend").
 */
export function registerNamespaceCommands(program: Command): void {
  const ns = program
    .command('namespace')
    .alias('ns')
    .description('manage profile namespaces');

  // portkey namespace list
  ns.command('list')
    .description('list all namespaces')
    .action(() => {
      const config = loadConfig();
      const namespaces = getNamespaces(config);
      if (namespaces.length === 0) {
        console.log('No namespaces defined.');
        return;
      }
      for (const namespace of namespaces) {
        const profiles = namespace.profiles?.join(', ') || '(none)';
        console.log(`  ${namespace.name}  →  ${profiles}`);
      }
    });

  // portkey namespace add <name>
  ns.command('add <name>')
    .description('create a new namespace')
    .action((name: string) => {
      const config = loadConfig();
      const updated = addNamespace(config, name);
      saveConfig(updated);
      console.log(`Namespace "${name}" created.`);
    });

  // portkey namespace remove <name>
  ns.command('remove <name>')
    .description('remove a namespace')
    .action((name: string) => {
      const config = loadConfig();
      const updated = removeNamespace(config, name);
      saveConfig(updated);
      console.log(`Namespace "${name}" removed.`);
    });

  // portkey namespace assign <namespace> <profile>
  ns.command('assign <namespace> <profile>')
    .description('assign a profile to a namespace')
    .action((namespace: string, profile: string) => {
      const config = loadConfig();
      const updated = assignProfileToNamespace(config, namespace, profile);
      saveConfig(updated);
      console.log(`Profile "${profile}" assigned to namespace "${namespace}".`);
    });

  // portkey namespace unassign <namespace> <profile>
  ns.command('unassign <namespace> <profile>')
    .description('unassign a profile from a namespace')
    .action((namespace: string, profile: string) => {
      const config = loadConfig();
      const updated = unassignProfileFromNamespace(config, namespace, profile);
      saveConfig(updated);
      console.log(`Profile "${profile}" removed from namespace "${namespace}".`);
    });

  // portkey namespace show <name>
  ns.command('show <name>')
    .description('show details of a namespace')
    .action((name: string) => {
      const config = loadConfig();
      const namespaces = getNamespaces(config);
      const found = namespaces.find((n) => n.name === name);
      if (!found) {
        console.error(`Namespace "${name}" not found.`);
        process.exit(1);
      }
      console.log(`Namespace: ${found.name}`);
      if (!found.profiles || found.profiles.length === 0) {
        console.log('  Profiles: (none)');
      } else {
        console.log('  Profiles:');
        for (const profile of found.profiles) {
          console.log(`    - ${profile}`);
        }
      }
    });
}
