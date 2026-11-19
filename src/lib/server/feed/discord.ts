import type { APIEmbed, RESTPostAPIWebhookWithTokenJSONBody } from "discord-api-types/v10";
import { postUrl, type Post } from "./types.ts";

/** The site's label orange. */
const COLOR = 0xff8f2e;

export function buildWebhookPayload(
  post: Post,
  projectTitle: string | null,
): RESTPostAPIWebhookWithTokenJSONBody {
  const embed: APIEmbed = {
    title: post.title,
    url: postUrl(post.slug),
    description: post.summary,
    timestamp: post.date,
    color: COLOR,
  };
  if (post.image) embed.image = { url: post.image.src };
  if (projectTitle) embed.fields = [{ name: "Project", value: projectTitle, inline: true }];

  return { embeds: [embed], allowed_mentions: { parse: [] } };
}

/** Posts to a Discord webhook. Throws on any non-2xx response. Never logs the URL (it is a secret). */
export async function sendWebhook(
  webhookUrl: string,
  payload: RESTPostAPIWebhookWithTokenJSONBody,
): Promise<void> {
  // The URL may already carry a query (e.g. ?thread_id= for forum threads).
  const url = new URL(webhookUrl);
  url.searchParams.set("wait", "true");
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Discord ${res.status}: ${body.slice(0, 200)}`);
  }
}
