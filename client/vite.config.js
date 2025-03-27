import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@assets": resolve(__dirname, "src/assets"),
      "@components": resolve(__dirname, "src/components"),
      "@features": resolve(__dirname, "src/features"),
      "@pages": resolve(__dirname, "src/pages"),
      "@constants": resolve(__dirname, "src/constants.js"),
      "@routes": resolve(__dirname, "src/routes.js"),
      "@store": resolve(__dirname, "src/store.js"),
      "@utils": resolve(__dirname, "src/utils.js"),
    },
  },
  server: {
    proxy: {
      "/api": "http://localhost:5555",
    },
  },
});
