// @ts-check

import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite'
// import mdx from '@astrojs/mdx';
// import react from '@astrojs/react';
import cloudflare from '@astrojs/cloudflare';
import compressor from "astro-compressor";

import react from '@astrojs/react';

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
  trailingSlash: "never",

  adapter: cloudflare({ imageService: "compile", }),
  site: 'https://geeta.prasuco.com',
  integrations: [react()]
});