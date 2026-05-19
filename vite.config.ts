import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";
import mkcert from "vite-plugin-mkcert";
import fs from "fs";
import path from "path";

const isTauriBuild = process.env.TAURI_PLATFORM || process.env.TAURI_ARCH || process.env.TAURI_FAMILY;
const GITHUB_PAGES_REPO = "/methane_sabatier_reaction_frontend/";
const LOCAL_BACKEND_IP = "192.168.2.238";
const API_PORT = "8080";
const IMG_PORT = "9000";

const apiProxy = `http://${LOCAL_BACKEND_IP}:${API_PORT}`;
const imgProxy = `http://${LOCAL_BACKEND_IP}:${IMG_PORT}`;

export default defineConfig({
  base: GITHUB_PAGES_REPO,
  plugins: [
    react(),
    mkcert(),
    VitePWA({
      registerType: "autoUpdate",
      devOptions: {
        enabled: true,
      },
      manifest: {
        name: "Methane",
        short_name: "Methane",
        start_url: GITHUB_PAGES_REPO,
        scope: GITHUB_PAGES_REPO,
        display: "standalone",
        background_color: "#fdfdfd",
        theme_color: "#db4938",
        orientation: "portrait-primary",
        icons: [
          { src: "logo192.png", sizes: "192x192", type: "image/png" },
          { src: "logo512.png", sizes: "512x512", type: "image/png" }
        ]
      },
      workbox: {
        maximumFileSizeToCacheInBytes: 30 * 1024 * 1024
      }
    })
  ],
  server: {
    host: "0.0.0.0",
    port: 3000,
    proxy: {
      "/api": {
        target: apiProxy,
        changeOrigin: true,
        secure: false,
      },
      "/img-proxy": {
        target: imgProxy,
        changeOrigin: true,
        secure: false,
      }
    },
    https: {
      key: fs.readFileSync(path.resolve(__dirname, "cert.key")),
      cert: fs.readFileSync(path.resolve(__dirname, "cert.crt")),
    },
  },
  preview: {
    host: "0.0.0.0",
    port: 4173,
    https: {
      key: fs.readFileSync(path.resolve(__dirname, "cert.key")),
      cert: fs.readFileSync(path.resolve(__dirname, "cert.crt")),
    },
  }
});