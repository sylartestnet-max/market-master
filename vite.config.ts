import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  base: "./", // FiveM NUI için relative asset path
  server: {
    host: "::",
    port: 8080,
  },
  build: {
    // Build çıktısını direkt FiveM resource içine alıyoruz (tek klasörle taşıma için)
    // Not: UI bundle'ı ayrı bir klasörde tutuyoruz ki item görselleri silinmesin.
    outDir: "fivem-market/html/assets/ui",
    emptyOutDir: true,
    rollupOptions: {
      output: {
        entryFileNames: "index.js",
        chunkFileNames: "chunk-[hash].js",
        assetFileNames: "[name][extname]",
      },
    },
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));

