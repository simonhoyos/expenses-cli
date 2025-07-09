import { Command } from 'commander';
import fs from 'fs/promises';
import z from 'zod';

import { CsvInputTrimmerSchema, csvParse } from './helpers/csv';

const program = new Command();

program
  .name('expenses')
  .description('A CLI tool to manage expenses')
  .version('0.0.1');

program
  .command('import')
  .argument('file', 'file to import')
  .action(async (file) => {
    const content = await fs.readFile(file, 'utf-8');

    const data = CsvInputTrimmerSchema.pipe(
      z.array(
        z.object({
          timestamp: z
            .string()
            .transform((val) => new Date(val))
            .pipe(z.date()),
          merchant: z.string().transform((val) => val.toLowerCase().trim()),
          amount: z
            .string()
            .transform((val) => {
              if (val.includes('(')) {
                return parseFloat(
                  val.replace(/,/g, '').replace('(', '-').replace(')', ''),
                );
              }

              return parseFloat(val.replace(/,/g, ''));
            })
            .pipe(z.number()),
          category: z.string().transform((val) => val.toLowerCase()),
          tag: z.string().optional(),
          comment: z.string().optional(),
          reimbursable: z
            .string()
            .transform((val) => val.toLowerCase() === 'yes'),
          originalCurrency: z.string(),
          originalAmount: z
            .string()
            .transform((val) => {
              if (val.includes('(')) {
                return parseFloat(
                  val.replace(/,/g, '').replace('(', '-').replace(')', ''),
                );
              }

              return parseFloat(val.replace(/,/g, ''));
            })
            .pipe(z.number()),
          attendees: z.string(),
        }),
      ),
    ).parse(
      await csvParse(content, {
        columns: (headers) =>
          headers.map((header: string) =>
            header
              .toLowerCase()
              .trim()
              .replace(/[-_\s]+(.)?/g, (_, char) =>
                char ? char.toUpperCase() : '',
              ),
          ),
        skip_empty_lines: true,
        trim: true,
      }),
    );

    console.log('Importing file...', data);
  });

program.parse(process.argv);
