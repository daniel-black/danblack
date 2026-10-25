// @ts-check
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig, fontProviders } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  site: 'https://danblack.co',
  output: 'static',
  // Directory-style URLs (/foo/ → /foo/index.html), matched by infra/functions/url-rewrite.js.
  trailingSlash: 'ignore',
  build: { format: 'directory' },
  integrations: [react()],
  vite: { plugins: [tailwindcss()] },
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
