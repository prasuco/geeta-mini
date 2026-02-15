// @ts-check

import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite'
// import mdx from '@astrojs/mdx';
// import react from '@astrojs/react';
import cloudflare from '@astrojs/cloudflare';
import compressor from "astro-compressor";

// https://astro.build/config
export default defineConfig({
  devToolbar: {
    enabled: false
  },
  vite: {
    plugins: [tailwindcss()],

    ssr: {
      external: ["canvas", "sharp"],
    },



  },
  output: "server",

  adapter: cloudflare({ imageService: "compile", }),
  site: 'https://geeta.prasuco.com',
  integrations: [sitemap()]
});