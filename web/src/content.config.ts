import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

// Posts are Markdown (or MDX, for posts with interactive parts) in src/content/writing;
// the filename is the URL slug.
const writing = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/writing' }),
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

// Jobs are Markdown files in src/content/experience; the filename is the URL slug.
const experience = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/experience' }),
  schema: z.object({
    company: z.string(),
    /** The product you worked on, if different from the company. */
    product: z.string().optional(),
    url: z.url(),
    /** One or two sentences for the overview card and link previews. */
    summary: z.string(),
    /** Newest first. Leave `end` off the current role. */
    roles: z
      .array(
        z.object({
          title: z.string(),
          start: z.coerce.date(),
          end: z.coerce.date().optional(),
        }),
      )
      .min(1),
    /** The backdrop scene on the job's page. */
    scene: z.enum(['space', 'highway']),
    /** Label for the link from the overview, e.g. "Fly up to orbit". */
    cta: z.string(),
  }),
});

export const collections = { writing, experience };
