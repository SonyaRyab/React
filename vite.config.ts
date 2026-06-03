import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import fs from "fs";
import path from "path";

const LOCAL_BACKEND_IP = "192.168.2.238";
const API_PORT = "8080";
const IMG_PORT = "9000";

const apiProxy = `http://${LOCAL_BACKEND_IP}:${API_PORT}`;
const imgProxy = `http://${LOCAL_BACKEND_IP}:${IMG_PORT}`;

export default defineConfig({
  base: "./",
  plugins: [react()],
  server: {
    host: "0.0.0.0",
    port: 3000,
    https: {
      key: fs.readFileSync(path.resolve(__dirname, "localhost+3-key.pem")),
      cert: fs.readFileSync(path.resolve(__dirname, "localhost+3.pem")),
    },
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
      },
    },
  },
  preview: {
    host: "0.0.0.0",
    port: 4173,
    https: {
      key: fs.readFileSync(path.resolve(__dirname, "localhost+3-key.pem")),
      cert: fs.readFileSync(path.resolve(__dirname, "localhost+3.pem")),
    },
  },
});