import { minify } from "html-minifier-terser";
import type { PluginOption } from "vite";

export default function (): PluginOption {
  return {
    name: "private:vite-plugin-html-minifier",
    enforce: "post",
    apply: "build",
    async transformIndexHtml(html) {
      const minified = await minify(html, {
        collapseWhitespace: true,
        removeRedundantAttributes: true,
        removeEmptyAttributes: true,
        minifyCSS: true,
        minifyJS: true,
      });
      return minified;
    },
  };
}
