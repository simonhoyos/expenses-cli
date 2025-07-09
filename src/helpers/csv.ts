import { type Options as ParseOptions, parse } from 'csv-parse';
import { z } from 'zod';

export const CsvInputTrimmerSchema = z.array(
  z.record(z.string(), z.unknown()).transform((val) =>
    Object.fromEntries(
      Object.entries(val).map(([key, value]) => {
        const trimmedValue = z.string().nullish().parse(value)?.trim();

        return [key, trimmedValue === '' ? undefined : trimmedValue];
      }),
    ),
  ),
);

export async function csvParse<O>(
  input: string | Buffer,
  options?: ParseOptions,
) {
  return new Promise<O[]>((resolve, reject) => {
    parse(input, options, (err, output) => {
      if (err != null) {
        reject(err);
      } else {
        resolve(output as O[]);
      }
    });
  });
}
