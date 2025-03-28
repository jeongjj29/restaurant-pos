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
      "@constants": path.resolve(__dirname, "src/constants.ts"),
      "@routes": path.resolve(__dirname, "src/routes.ts"),
      "@app": path.resolve(__dirname, "src/app"),
      "@utils": path.resolve(__dirname, "src/utils.ts"),
      "@auth": path.resolve(__dirname, "src/features/auth"),
      "@employees": path.resolve(__dirname, "src/features/employees"),
      "@menu": path.resolve(__dirname, "src/features/menu"),
      "@orders": path.resolve(__dirname, "src/features/orders"),
      "@payments": path.resolve(__dirname, "src/features/payments"),
      "@tables": path.resolve(__dirname, "src/features/tables"),
    },
  },
  server: {
    proxy: {
      "/api": "http://localhost:5555",
    },
  },
});
