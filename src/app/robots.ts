import type { MetadataRoute } from "next";

/**
 * Served at /robots.txt. Blocks app shells and APIs; allows marketing + blog.
 * Optional: /llms.txt and /.well-known/security.txt live under public/ for crawlers and disclosures.
 */
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
