// @ts-check

import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite'
// import mdx from '@astrojs/mdx';
// import react from '@astrojs/react';
import cloudflare from '@astrojs/cloudflare';
import compressor from "astro-compressor";

import react from '@astrojs/react';
import VitePWA from '@vite-pwa/astro';

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
  integrations: [react(), VitePWA({
    registerType: 'autoUpdate',
    includeAssets: ['favicon.ico', 'favicon.svg', 'og.png'],
    manifest: {
      name: 'Geeta Mini - Bhagavad Gita',
      short_name: 'Geeta Mini',
      id: '/',
      description: 'Read the complete Bhagavad Gita — 18 chapters, 700 verses with Sanskrit, translations, meanings and commentary.',
      theme_color: '#EA580C',
      background_color: '#FFFFFF',
      display: 'standalone',
      display_override: ['window-controls-overlay', 'standalone', 'minimal-ui'],
      orientation: 'portrait',
      start_url: '/',
      scope: '/',
      categories: ['books', 'education', 'lifestyle'],
      shortcuts: [
        {
          name: 'Chapters',
          short_name: 'Chapters',
          url: '/',
          icons: [{ src: '/pwa-192x192.png', sizes: '192x192', type: 'image/png' }],
        },
        {
          name: 'Saved Verses',
          short_name: 'Saved',
          url: '/bookmarks',
          icons: [{ src: '/pwa-192x192.png', sizes: '192x192', type: 'image/png' }],
        },
        {
          name: 'Geeta in Mail',
          short_name: 'Geeta Mail',
          url: '/geeta-mail',
          icons: [{ src: '/pwa-192x192.png', sizes: '192x192', type: 'image/png' }],
        },
      ],
      icons: [
        { src: '/pwa-192x192.png', sizes: '192x192', type: 'image/png' },
        { src: '/pwa-512x512.png', sizes: '512x512', type: 'image/png' },
        { src: '/pwa-maskable-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
      ],
    },
    workbox: {
      globPatterns: ['**/*.{js,css,woff,woff2,ttf}'],
      navigateFallback: null,
      runtimeCaching: [
        {
          urlPattern: ({ request }) => request.mode === 'navigate',
          handler: 'NetworkFirst',
          options: {
            cacheName: 'pages',
            networkTimeoutSeconds: 3,
            cacheableResponse: { statuses: [0, 200] },
            expiration: { maxEntries: 100, maxAgeSeconds: 60 * 60 * 24 * 30 },
          },
        },
        {
          urlPattern: ({ url }) => url.pathname.includes('/og/'),
          handler: 'CacheFirst',
          options: {
            cacheName: 'og-images',
            cacheableResponse: { statuses: [0, 200] },
            expiration: { maxEntries: 100, maxAgeSeconds: 60 * 60 * 24 * 30 },
          },
        },
      ],
    },
  })]
});