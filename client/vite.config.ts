/// <reference types="vitest" />
import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  return {
    build: {
      outDir: "build",
    },
    define: {
      "process.env.API_KEY": JSON.stringify(env.API_KEY),
      "process.env.AUTH_DOMAIN": JSON.stringify(env.AUTH_DOMAIN),
      "process.env.PROJECT_ID": JSON.stringify(env.PROJECT_ID),
      "process.env.STORAGE_BUCKET": JSON.stringify(env.STORAGE_BUCKET),
      "process.env.MESSAGING_SENDER_ID": JSON.stringify(
        env.MESSAGING_SENDER_ID
      ),
      "process.env.APP_ID": JSON.stringify(env.APP_ID),
      "process.env.MEASUREMENT_ID": JSON.stringify(env.MEASUREMENT_ID),
      "process.env.MAPBOX_TOKEN": JSON.stringify(env.MAPBOX_TOKEN),
      "process.env.VITE_CLERK_PUBLISHABLE_KEY": JSON.stringify(
        env.VITE_CLERK_PUBLISHABLE_KEY
      ),
    },
    plugins: [react()],
    server: {
      port: 8000,
    },
    test: {
      exclude: ["**/e2e/**", "**/node_modules/**"],
    },
  };
});
