// @ts-check
import { minify } from '@zokki/astro-minify';
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite'
import mdx from '@astrojs/mdx';
import react from '@astrojs/react';
import cloudflare from '@astrojs/cloudflare';

// https://astro.build/config
export default defineConfig({
  devToolbar: {
    enabled: false
  },
  vite: {
    plugins: [tailwindcss()],
    ssr: {
      external: ["canvas"],
    },

  },
  output: "server",
  adapter: cloudflare(),
  site: 'https://geeta.prasuco.com',
  integrations: [sitemap(), mdx(), react(), minify()]
});