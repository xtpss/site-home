const author = process.env.AUTHOR;

export function meta(): MetaItem[] {
  const metaItems: MetaItem[] = [
    {
      name: "description",
      content: `${author || "Someone"}'s personal website showcasing projects, skills, and experience in software development.`,
    },
    {
      name: "keywords",
      content: "Software Engineer, Web Developer, Frontend, Backend, Full Stack",
    },
  ];

  if (author) {
    metaItems.push({
      name: "author",
      content: author,
    });
  }

  return metaItems;
}

export function data() {
  const bundleData: Record<string, unknown> = {
    author: author || "",
    buildAt: new Date().toISOString(),
    mpsText: process.env.LEGALIZED_MPS_TEXT || "",
    mpsLink: process.env.LEGALIZED_MPS_LINK || "",
    mittText: process.env.LEGALIZED_MITT_TEXT || "",
    mittLink: process.env.LEGALIZED_MITT_LINK || "",
  };

  return bundleData;
}
