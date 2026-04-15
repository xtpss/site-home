import tailwindcss from "@tailwindcss/vite";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig, loadEnv } from "vite";
import solid from "vite-plugin-solid";
import { sri } from "vite-plugin-sri3";

import ejsHmpa from "./scripts/vite-plugin-ejs-hmpa";
import htmlMinifier from "./scripts/vite-plugin-html-minifier";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "src");
const publicDir = resolve(__dirname, "public");
const outDir = resolve(__dirname, "dist");

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, __dirname, "");
  Object.assign(process.env, env);
  process.env.BUILD_AT = new Date().toISOString();

  return {
    root: root,
    publicDir: publicDir,
    build: {
      outDir: outDir,
      emptyOutDir: true,
      assetsDir: "_static",
    },
    plugins: [tailwindcss(), ejsHmpa(), solid(), htmlMinifier(), sri()],
    define: {
      "process.env.COMMIT_ID": JSON.stringify(process.env.COMMIT_ID || "N/A"),
      "process.env.BUILD_AT": JSON.stringify(process.env.BUILD_AT),
    },
  };
});
