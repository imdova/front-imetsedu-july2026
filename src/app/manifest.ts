import type { MetadataRoute } from "next";

import { SITE_NAME } from "@/lib/seo";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: SITE_NAME,
    short_name: "IMETS",
    description: "Professional, accredited, bilingual (EN/AR) business courses.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#1111D4",
    icons: [
      { src: "/icon", sizes: "512x512", type: "image/png" },
      { src: "/apple-icon", sizes: "180x180", type: "image/png" },
    ],
  };
}
