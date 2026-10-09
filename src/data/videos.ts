/* =========================================================================
   Vertical videos for the "In motion" strip on the home page.
   The strip stays hidden while this list is empty.

   1. Put the .mp4 (9:16, ideally under 15 MB) in  /public/videos/
   2. Optionally add a poster image (.jpg or .webp) with the same name
   3. Add a line below and push

   `src` can also be a full URL (for example a Cloudflare R2 link).
   ========================================================================= */

export type Video = {
  src: string;
  poster?: string;
  title: string;
  /** Slug of the product shown, to link the video to its page. */
  product?: string;
};

export const videos: Video[] = [
  // { src: "/videos/aluminum-grinder.mp4", poster: "/videos/aluminum-grinder.jpg", title: "Aluminum 4-piece grinder", product: "aluminum-4-piece-grinder-medium" },
];
