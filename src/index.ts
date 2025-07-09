import { Command } from 'commander';

const program = new Command();

program
  .name('expenses')
  .description('A CLI tool to manage expenses')
  .version('0.0.1');

program
  .command('import')
  .argument('<file>', 'file to import')
  .action(() => {
    console.log('Importing file...');
  });

program.parse(process.argv);
