import tailwindcss from "@tailwindcss/vite";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import solid from "vite-plugin-solid";

import ejsHmpa from "./scripts/vite-plugin-ejs-hmpa";
import htmlMinifier from "./scripts/vite-plugin-html-minifier";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "src");
const publicDir = resolve(__dirname, "public");
const outDir = resolve(__dirname, "dist");

export default defineConfig({
  root: root,
  publicDir: publicDir,
  build: {
    outDir: outDir,
    emptyOutDir: true,
    assetsDir: "_static",
  },
  define: {
    "process.env.BUILD_AT": JSON.stringify(new Date().toISOString()),
    "process.env.COMMIT_ID": JSON.stringify(process.env.COMMIT_ID || "N/A"),
  },
  plugins: [tailwindcss(), ejsHmpa(), solid(), htmlMinifier()],
});
