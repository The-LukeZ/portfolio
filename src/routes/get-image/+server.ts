import { env } from "$env/dynamic/private";
import { UNSPLASH_ACCESS_KEY, UNSPLASH_APP_ID } from "$env/static/private";
import { error, json } from "@sveltejs/kit";
import jwt from "jsonwebtoken";

function verifyToken(token: string): boolean {
  try {
    const decoded = jwt.verify(token, env.JWT_SECRET, {
      algorithms: ["HS512"],
      audience: "lukez-portfolio",
      issuer: "lukez-portfolio",
      subject: "img-access",
    });
    return !!decoded;
  } catch (err) {
    return false; // We just assume invalid token on any error
  }
}

export async function GET(event) {
  const decision = await event.platform?.env.IMG_RATE_LIMITER.limit({ key: event.getClientAddress() }); // Even though we configured 1 request/minute, it is somehow using 2

  if (!decision?.success) {
    // Client will handle using cached images from localStorage, if not, they get no image
    return error(429, "Too Many Requests");
  }

  const token = event.cookies.get("img_token");
  if (!token) {
    return error(401, "Unauthorized (no token)");
  }

  const isValid = verifyToken(token);
  if (!isValid) {
    return error(401, "Unauthorized (invalid token)");
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

  const unsplashRes = await getRandomUnsplashImage(orientation, event.platform?.env);
  if (unsplashRes.type === "error") {
    return json({
      type: "error",
      message: "Failed to fetch image from Unsplash",
    });
  }

  if (unsplashRes.cache) {
    event.setHeaders({
      "X-Image-Source": "cache",
      "X-Cache-Status": "HIT",
    });
  } else {
    event.setHeaders({
      "X-Image-Source": "unsplash",
      "X-Cache-Status": "MISS",
    });
  }

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
  env?: Env,
): Promise<{ type: "error"; image?: never } | { type: "success"; image: UnsplashImage; cache?: true }> {
  const cacheKey = `unsplash_image_${orientation}`;

  // Check cache first - only fetch once per minute
  const cachedImg = await env?.UNSPLASH_CACHE.get<UnsplashImage>(cacheKey, "json");
  if (cachedImg) {
    try {
      return { type: "success", image: cachedImg, cache: true };
    } catch {
      // Cache corrupted, continue to fetch fresh
    }
  }
  if (!env) {
    console.error("No env available to access Unsplash cache!");
  }

  // Cache miss - fetch from Unsplash API
  const url = new URL("https://api.unsplash.com/photos/random");
  url.searchParams.set("content_filter", "high");
  url.searchParams.set("orientation", orientation);
  url.searchParams.set("query", randomSearchTerm());

  const res = await fetch(url.toString(), {
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

  // Cache the result for 1 minute
  await env?.UNSPLASH_CACHE.put(cacheKey, JSON.stringify(data), {
    expirationTtl: 60, // 1 minute
  });
  if (!env) {
    console.error("No env available to cache Unsplash image!");
  }

  return { type: "success", image: data };
}
