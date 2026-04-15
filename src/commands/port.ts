import { Command } from 'commander';
import { addPort, removePort, listPorts, getPort } from '../ports/manager';

export function registerPortCommands(program: Command): void {
  const port = program
    .command('port')
    .description('Manage local development port entries');

  port
    .command('add <name> <port>')
    .description('Register a new port entry')
    .option('-d, --description <desc>', 'Short description')
    .option('-p, --project <project>', 'Associated project name')
    .action(async (name: string, portArg: string, opts) => {
      const portNumber = parseInt(portArg, 10);
      if (isNaN(portNumber) || portNumber < 1 || portNumber > 65535) {
        console.error('Error: port must be a number between 1 and 65535.');
        process.exit(1);
      }
      try {
        await addPort({
          name,
          port: portNumber,
          description: opts.description,
          project: opts.project,
        });
        console.log(`✔ Added port entry "${name}" → ${portNumber}`);
      } catch (err: any) {
        console.error(`Error: ${err.message}`);
        process.exit(1);
      }
    });

  port
    .command('remove <name>')
    .description('Remove a port entry by name')
    .action(async (name: string) => {
      try {
        await removePort(name);
        console.log(`✔ Removed port entry "${name}"`);
      } catch (err: any) {
        console.error(`Error: ${err.message}`);
        process.exit(1);
      }
    });

  port
    .command('list')
    .description('List all registered port entries')
    .action(async () => {
      const ports = await listPorts();
      if (ports.length === 0) {
        console.log('No port entries found.');
        return;
      }
      ports.forEach((p) => {
        const meta = [p.description, p.project ? `[${p.project}]` : null]
          .filter(Boolean)
          .join(' ');
        console.log(`  ${p.name.padEnd(20)} ${String(p.port).padEnd(6)} ${meta}`);
      });
    });

  port
    .command('get <name>')
    .description('Show details for a specific port entry')
    .action(async (name: string) => {
      const entry = await getPort(name);
      if (!entry) {
        console.error(`Port entry "${name}" not found.`);
        process.exit(1);
      }
      console.log(JSON.stringify(entry, null, 2));
    });
}
