import { projectsByLocale } from "#lib/projects/index.js";

// No page links here, so the crawler never finds it: opt in explicitly (the layout flag is not enough).
export const prerender = true;

export const GET = async () => {
  return Response.json(projectsByLocale.en.map((p) => ({ label: p.title, value: p.id })));
};
