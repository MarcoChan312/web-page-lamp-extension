import { copyFileSync, cpSync, existsSync, mkdirSync } from "node:fs";
import { resolve } from "node:path";
import { defineConfig } from "vite";

function copyExtensionAssetsPlugin() {
  return {
    name: "copy-extension-assets",
    closeBundle() {
      const root = __dirname;
      const outDir = resolve(root, "dist");

      mkdirSync(resolve(outDir, "content"), { recursive: true });
      copyFileSync(resolve(root, "src/content/content.css"), resolve(outDir, "content/content.css"));

      copyFileSync(resolve(root, "public/manifest.json"), resolve(outDir, "manifest.json"));

      const iconsSrc = resolve(root, "public/icons");
      const iconsOut = resolve(outDir, "icons");
      if (existsSync(iconsSrc)) {
        cpSync(iconsSrc, iconsOut, { recursive: true });
      }
    }
  };
}

export default defineConfig({
  build: {
    outDir: "dist",
    emptyOutDir: true,
    target: "es2022",
    rollupOptions: {
      input: {
        background: resolve(__dirname, "src/background/background.ts"),
        content: resolve(__dirname, "src/content/content.ts")
      },
      output: {
        entryFileNames(chunkInfo) {
          if (chunkInfo.name === "background") {
            return "background/background.js";
          }
          if (chunkInfo.name === "content") {
            return "content/content.js";
          }
          return "assets/[name]-[hash].js";
        },
        chunkFileNames: "assets/[name]-[hash].js",
        assetFileNames: "assets/[name]-[hash][extname]",
        manualChunks: undefined
      }
    }
  },
  plugins: [copyExtensionAssetsPlugin()]
});