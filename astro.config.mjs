// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// Dominio definitivo consigliato in docs/seo.md. Finché il sito è in anteprima resta noindex (vedi src/data/sito.ts).
export default defineConfig({
  site: 'https://www.edelcarpenteria.com',
  trailingSlash: 'always',
  integrations: [
    sitemap({
      filter: (page) => !/\/(grazie|404)\/?$/.test(page),
    }),
  ],
  image: {
    layout: 'constrained',
    responsiveStyles: true,
  },
  build: {
    inlineStylesheets: 'always',
  },
  prefetch: {
    prefetchAll: false,
    defaultStrategy: 'hover',
  },
});
