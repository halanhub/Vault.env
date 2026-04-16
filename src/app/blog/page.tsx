import Link from "next/link";
import { BookOpen } from "lucide-react";
import type { Metadata } from "next";
import { BlogMarketingHeader } from "@/components/blog/blog-marketing-header";
import { BlogStaticFooter } from "@/components/blog/blog-static-footer";
import { getAllBlogPostsSorted } from "@/content/blog/posts";

const posts = getAllBlogPostsSorted();

export const metadata: Metadata = {
  title: "Blog  -  Vault.env",
  description:
    "Guides on .env files, dotenv, API keys, env protection, and zero-knowledge secret management for developers.",
  keywords: [
    "env file blog",
    "dotenv",
    ".env",
    "api keys",
    "github actions secrets",
    "gitignore env",
    "zero knowledge secrets",
    "environment variables",
    "secrets management",
    "ci cd api keys",
  ],
  openGraph: {
    title: "Vault.env Blog",
    description: "Guides on securing .env files, API keys, and developer secrets.",
    type: "website",
  },
};

export default function BlogIndexPage() {
  return (
    <div style={{ minHeight: "100dvh", backgroundColor: "#FDFCF0", display: "flex", flexDirection: "column" }}>
      <BlogMarketingHeader backHref="/" backLabel="Back" />

      <main
        style={{
          flex: 1,
          maxWidth: 720,
          width: "100%",
          margin: "0 auto",
          padding: "48px 28px 80px",
          boxSizing: "border-box",
        }}
      >
        <div style={{ marginBottom: 12 }}>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "6px 14px",
              borderRadius: 999,
              border: "2px solid #000",
              backgroundColor: "#C1F0C1",
              fontSize: 12,
              fontWeight: 800,
              letterSpacing: "0.06em",
              boxShadow: "3px 3px 0 0 #000",
            }}
          >
            <BookOpen size={14} strokeWidth={2.5} aria-hidden />
            BLOG
          </span>
        </div>

        <h1
          style={{
            margin: "0 0 12px",
            fontSize: "clamp(28px, 4vw, 40px)",
            fontWeight: 900,
            letterSpacing: "-0.04em",
            lineHeight: 1.1,
          }}
        >
          Articles
        </h1>
        <p style={{ margin: "0 0 40px", fontSize: 15, color: "#6b7280", lineHeight: 1.5 }}>
          Long-form guides on <strong style={{ color: "#374151", fontWeight: 700 }}>.env</strong> files,{" "}
          <strong style={{ color: "#374151", fontWeight: 700 }}>dotenv</strong>,{" "}
          <strong style={{ color: "#374151", fontWeight: 700 }}>API keys</strong>, CI/CD, git hygiene, and zero-knowledge
          encryption for developers.
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {posts.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              style={{ textDecoration: "none", color: "inherit", display: "block" }}
            >
              <article
                style={{
                  padding: "24px 28px",
                  border: "2px solid #000",
                  borderRadius: 20,
                  backgroundColor: "#fff",
                  boxShadow: "6px 6px 0 0 #000",
                  transition: "transform 0.1s, box-shadow 0.1s",
                }}
              >
                <h2
                  style={{
                    margin: "0 0 10px",
                    fontSize: 20,
                    fontWeight: 900,
                    letterSpacing: "-0.03em",
                    color: "#1A1A1A",
                  }}
                >
                  {post.openGraphTitle}
                </h2>
                <p style={{ margin: 0, fontSize: 15, color: "#6b7280", lineHeight: 1.55 }}>{post.excerpt}</p>
                <span
                  style={{
                    display: "inline-block",
                    marginTop: 16,
                    fontSize: 13,
                    fontWeight: 800,
                    color: "#2563eb",
                  }}
                >
                  Read article →
                </span>
              </article>
            </Link>
          ))}
        </div>
      </main>

      <BlogStaticFooter />
    </div>
  );
}
