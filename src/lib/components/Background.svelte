<script lang="ts">
  import { browser } from "$app/environment";
  import { defaultUnsplashImage } from "$lib/index.js";
  import { scrollY } from "svelte/reactivity/window";

  let {
    imageData = $bindable(null),
    usingFallback = $bindable(false),
  }: {
    imageData?: any;
    usingFallback?: boolean;
  } = $props();

  const BASE_BG_IMG_OPACITY = 0.4;
  let bgImage: HTMLDivElement | null = $state(null);
  let blurCanvas: HTMLCanvasElement | null = $state(null);
  let imageLoaded = $state(false);

  let screenDimensions = $state<{
    width: number | null;
    height: number | null;
  }>({
    width: null,
    height: null,
  });

  function decodeBlurHash(
    hash: string,
    width: number,
    height: number,
    punch: number = 1,
  ): Uint8ClampedArray | null {
    const digitCharacters =
      "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz#$%*+,-.:;=?@[]^_{|}~";

    const decode83 = (str: string): number => {
      let value = 0;
      for (let i = 0; i < str.length; i++) {
        value = value * 83 + digitCharacters.indexOf(str[i]);
      }
      return value;
    };

    const sRGBToLinear = (value: number): number => {
      const v = value / 255;
      return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    };

    const linearToSRGB = (value: number): number => {
      const v = Math.max(0, Math.min(1, value));
      return v <= 0.0031308
        ? Math.round(v * 12.92 * 255 + 0.5)
        : Math.round((1.055 * Math.pow(v, 1 / 2.4) - 0.055) * 255 + 0.5);
    };

    const signPow = (base: number, exp: number): number => Math.sign(base) * Math.pow(Math.abs(base), exp);

    const decodeDC = (value: number): [number, number, number] => {
      const intR = value >> 16;
      const intG = (value >> 8) & 255;
      const intB = value & 255;
      return [sRGBToLinear(intR), sRGBToLinear(intG), sRGBToLinear(intB)];
    };

    const decodeAC = (value: number, maxVal: number): [number, number, number] => {
      const quantR = Math.floor(value / (19 * 19));
      const quantG = Math.floor(value / 19) % 19;
      const quantB = value % 19;
      return [
        signPow((quantR - 9) / 9, 2.0) * maxVal,
        signPow((quantG - 9) / 9, 2.0) * maxVal,
        signPow((quantB - 9) / 9, 2.0) * maxVal,
      ];
    };

    if (!hash || hash.length < 6) return null;

    const sizeFlag = decode83(hash[0]);
    const numY = Math.floor(sizeFlag / 9) + 1;
    const numX = (sizeFlag % 9) + 1;

    const quantisedMaxVal = decode83(hash[1]);
    const maxVal = (quantisedMaxVal + 1) / 166;

    const colors: [number, number, number][] = new Array(numX * numY);
    colors[0] = decodeDC(decode83(hash.substring(2, 6)));

    for (let i = 1; i < numX * numY; i++) {
      colors[i] = decodeAC(decode83(hash.substring(4 + i * 2, 6 + i * 2)), maxVal * punch);
    }

    const pixels = new Uint8ClampedArray(width * height * 4);

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        let r = 0,
          g = 0,
          b = 0;
        for (let j = 0; j < numY; j++) {
          for (let i = 0; i < numX; i++) {
            const basis = Math.cos((Math.PI * x * i) / width) * Math.cos((Math.PI * y * j) / height);
            const color = colors[i + j * numX];
            r += color[0] * basis;
            g += color[1] * basis;
            b += color[2] * basis;
          }
        }
        const idx = 4 * (x + y * width);
        pixels[idx] = linearToSRGB(r);
        pixels[idx + 1] = linearToSRGB(g);
        pixels[idx + 2] = linearToSRGB(b);
        pixels[idx + 3] = 255;
      }
    }
    return pixels;
  }

  function renderBlurHash(canvas: HTMLCanvasElement, hash: string, width: number, height: number) {
    const pixels = decodeBlurHash(hash, width, height);
    if (!pixels) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = width;
    canvas.height = height;
    const imgData = ctx.createImageData(width, height);
    imgData.data.set(pixels);
    ctx.putImageData(imgData, 0, 0);
  }

  const IMAGE_CACHE_KEY = "cached_background_images";
  const MAX_CACHED_IMAGES = 10;

  interface CachedImage {
    id: string;
    url: string;
    authorName: string;
    authorProfileUrl: string;
    htmlUrl: string;
    blurHash: string;
    timestamp: string;
  }

  function getCachedImages(): CachedImage[] {
    try {
      const cached = localStorage.getItem(IMAGE_CACHE_KEY);
      if (!cached) return [];
      return JSON.parse(cached) as CachedImage[];
    } catch {
      return [];
    }
  }

  function cacheImage(image: CachedImage) {
    try {
      const cached = getCachedImages();
      if (cached.some((img) => img.id === image.id)) return;

      cached.push(image);
      while (cached.length > MAX_CACHED_IMAGES) {
        cached.shift();
      }
      localStorage.setItem(IMAGE_CACHE_KEY, JSON.stringify(cached));
    } catch (e) {
      console.warn("Failed to cache image:", e);
    }
  }

  function getRandomCachedImage(): CachedImage | null {
    const cached = getCachedImages();
    if (cached.length === 0) return null;
    return cached[Math.floor(Math.random() * cached.length)];
  }

  function useFallbackImage() {
    const img = new Image();
    img.onload = () => {
      imageLoaded = true;
      if (bgImage) {
        bgImage.style.backgroundImage = `url(${defaultUnsplashImage.url})`;
      }
    };
    img.src = defaultUnsplashImage.url;
    usingFallback = true;
  }

  function useCachedImage(cached: CachedImage) {
    imageData = {
      url: cached.url,
      authorName: cached.authorName,
      authorProfileUrl: cached.authorProfileUrl,
      htmlUrl: cached.htmlUrl,
    };

    if (blurCanvas && cached.blurHash) {
      renderBlurHash(blurCanvas, cached.blurHash, 32, 32);
    }

    const img = new Image();
    img.onload = () => {
      imageLoaded = true;
      if (bgImage) {
        bgImage.style.backgroundImage = `url(${cached.url})`;
      }
    };
    img.onerror = () => {
      console.warn("Failed to load cached image, using fallback");
      useFallbackImage();
    };
    img.src = cached.url;
  }

  async function fetchBackgroundImage(width: number, height: number) {
    try {
      const res = await fetch(`/get-image?dim=${width}x${height}`, {
        credentials: "same-origin",
      });

      if (!res.ok) {
        if (res.status === 429) {
          console.warn("Rate limited, using cached image");
          const cached = getRandomCachedImage();
          if (cached) {
            useCachedImage(cached);
            return;
          }
        }
        console.warn("Image API returned error, using fallback");
        useFallbackImage();
        return;
      }

      const data = await res.json<GetImageRes>();

      if (data.type === "success" && blurCanvas) {
        imageData = {
          url: data.image.urls.full,
          authorName: data.image.user.name,
          authorProfileUrl: `https://unsplash.com/@${data.image.user.username}?utm_source=lukez-portfolio&utm_medium=referral`,
          htmlUrl: `${data.image.links.html}?utm_source=lukez-portfolio&utm_medium=referral`,
        };

        cacheImage({
          id: data.image.id,
          url: data.image.urls.full,
          authorName: data.image.user.name,
          authorProfileUrl: `https://unsplash.com/@${data.image.user.username}?utm_source=lukez-portfolio&utm_medium=referral`,
          htmlUrl: `${data.image.links.html}?utm_source=lukez-portfolio&utm_medium=referral`,
          blurHash: data.image.blur_hash,
          timestamp: new Date().toISOString(),
        });

        renderBlurHash(blurCanvas, data.image.blur_hash, 32, 32);

        const img = new Image();
        img.onload = () => {
          imageLoaded = true;
          if (bgImage) {
            bgImage.style.backgroundImage = `url(${data.image.urls.full})`;
          }
        };
        img.onerror = () => {
          console.warn("Failed to load Unsplash image, using fallback");
          useFallbackImage();
        };
        img.src = data.image.urls.full;
      } else if (data.type === "error") {
        console.warn("Image API returned error response, using fallback");
        const cached = getRandomCachedImage();
        if (cached) {
          useCachedImage(cached);
        } else {
          useFallbackImage();
        }
      }
    } catch (e) {
      console.error("Failed to fetch background image:", e);
      const cached = getRandomCachedImage();
      if (cached) {
        useCachedImage(cached);
      } else {
        useFallbackImage();
      }
    }
  }

  $effect(() => {
    if (browser && screenDimensions.width && screenDimensions.height && !imageData && !usingFallback) {
      fetchBackgroundImage(screenDimensions.width, screenDimensions.height);
    }
  });

  $effect(() => {
    const heroSection = document.getElementById("home");
    if (bgImage && heroSection && scrollY.current !== undefined) {
      const heroBottom = heroSection.offsetTop + heroSection.offsetHeight - 70;
      const opacity =
        BASE_BG_IMG_OPACITY -
        Math.min(BASE_BG_IMG_OPACITY, (scrollY.current / heroBottom) * BASE_BG_IMG_OPACITY);
      bgImage.style.opacity = opacity.toString();
    }

    return () => {
      if (bgImage) {
        bgImage.style.opacity = BASE_BG_IMG_OPACITY.toString();
      }
    };
  });
</script>

<svelte:window
  {@attach (w) => {
    screenDimensions = {
      width: w.innerWidth,
      height: w.innerHeight,
    };
  }}
/>

<div id="bg-blur" class:loaded={imageLoaded}>
  <canvas bind:this={blurCanvas}></canvas>
</div>
<div
  id="bg-image"
  bind:this={bgImage}
  class:loaded={imageLoaded}
  style="opacity: {BASE_BG_IMG_OPACITY};"
></div>

<style>
  #bg-blur {
    position: fixed;
    inset: 0;
    width: 100%;
    height: 100%;
    z-index: -2;
    opacity: 0.4;
    transition: opacity 0.5s ease-in-out;
  }

  #bg-blur canvas {
    width: 100%;
    height: 100%;
    object-fit: cover;
    filter: blur(20px);
    transform: scale(1.1);
  }

  #bg-blur.loaded {
    opacity: 0;
  }

  #bg-image {
    position: fixed;
    inset: 0;
    width: 100%;
    height: 100%;
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
    object-fit: cover;
    backdrop-filter: blur(0.75vh);
    filter: blur(0.75vh);
    box-shadow: 0 0 200px rgba(0, 0, 0, 0.99) inset;
    z-index: -1;
    opacity: 0 !important;
    transition: opacity 0.5s ease-in-out;
  }

  #bg-image.loaded {
    opacity: 0.4 !important;
  }
</style>
