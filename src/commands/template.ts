import { Command } from 'commander';
import * as fs from 'fs/promises';
import { renderTemplate } from '../template/template';

export function registerTemplateCommands(program: Command): void {
  const tmpl = program.command('template').description('Render a template with port variables');

  tmpl
    .command('render <file>')
    .description('Render a template file substituting port variables')
    .option('-p, --profile <profile>', 'Profile to use for port values')
    .option('-o, --output <output>', 'Output file (defaults to stdout)')
    .action(async (file: string, options: { profile?: string; output?: string }) => {
      try {
        const content = await fs.readFile(file, 'utf-8');
        const rendered = await renderTemplate(content, options.profile);
        if (options.output) {
          await fs.writeFile(options.output, rendered, 'utf-8');
          console.log(`Rendered template written to ${options.output}`);
        } else {
          process.stdout.write(rendered);
        }
      } catch (err: any) {
        console.error(`Error: ${err.message}`);
        process.exit(1);
      }
    });

  tmpl
    .command('preview <template>')
    .description('Preview inline template string with port substitution')
    .option('-p, --profile <profile>', 'Profile to use for port values')
    .action(async (template: string, options: { profile?: string }) => {
      try {
        const rendered = await renderTemplate(template, options.profile);
        console.log(rendered);
      } catch (err: any) {
        console.error(`Error: ${err.message}`);
        process.exit(1);
      }
    });
}
