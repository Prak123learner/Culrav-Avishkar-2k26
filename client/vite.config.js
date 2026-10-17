import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

import path from "path";
import { fileURLToPath } from "url";

// Fix __dirname for ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    // Firebase Auth and the app wrapper must share the same component registry,
    // even when npm installs nested copies of Firebase's internal packages.
    dedupe: ["@firebase/app", "@firebase/component", "@firebase/util"],
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  optimizeDeps: {
    include: ["firebase/app", "firebase/auth"],
  },
});
