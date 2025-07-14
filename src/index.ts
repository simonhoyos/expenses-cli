import { Command } from 'commander';

import { importExpensesFromCSV } from './helpers/expenses-import';

const program = new Command();

program
  .name('expenses')
  .description('A CLI tool to manage expenses')
  .version('0.0.1');

program
  .command('import')
  .argument('file', 'file to import')
  .action(importExpensesFromCSV);

program.parse(process.argv);
