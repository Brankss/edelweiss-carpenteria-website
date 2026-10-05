import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const realizzazioni = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/realizzazioni' }),
  schema: z.object({
    titolo: z.string(),
    // Comune per la quota ISTAT (solo se il luogo è certo)
    comune: z.string().optional(),
    luogo: z.string().optional(),
    categoria: z.enum(['tetti', 'case', 'sopraelevazioni', 'facciate', 'su-misura']),
    cartella: z.string(),
    sintesi: z.string(),
    ordine: z.number(),
    inEvidenza: z.boolean().default(false),
    // numero della foto da usare come copertina nelle griglie (1 = la prima della cartella)
    copertina: z.number().default(1),
  }),
});

export const collections = { realizzazioni };
