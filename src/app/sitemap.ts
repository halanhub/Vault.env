import type { MetadataRoute } from "next";
import { blogPosts } from "@/content/blog/posts";

/**
 * Public URLs only (no auth shell). Requires NEXT_PUBLIC_SITE_URL in production for correct absolute URLs.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? "http://localhost:3000";
  const now = new Date();

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: base,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${base}/blog`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${base}/contact`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${base}/privacy`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.5,
    },
    {
      url: `${base}/terms`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.5,
    },
  ];

  const blogEntries: MetadataRoute.Sitemap = blogPosts.map((post) => {
    const d = new Date(`${post.modified}T12:00:00.000Z`);
    return {
      url: `${base}/blog/${post.slug}`,
      lastModified: d,
      changeFrequency: "monthly" as const,
      priority: 0.75,
    };
  });

  return [...staticPages, ...blogEntries];
}
