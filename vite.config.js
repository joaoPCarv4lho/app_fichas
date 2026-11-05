import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'apple-touch-icon.png', 'pwa-maskable-512.png'],
      manifest: {
        name: 'Fichas — Anamnese',
        short_name: 'Fichas',
        description: 'Fichas de anamnese para pele/dermaplaning e manicure',
        lang: 'pt-BR',
        theme_color: '#b06a78',
        background_color: '#f8f4f3',
        display: 'standalone',
        id: '/',
        start_url: '/',
        icons: [
          { src: 'pwa-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'pwa-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,woff2}'],
        navigateFallbackDenylist: [/^\/api/]
      }
    })
  ]
})
