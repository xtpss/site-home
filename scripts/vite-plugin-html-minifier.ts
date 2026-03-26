import { minify, type Options as MinifyOptions } from "html-minifier-terser";
import type { PluginOption } from "vite";

export interface Options {
  minify?: boolean | MinifyOptions;
}

export default function (options?: Options): PluginOption {
  let mergedOptions: MinifyOptions | undefined;

  if (options === undefined || options.minify !== false) {
    mergedOptions = {
      collapseWhitespace: true,
      removeRedundantAttributes: false,
      removeEmptyAttributes: false,
      keepClosingSlash: true,
      minifyCSS: true,
      minifyJS: true,
    };
  } else if (typeof options.minify === "object") {
    mergedOptions = options.minify;
  }

  return {
    name: "private:vite-plugin-html-minifier",
    enforce: "post",
    apply: "build",
    transformIndexHtml: {
      order: "post",
      async handler(html) {
        if (!mergedOptions) {
          return html;
        }
        return await minify(html, mergedOptions);
      },
    },
  };
}
