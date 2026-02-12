// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite'
import mdx from '@astrojs/mdx';
import react from '@astrojs/react';
// https://astro.build/config
export default defineConfig({
  devToolbar: {
    enabled: false
  },
  vite: {
    plugins: [tailwindcss()]
  },

  site: 'https://geeta.prasuco.com',

  integrations: [sitemap(), mdx(), react()]
});