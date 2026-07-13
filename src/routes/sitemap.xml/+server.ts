import { baseLocale, locales } from "$lib/paraglide/runtime";

export const prerender = true;

const SITE_URL = "https://thelukez.com";

/** Routes to expose in the sitemap, one entry per localized path. */
const routes: { path: string; changefreq: string; priority: string }[] = [
  { path: "", changefreq: "monthly", priority: "1.0" },
  { path: "business", changefreq: "monthly", priority: "0.6" },
  { path: "discord-permissions", changefreq: "monthly", priority: "0.5" },
  { path: "textedit", changefreq: "yearly", priority: "0.3" },
];

function localizedPath(locale: string, path: string) {
  const prefix = locale === baseLocale ? "" : `/${locale}`;
  return `${SITE_URL}${prefix}/${path}`.replace(/\/+$/, path ? "" : "/");
}

export function GET() {
  const lastmod = new Date().toISOString().slice(0, 10);

  const urls = routes
    .map(({ path, changefreq, priority }) => {
      const alternates = locales
        .map(
          (locale) =>
            `    <xhtml:link rel="alternate" hreflang="${locale}" href="${localizedPath(locale, path)}" />`,
        )
        .join("\n");
      const defaultHref = localizedPath(baseLocale, path);

      return locales
        .map(
          (locale) => `  <url>
    <loc>${localizedPath(locale, path)}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
${alternates}
    <xhtml:link rel="alternate" hreflang="x-default" href="${defaultHref}" />
  </url>`,
        )
        .join("\n");
    })
    .join("\n");

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
  xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls}
</urlset>
`;

  return new Response(body, {
    headers: { "Content-Type": "application/xml" },
  });
}
