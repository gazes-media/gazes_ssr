import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({ 
      registerType: 'autoUpdate',
      injectRegister: false,
      manifest: {
        name: "Gazes",
        short_name: "Gazes",
        description: "The Gazes Progressive Web App",
        theme_color: "#000000",
        screenshots: [
          {
            src: "/icon/desktop.png",
            sizes: "1920x1080",
            type: "image/png",
            form_factor:"wide",
            platform:"desktop"
          },
          {
            src: "/icon/mobile.png",
            sizes: "1290x2796",
            type: "image/png",
            form_factor:"narrow",
            platform:"mobile"
          }
        ],
        icons: [
          {
            src: "/icon/android/android-launchericon-48-48.png",
            sizes: "48x48",
            type: "image/png"
          },
          {
            src: "/icon/android/android-launchericon-72-72.png",
            sizes: "72x72",
            type: "image/png"
          },
          {
            src: "/icon/android/android-launchericon-96-96.png",
            sizes: "96x96",
            type: "image/png"
          },
          {
            src: "/icon/android/android-launchericon-144-144.png",
            sizes: "144x144",
            type: "image/png"
          },
          {
            src: "/icon/android/android-launchericon-192-192.png",
            sizes: "192x192",
            type: "image/png"
          },
          {
            src: "/icon/android/android-launchericon-512-512.png",
            sizes: "512x512",
            type: "image/png"
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,png,jpg,svg}'],
      },
    })
  ],
  build:{
    outDir: '../public',
    emptyOutDir: true,
    chunkSizeWarningLimit: 2000,
  },
})
