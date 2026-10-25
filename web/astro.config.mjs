// @ts-check
import react from '@astrojs/react';
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  site: 'https://danblack.co',
  output: 'static',
  // Directory-style URLs (/foo/ → /foo/index.html), matched by infra/functions/url-rewrite.js.
  trailingSlash: 'ignore',
  build: { format: 'directory' },
  integrations: [react()],
});
