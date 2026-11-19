import { defineHastPlugin, defineMdastPlugin, markdownToHtml } from "satteri";
import { createHighlighter } from "shiki";

const THEME = "github-dark-default";
const LANGS = ["ts", "js", "json", "bash", "svelte", "yaml", "go", "html", "css", "sql", "diff"];

/** Schemes a link may use. Relative paths and #anchors have no scheme and are allowed too. */
const SAFE_SCHEME = /^(https?|mailto):/i;
const HAS_SCHEME = /^[a-z][a-z0-9+.-]*:/i;

/**
 * Creates the build-time Markdown renderer for posts. Uses satteri directly (not the Astro
 * wrapper), so nothing injects CSS, scripts or heading ids. Raw HTML is escaped, root-relative
 * URLs become absolute, and code blocks are highlighted by shiki with inline styles.
 */
export async function createRenderer(siteUrl: string): Promise<(markdown: string) => string> {
  const highlighter = await createHighlighter({ themes: [THEME], langs: LANGS });
  const loaded = new Set(highlighter.getLoadedLanguages());

  const noRawHtml = defineMdastPlugin({
    name: "no-raw-html",
    html(node, ctx) {
      ctx.replaceNode(node, { type: "text", value: node.value });
    },
  });

  const highlight = defineMdastPlugin({
    name: "highlight",
    code(node, ctx) {
      const lang = node.lang && loaded.has(node.lang) ? node.lang : "text";
      ctx.replaceNode(node, { raw: highlighter.codeToHtml(node.value, { lang, theme: THEME }) });
    },
  });

  const absolute = (value: string) =>
    value.startsWith("/") && !value.startsWith("//") ? siteUrl + value : value;

  const urls = defineHastPlugin({
    name: "urls",
    element: {
      filter: ["a", "img"],
      visit(node, ctx) {
        const key = node.tagName === "a" ? "href" : "src";
        const value = node.properties?.[key];
        if (typeof value !== "string") return;
        const trimmed = value.trim();
        if (HAS_SCHEME.test(trimmed) && !SAFE_SCHEME.test(trimmed)) {
          ctx.setProperty(node, key, null);
          return;
        }
        ctx.setProperty(node, key, absolute(trimmed));
      },
    },
  });

  return (markdown) =>
    markdownToHtml(markdown, {
      features: { gfm: true, frontmatter: false, rawHtml: false, smartPunctuation: false },
      mdastPlugins: [noRawHtml, highlight],
      hastPlugins: [urls],
    }).html;
}
