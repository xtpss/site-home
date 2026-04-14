export function meta(): MetaItem[] {
  return [
    {
      name: "description",
      content: "Yifei Wang's personal website showcasing projects, skills, and experience in software development.",
    },
    {
      name: "keywords",
      content: "Software Engineer, Web Developer, Frontend, Backend, Full Stack",
    },
    {
      name: "author",
      content: "Yifei Wang",
    },
  ];
}

export function data() {
  return {
    name: "Yifei Wang's Personal Website",
    version: "1.0.0",
    author: "Yifei Wang",
    buildAt: new Date().toISOString(),
  };
}
