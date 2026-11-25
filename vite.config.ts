import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function copy404Plugin(): Plugin {
  return {
    name: "copy-404",
    closeBundle() {
      const dist = path.resolve(__dirname, "dist");
      const indexHtml = path.join(dist, "index.html");
      const notFoundHtml = path.join(dist, "404.html");
      if (fs.existsSync(indexHtml)) {
        fs.copyFileSync(indexHtml, notFoundHtml);
      }
    },
  };
}

export default defineConfig(({ command }) => ({
  base:
    process.env.BASE_URL ??
    (command === "build" && process.env.GITHUB_ACTIONS ? "/the-mandate-herdr/" : "/"),
  plugins: [react(), copy404Plugin()],
  server: {
    watch: null,
  },
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts"],
  },
}));
