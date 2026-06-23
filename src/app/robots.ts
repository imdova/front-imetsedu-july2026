import type { MetadataRoute } from "next";

import { SITE_URL } from "@/lib/seo";

// Private app areas (both the default-locale root and the /ar prefix).
const PRIVATE = ["/admin", "/staff", "/instructor", "/student", "/login", "/register", "/forgot-password", "/reset-password", "/set-password", "/accept-invitation"];

export default function robots(): MetadataRoute.Robots {
  const disallow = ["/api/", ...PRIVATE, ...PRIVATE.map((p) => `/ar${p}`)];
  return {
    rules: [{ userAgent: "*", allow: "/", disallow }],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
