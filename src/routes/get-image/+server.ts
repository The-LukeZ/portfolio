import { dev } from "$app/environment";
import { ARCJET_KEY, UNSPLASH_ACCESS_KEY, UNSPLASH_APP_ID } from "$env/static/private";
import { isSpoofedBot } from "@arcjet/inspect";
import arcjet, { detectBot, shield, tokenBucket } from "@arcjet/sveltekit";
import { error, json, type Cookies } from "@sveltejs/kit";

const aj = arcjet({
  key: ARCJET_KEY,
  rules: [
    // Shield protects from common attacks e.g. SQL injection
    shield({ mode: dev ? "DRY_RUN" : "LIVE" }),
    detectBot({
      mode: dev ? "DRY_RUN" : "LIVE", // Blocks requests. Use "DRY_RUN" to log only
      allow: [], // block all bots
    }),
    tokenBucket({
      mode: dev ? "DRY_RUN" : "LIVE",
      refillRate: 1,
      interval: 300,
      capacity: 1,
    }),
  ],
  log: {
    debug: console.debug,
    info: console.info,
    warn: console.warn,
    error: console.error,
  },
});

function serializeCookieValue(value: string): CookieUnsplashImage | null {
  try {
    const parsed = JSON.parse(value);
    if (typeof parsed.url === "string" && typeof parsed.author === "string") {
      return { url: parsed.url, author: parsed.author };
    }
  } catch {
    return null;
  }
  return null;
}

function calcTotalCachedImages(cookies: Cookies): number {
  return cookies.getAll().filter((cookie) => cookie.name.startsWith("image_cache_")).length;
}

/**
 * Retrieves a random cached image from browser cookies.
 *
 * @param cookies - The cookies object containing cached image data
 * @returns A tuple containing the random image value (or null if no images found) and the total count of cached images
 *
 * @example
 * ```typescript
 * const [imageValue, totalCount] = getRandomImageFromCookies(cookies);
 * if (imageValue) {
 *   console.log(`Found image: ${imageValue} (${totalCount} total images)`);
 * }
 * ```
 */
function getRandomImageFromCookies(cookies: Cookies): [CookieUnsplashImage | null, number] {
  const imgs = cookies
    .getAll()
    .filter((cookie) => cookie.name.startsWith("image_cache_"))
    .map((c) => serializeCookieValue(c.value));
  if (imgs.length === 0) {
    return [null, 0];
  }
  const randomImg = imgs[Math.floor(Math.random() * imgs.length)];
  return [randomImg, imgs.length];
}

export async function GET(event) {
  const decision = await aj.protect(event, { requested: 1 });

  if (decision.isDenied()) {
    if (decision.reason.isRateLimit()) {
      // Return random image from cache if rate limited
      const [image] = getRandomImageFromCookies(event.cookies);
      if (image) {
        return json({
          type: "ratelimit",
          image: image,
        });
      }
      return error(429, "Too Many Requests");
    } else if (decision.reason.isBot()) {
      return error(403, "No Bots Allowed");
    } else {
      return error(403, "Forbidden");
    }
  }

  if (decision.ip.isHosting()) {
    console.log("Blocking hosting provider IP:", event.getClientAddress());
    return error(403, "Forbidden");
  }

  if (decision.results.some(isSpoofedBot)) {
    console.log("Blocking spoofed bot IP:", event.getClientAddress());
    return error(403, "Forbidden");
  }

  const dimensions = event.url.searchParams.get("dim") || "1920x1080";
  // parse dimensions
  const [widthStr, heightStr] = /\d{3,4}x\d{3,4}/i.test(dimensions)
    ? dimensions.split("x")
    : ["1920", "1080"];
  const width = parseInt(widthStr, 10);
  const height = parseInt(heightStr, 10);
  let orientation: "landscape" | "portrait" | "squarish" = "landscape";
  if (width > height) {
    orientation = "landscape";
  } else if (height > width) {
    orientation = "portrait";
  } else {
    orientation = "squarish";
  }

  const unsplashRes = await getRandomUnsplashImage(orientation);
  if (unsplashRes.type === "error") {
    return json({
      type: "error",
      message: "Failed to fetch image from Unsplash",
    });
  }

  const nextIndex = calcTotalCachedImages(event.cookies) + 1;
  event.cookies.set(
    `image_cache_${nextIndex}`,
    JSON.stringify({
      url: unsplashRes.image.urls.full,
      author: unsplashRes.image.user.portfolio_url,
    }),
    { path: "/", maxAge: 60 * 60 * 24 }, // 1 day
  );

  return json(unsplashRes);
}

/**
 * Generates a "random" search term from a predefined list of terms.
 * Some terms appear multiple times in the list, increasing their probability of being selected.
 * @returns A randomly selected search term string.
 */
function randomSearchTerm(): string {
  const terms = [
    "nature",
    "nature",
    "landscape",
    "landscape",
    "technology",
    "ocean",
    "ocean",
    "mountains",
    "mountains",
    "forest",
    "forest",
    "city",
    "space",
  ];
  return terms[Math.floor(Math.random() * terms.length)];
}

async function getRandomUnsplashImage(
  orientation: "landscape" | "portrait" | "squarish" = "landscape",
): Promise<{ type: "error"; image?: never } | { type: "success"; image: UnsplashImage }> {
  const url = new URL("https://api.unsplash.com/photos/random");
  url.searchParams.set("content_filter", "high");
  url.searchParams.set("orientation", orientation);
  url.searchParams.set("query", randomSearchTerm());

  const res = await fetch("https://api.unsplash.com/photos/random", {
    method: "GET",
    headers: {
      "Accept-Version": "v1",
      Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}`,
      "User-Agent": `PortfolioApp/1.0 (App ID: ${UNSPLASH_APP_ID})`,
    },
    signal: AbortSignal.timeout(5000),
  });

  if (!res.ok) {
    console.error("Unsplash API error:", res);
    return { type: "error" };
  }
  const data: UnsplashImage = await res.json();
  return { type: "success", image: data };
}
