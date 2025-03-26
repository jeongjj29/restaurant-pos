import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@assets": path.resolve(__dirname, "src/assets"),
      "@components": path.resolve(__dirname, "src/components"),
      "@features": path.resolve(__dirname, "src/features"),
      "@pages": path.resolve(__dirname, "src/pages"),
      "@constants": path.resolve(__dirname, "src/constants.js"),
      "@routes": path.resolve(__dirname, "src/routes.js"),
      "@store": path.resolve(__dirname, "src/store.js"),
      "@utils": path.resolve(__dirname, "src/utils.js"),
    },
  },
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:5555",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
    },
  },
});
