import { json } from "@sveltejs/kit";
import { projectsByLocale } from "#lib/projects/index.js";

// Project picker options for Sveltia CMS (static/admin/init.js), always in sync with projects/en.yaml.
export const prerender = true;

export function GET() {
  return json(projectsByLocale.en.map((p) => ({ label: p.title, value: p.id })));
}
