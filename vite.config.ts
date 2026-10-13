import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  base: "./",
  plugins: [react()],
  build: {
    target: "es2020",
    cssCodeSplit: true,
    sourcemap: false,
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (
            id.includes("node_modules/react/") ||
            id.includes("node_modules/react-dom/")
          ) {
            return "vendor-react";
          }
          if (id.includes("node_modules/lucide-react/")) {
            return "vendor-icons";
          }
          if (
            id.includes("/src/data/heroes.ts") ||
            id.includes("/entities/hero/bi/heroes.ts")
          ) {
            return "data-heroes";
          }
          if (
            id.includes("/src/data/items.ts") ||
            id.includes("/entities/item/bi/items.ts") ||
            id.includes("/src/data/counterMatrix.ts") ||
            id.includes("/entities/counter/bi/counterMatrix.ts") ||
            id.includes("/src/data/heroItemInteractions.ts") ||
            id.includes("/entities/counter/bi/heroItemInteractions.ts")
          ) {
            return "data-interactions";
          }
        },
      },
    },
  },
  server: {
    port: 3000,
    host: true,
  },
});
