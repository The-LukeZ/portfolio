import { projectsByLocale } from "#lib/projects/index.js";

export const GET = async () => {
  return Response.json(projectsByLocale.en.map((p) => ({ label: p.title, value: p.id })));
};
