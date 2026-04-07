export function meta(): MetaItem[] {
  return [
    {
      name: "description",
      content: "A Vite plugin for rendering EJS templates in a multi-page application setup.",
    },
    {
      name: "keywords",
      content: "vite, plugin, ejs, multi-page application, hmpa, html rendering",
    },
  ];
}

export function data() {
  return {
    name: "vite-plugin-ejs-hmpa",
    version: "1.0.0",
    buildAt: new Date().toISOString(),
    commitId: process.env.COMMIT_ID || "N/A",
  };
}
