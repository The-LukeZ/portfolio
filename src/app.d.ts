// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
  namespace App {
    // interface Error {}
    // interface Locals {}
    // interface PageData {}
    // interface PageState {}
    interface Platform {
      env: Env;
      cf: CfProperties;
      ctx: ExecutionContext;
    }
  }

  type CookieUnsplashImage = {
    /**
     * The URL of the image.
     */
    url: string;
    /**
     * The url to the image page on Unsplash.
     */
    htmlUrl: string;
    /**
     * The author of the image.
     */
    authorName: string;
    /**
     * The author's Unsplash profile URL.
     */
    authorProfileUrl: string;
  };

  type UnsplashImage = {
    id: string;
    created_at: string;
    updated_at: string;
    width: number;
    height: number;
    color: string;
    blur_hash: string;
    downloads: number;
    description: string | null;
    exif: UnsplashExifData | null;
    location: {
      name: string | null;
      city: string | null;
      country: string | null;
      position: {
        latitude: number;
        longitude: number;
      } | null;
    } | null;
    current_user_collections: Array<UnsplashUserCollection>;
    urls: {
      raw: string;
      full: string;
      regular: string;
      small: string;
      thumb: string;
    };
    links: {
      self: string;
      html: string;
      download: string;
      download_location: string;
    };
    user: UnsplashUser;
  };

  type UnsplashUser = {
    id: string;
    updated_at: string;
    username: string;
    name: string;
    portfolio_url: string | null;
    bio: string;
    location: string;
    total_collections: number;
    instagram_username: string | null;
    twitter_username: string | null;
    links: {
      self: string;
      html: string;
      photos: string;
      portfolio: string;
    };
  };

  type UnsplashUserCollection = {
    id: number;
    title: string;
    published_at: string;
    last_collected_at: string;
    updated_at: string;
    cover_photo: unknown;
    user: unknown; // can be null? wtf Unsplash docs
  };

  type UnsplashExifData = {
    make: string | null;
    model: string | null;
    exposure_time: string | null;
    aperture: string | null;
    focal_length: string | null;
    iso: number | null;
  };

  type GetImageRes =
    | {
        type: "error";
        message: string;
      }
    | {
        type: "success";
        image: UnsplashImage;
      }
    | {
        type: "ratelimit";
        image: CookieUnsplashImage;
      };
}

export {};
