import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import * as fs from "node:fs";
import { componentTagger } from "lovable-tagger";

function copyRecursiveSync(src: string, dest: string) {
  const stat = fs.statSync(src);
  if (stat.isDirectory()) {
    fs.mkdirSync(dest, { recursive: true });
    for (const entry of fs.readdirSync(src)) {
      copyRecursiveSync(path.join(src, entry), path.join(dest, entry));
    }
    return;
  }

  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.copyFileSync(src, dest);
}

function copyBuildToFiveM() {
  return {
    name: "copy-build-to-fivem",
    apply: "build" as const,
    closeBundle() {
      const distDir = path.resolve(__dirname, "dist");
      const targetDir = path.resolve(__dirname, "fivem-market/html/assets/ui");

      if (!fs.existsSync(distDir)) return;

      fs.rmSync(targetDir, { recursive: true, force: true });
      fs.mkdirSync(targetDir, { recursive: true });

      for (const entry of fs.readdirSync(distDir)) {
        if (entry === "index.html") continue; // FiveM kendi html/index.html dosyasını kullanıyor
        copyRecursiveSync(path.join(distDir, entry), path.join(targetDir, entry));
      }
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  base: "./",
  server: {
    host: "::",
    port: 8080,
  },
  build: {
    // Lovable preview/publish için dist şart; build sonrası otomatik FiveM klasörüne kopyalanır.
    outDir: "dist",
    emptyOutDir: true,
    rollupOptions: {
      output: {
        entryFileNames: "index.js",
        chunkFileNames: "chunk-[hash].js",
        assetFileNames: "[name][extname]",
      },
    },
  },
  plugins: [react(), mode === "development" && componentTagger(), copyBuildToFiveM()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));

