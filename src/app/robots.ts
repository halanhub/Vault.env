import type { MetadataRoute } from "next";

/** Crawlers: allow indexing of public marketing + blog. Set NEXT_PUBLIC_SITE_URL in production. */
export default function robots(): MetadataRoute.Robots {
  const base = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? "http://localhost:3000";

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/dashboard", "/profile", "/project/", "/api/"],
    },
    sitemap: `${base}/sitemap.xml`,
  };
}
