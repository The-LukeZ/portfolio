import { UNSPLASH_ACCESS_KEY, UNSPLASH_APP_ID } from "$env/static/private";
import { error, json } from "@sveltejs/kit";

export async function GET(event) {
  const decision = await event.platform?.env.IMG_RATE_LIMITER.limit({ key: event.getClientAddress() });

  if (!decision?.success) {
    // Client will handle using cached images from localStorage
    return error(429, "Too Many Requests");
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
