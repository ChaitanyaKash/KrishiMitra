import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  build: {
    chunkSizeWarningLimit: 1600,
  },
  server: {
    proxy: {
      '/vedas-api': {
        target: 'https://vedas.sac.gov.in',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/vedas-api/, '/vapi/ridam_server3'),
        headers: {
          Referer: 'https://vedas.sac.gov.in',
        },
      },
    },
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      devOptions: {
        enabled: true
      },
      manifest: {
        name: "Krishi Mitra",
        short_name: "KM",
        description: "India's first Risk-Free Farmer OS",
        theme_color: "#0F6E56",
        background_color: "#0F6E56",
        display: "standalone",
        orientation: "portrait",
        start_url: "/",
        icons: [
          { src: "/icons/km-192.png", sizes: "192x192", type: "image/png" },
          { src: "/icons/km-512.png", sizes: "512x512", type: "image/png" }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,json}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/api\.eos\.com\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'eosda-api-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 7 // <== 7 days
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          }
        ]
      }
    })
  ],
})
