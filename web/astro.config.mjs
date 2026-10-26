// @ts-check
import mdx from '@astrojs/mdx';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import { defineConfig, fontProviders } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  site: 'https://danblack.co',
  output: 'static',
  // Directory-style URLs (/foo/ → /foo/index.html), matched by infra/functions/url-rewrite.js.
  trailingSlash: 'ignore',
  build: { format: 'directory' },
  // The sitemap skips the old-URL redirect pages.
  integrations: [react(), mdx(), sitemap({ filter: (page) => !page.includes('/blog/') })],
  // Old URLs from the previous site.
  redirects: {
    '/blog/variable-duty-cycle-square-wave': '/writing/variable-duty-cycle-square-wave/',
  },
  fonts: [
    {
      provider: fontProviders.local(),
      name: 'Geist Pixel',
      cssVariable: '--font-geist-pixel',
      fallbacks: ['monospace'],
      options: {
        variants: [{ src: ['./src/assets/fonts/GeistPixel-Square.woff2'], weight: 400, style: 'normal' }],
      },
    },
  ],
});
