// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://parisvideotech.com',
  // Site fully static. Output is HTML/CSS.
  output: 'static',
  // Sitemap auto-generated at build.
  integrations: [mdx(), sitemap()],
  // Image optimization: native Astro service (sharp).
  image: {
    // Allowed remote image hosts (YouTube thumbnails, etc.).
    domains: ['i.ytimg.com', 'img.youtube.com'],
  },
  // Trailing slashes: keep WordPress convention (/page/ not /page) for parity.
  trailingSlash: 'always',
  // Build options.
  build: {
    // Inline small stylesheets (< 4KB) into <head>.
    inlineStylesheets: 'auto',
  },
  // Markdown renderer.
  // shikiConfig retiré pour le moment — on n'embarque pas de code source dans
  // les articles. À réactiver si besoin en Phase 2/4 avec :
  //   markdown: { shikiConfig: { theme: 'github-light' } }
});
