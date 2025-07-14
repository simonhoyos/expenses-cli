import fs from 'fs/promises';
import z from 'zod';

import { PrismaClient } from '../generated/prisma';
import { CsvInputTrimmerSchema, csvParse } from './csv';

export async function importExpensesFromCSV(file: string) {
  const prisma = new PrismaClient();

  const content = await fs.readFile(file, 'utf-8');

  const data = CsvInputTrimmerSchema.pipe(
    z.array(
      z.object({
        reportedAt: z
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

  data.map(async (item) => {
    const userName = item.attendees.toLowerCase().trim();

    const user = await prisma.user.upsert({
      where: {
        name: userName,
      },
      create: {
        name: userName,
      },
      update: {},
    });

    const category = await prisma.category.upsert({
      where: {
        name_userId: {
          name: item.category,
          userId: user.id,
        },
      },
      create: {
        name: item.category,
        userId: user.id,
      },
      update: {},
    });

    await prisma.expense.upsert({
      where: {
        merchant_categoryId_originalAmount_originalCurrency_reportedAt_userId: {
          merchant: item.merchant,
          originalAmount: item.originalAmount,
          originalCurrency: item.originalCurrency,
          reportedAt: item.reportedAt,
          userId: user.id,
          categoryId: category.id,
        },
        amount: item.amount,
      },
      create: {
        reportedAt: item.reportedAt,
        merchant: item.merchant,
        userId: user.id,
        amount: item.amount,
        originalAmount: item.originalAmount,
        originalCurrency: item.originalCurrency,
        categoryId: category.id,
        comment: item.comment,
      },
      update: {},
    });
  });
}
