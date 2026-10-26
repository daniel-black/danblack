import rss from '@astrojs/rss';
import type { APIRoute } from 'astro';
import { getPosts } from '../../writing.ts';

export const GET: APIRoute = async ({ site }) =>
  rss({
    title: 'Dan Black — Writing',
    description: 'Essays and notes by Dan Black.',
    site: site!,
    items: (await getPosts()).map((post) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.pubDate,
      link: `/writing/${post.id}/`,
    })),
  });
