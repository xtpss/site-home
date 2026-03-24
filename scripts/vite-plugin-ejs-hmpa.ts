import ejs from "ejs";
import path from "node:path";
import { glob } from "tinyglobby";
import type { PluginOption } from "vite";
import { normalizePath } from "vite";

type FileEntry = {
  filePath: string;
  fileExt: string;
};

export interface Options {
  /** @default ["_templates/**"] */
  exclude?: string | string[];
  /** @default ".ejs" */
  ext?: string;
}

export default function (options?: Options): PluginOption {
  const currentWorkingDir = process.cwd();
  const ejsExt = options?.ext ?? ".ejs";
  const ejsExtRegex = new RegExp(`${ejsExt}$`, "i");
  const htmlExt = ".html";
  const htmlExtRegex = new RegExp(`${htmlExt}$`, "i");
  const exclude = options?.exclude ?? ["_templates/**"];

  const fileEntries = new Map<string, FileEntry>();

  let resolvedRoot: string = currentWorkingDir;

  const renderEjsToHtml = async (ejsFile: string): Promise<string> => {
    return await ejs.renderFile(
      ejsFile,
      {},
      {
        views: [path.dirname(ejsFile), resolvedRoot],
        root: [resolvedRoot],
        beautify: false,
      },
    );
  };

  const resolveFileEntry = (requestPath: string): FileEntry | void => {
    const vHtmlId0 = normalizePath(path.join(resolvedRoot, requestPath)).toLowerCase();
    if (htmlExtRegex.test(requestPath)) {
      return fileEntries.get(vHtmlId0);
    }
    if (ejsExtRegex.test(requestPath)) {
      const vHtmlId = vHtmlId0.replace(ejsExtRegex, htmlExt);
      return fileEntries.get(vHtmlId);
    }
    if (path.extname(vHtmlId0)) {
      return fileEntries.get(vHtmlId0);
    }
    return (
      fileEntries.get(vHtmlId0 + htmlExt) || fileEntries.get(normalizePath(path.join(vHtmlId0, `index${htmlExt}`)))
    );
  };

  return {
    name: "private:vite-plugin-ejs-hmpa",
    enforce: "pre",
    async config(config) {
      fileEntries.clear();

      const rootDir = path.resolve(config.root || "");
      const ejsFiles = await glob(`**/*${ejsExt}`, {
        cwd: rootDir,
        absolute: true,
        ignore: exclude,
      });

      const input: Record<string, string> = {};
      for (const ejsFile of ejsFiles) {
        const htmlAbsPath = ejsFile.replace(ejsExtRegex, htmlExt);
        const htmlRelPath = path.relative(rootDir, htmlAbsPath);
        const htmlName = normalizePath(htmlRelPath).replace(htmlExtRegex, "");
        const vHtmlId = htmlAbsPath.toLowerCase();

        fileEntries.set(vHtmlId, { filePath: ejsFile, fileExt: ejsExt });
        input[htmlName] = vHtmlId;
      }

      return {
        build: {
          rolldownOptions: {
            input,
          },
        },
      };
    },
    configResolved(config) {
      resolvedRoot = config.root;
    },
    resolveId: {
      filter: {
        id: htmlExtRegex,
      },
      handler(id) {
        return fileEntries.has(id) ? id : null;
      },
    },
    load: {
      filter: {
        id: htmlExtRegex,
      },
      async handler(id) {
        const entry = fileEntries.get(id);
        if (!entry) {
          return null;
        }
        const htmlSource = await renderEjsToHtml(entry.filePath);
        return {
          code: htmlSource,
          moduleSideEffects: "no-treeshake",
        };
      },
    },
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (req.method !== "GET" && req.method !== "HEAD") {
          return next();
        }
        if (!req.url) {
          return next();
        }

        const url = new URL(req.url, "http://localhost");
        const requestPath = url.pathname;
        const fileEntry = resolveFileEntry(requestPath);
        if (!fileEntry) {
          return next();
        }
        const htmlSource = await renderEjsToHtml(fileEntry.filePath);
        const html = await server.transformIndexHtml(requestPath, htmlSource, req.originalUrl);
        res.statusCode = 200;
        res.appendHeader("Content-Type", "text/html; charset=utf-8");
        res.appendHeader("Cache-Control", "no-cache");
        res.end(html);
      });
    },
  };
}
