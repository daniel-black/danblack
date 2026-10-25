import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

// Posts are Markdown files in src/content/writing; the filename is the URL slug.
const writing = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/writing' }),
  schema: z.object({
    title: z.string(),
    /** One or two sentences for the post list, search results, and link previews. */
    description: z.string(),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    /** Where a cross-posted piece first appeared, e.g. a Substack post. */
    originalUrl: z.url().optional(),
    /** Drafts build in `astro dev` but are left out of production. */
    draft: z.boolean().default(false),
  }),
});

export const collections = { writing };
