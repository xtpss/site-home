import ejs, { type Data as EjsData } from "ejs";
import fs from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { glob } from "tinyglobby";
import { normalizePath, runnerImport, send, type PluginOption, type UserConfig } from "vite";

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
  const tsExt = ".ts";
  const ejsExt = options?.ext ?? ".ejs";
  const ejsExtRegex = new RegExp(`${ejsExt}$`, "i");
  const htmlExt = ".html";
  const htmlExtRegex = new RegExp(`${htmlExt}$`, "i");
  const exclude = options?.exclude ?? ["_templates/**"];

  const fileEntries = new Map<string, FileEntry>();

  let userConfig: UserConfig = {};
  let resolvedRoot: string = currentWorkingDir;

  const renderEjsToHtml = async (fileEntry: FileEntry): Promise<string> => {
    const ejsFile = fileEntry.filePath;
    const dataLoaderFile = ejsFile.replace(ejsExtRegex, tsExt);
    const ejsData: EjsData = {
      meta: [],
      data: {},
    };
    try {
      await fs.access(dataLoaderFile);
      const dataLoaderUrl = pathToFileURL(dataLoaderFile).href;
      const dynamicLoader = await runnerImport(dataLoaderUrl, userConfig);
      const dataLoader = dynamicLoader.module as { meta?: () => Promise<unknown>; data?: () => Promise<unknown> };
      const [meta, data] = await Promise.all([
        typeof dataLoader.meta === "function" ? dataLoader.meta() : null,
        typeof dataLoader.data === "function" ? dataLoader.data() : null,
      ]);
      if (meta) {
        ejsData.meta = meta;
      }
      if (data) {
        ejsData.data = data;
      }
    } catch {
      // No data file or error in importing, proceed with empty data
    }

    return await ejs.renderFile(ejsFile, ejsData, {
      views: [path.dirname(ejsFile), resolvedRoot],
      root: [resolvedRoot],
      beautify: false,
    });
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
      userConfig = config;
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
        const fileEntry = fileEntries.get(id);
        if (!fileEntry) {
          return null;
        }
        const html = await renderEjsToHtml(fileEntry);
        return {
          code: html,
          moduleSideEffects: "no-treeshake",
        };
      },
    },
    configureServer(server) {
      server.middlewares.use(async function virtualHtmlMiddleware(req, res, next) {
        if (res.writableEnded) {
          return next();
        }
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
        let html = await renderEjsToHtml(fileEntry);
        html = await server.transformIndexHtml(requestPath, html, req.originalUrl);
        return send(req, res, html, "html", { headers: server.config.server.headers });
      });
    },
  };
}
