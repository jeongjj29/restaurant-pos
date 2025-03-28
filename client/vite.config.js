import react from "@vitets/plugin-react";
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
      "@constants": resolve(__dirname, "src/constants.ts"),
      "@routes": resolve(__dirname, "src/routes.ts"),
      "@store": resolve(__dirname, "src/store.ts"),
      "@utils": resolve(__dirname, "src/utils.ts"),
      "@auth": resolve(__dirname, "src/features/auth"),
      "@employees": resolve(__dirname, "src/features/employees"),
      "@menu": resolve(__dirname, "src/features/menu"),
      "@orders": resolve(__dirname, "src/features/orders"),
      "@payments": resolve(__dirname, "src/features/payments"),
      "@tables": resolve(__dirname, "src/features/tables"),
    },
  },
  server: {
    proxy: {
      "/api": "http://localhost:5555",
    },
  },
});
