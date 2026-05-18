import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import mkcert from 'vite-plugin-mkcert'
import fs from 'fs';
import path from 'path';

export default defineConfig({
  plugins: [
    react(),
    mkcert(),
    VitePWA({
        registerType: 'autoUpdate',
        devOptions: {
            enabled: true,
        },
        manifest: {
        name: "Синтез метана по реакции Сабатье",
        short_name: "Methane",
        start_url: "/methane_sabatier_reaction/",
        display: "standalone",
        background_color: "#fdfdfd",
        theme_color: "#db4938",
        orientation: "portrait-primary",
        icons: [
            {
            src: "logo192.png",
            type: "image/png",
            sizes: "192x192"
            },
            {
            src: "logo512.png",
            type: "image/png",
            sizes: "512x512"
            }
        ]
        },
        workbox: {
            maximumFileSizeToCacheInBytes: 30 * 1024 * 1024
        }
    })
  ],
  base: "/methane_sabatier_reaction/",
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:8080",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, "/"),
      },
    },
    https:{
        key: fs.readFileSync(path.resolve(__dirname, 'cert.key')),
        cert: fs.readFileSync(path.resolve(__dirname, 'cert.crt')),
    },
  },
});