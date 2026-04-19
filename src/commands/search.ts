import { Command } from 'commander';
import { searchByPort, searchByKey, searchByProfile } from '../search/searcher';

function formatResults(results: { profile: string; key: string; port: number }[]): void {
  if (results.length === 0) {
    console.log('No results found.');
    return;
  }
  for (const r of results) {
    console.log(`  [${r.profile}] ${r.key} = ${r.port}`);
  }
}

export function registerSearchCommands(program: Command): void {
  const search = program.command('search').description('Search ports and keys across profiles');

  search
    .command('port <number>')
    .description('Find which profile(s) use a given port number')
    .action((number: string) => {
      const port = parseInt(number, 10);
      if (isNaN(port)) {
        console.error('Invalid port number.');
        process.exit(1);
      }
      const results = searchByPort(port);
      formatResults(results);
    });

  search
    .command('key <keyword>')
    .description('Find port entries whose key matches a keyword')
    .action((keyword: string) => {
      const results = searchByKey(keyword);
      formatResults(results);
    });

  search
    .command('in <profile> [keyword]')
    .description('Search within a specific profile')
    .action((profile: string, keyword?: string) => {
      const results = searchByProfile(profile, keyword);
      formatResults(results);
    });
}
