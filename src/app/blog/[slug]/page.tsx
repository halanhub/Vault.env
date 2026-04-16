import { readFile } from "node:fs/promises";
import path from "node:path";
import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BlogMarketingHeader } from "@/components/blog/blog-marketing-header";
import { BlogStaticFooter } from "@/components/blog/blog-static-footer";
import { MarkdownBlogBody } from "@/components/blog/markdown-blog-body";
import {
  blogPosts,
  formatPostDate,
  getBlogPost,
} from "@/content/blog/posts";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return blogPosts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) return {};
  return {
    title: post.title,
    description: post.metaDescription,
    keywords: post.keywords,
    openGraph: {
      title: post.openGraphTitle,
      description: post.openGraphDescription,
      type: "article",
      publishedTime: `${post.published}T12:00:00.000Z`,
      modifiedTime: `${post.modified}T12:00:00.000Z`,
    },
    alternates: {
      canonical: `/blog/${post.slug}`,
    },
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) notFound();

  let content: string;
  try {
    const filePath = path.join(process.cwd(), "src/content/blog", `${slug}.md`);
    content = await readFile(filePath, "utf8");
  } catch {
    notFound();
  }

  const site = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? "";
  const articlePath = `/blog/${post.slug}`;
  const articleUrl = site ? `${site}${articlePath}` : articlePath;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.headline,
    description: post.metaDescription,
    datePublished: `${post.published}T12:00:00.000Z`,
    dateModified: `${post.modified}T12:00:00.000Z`,
    author: {
      "@type": "Organization",
      name: "Vault.env",
    },
    publisher: {
      "@type": "Organization",
      name: "Vault.env",
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": articleUrl,
    },
    url: articleUrl,
  };

  return (
    <div style={{ minHeight: "100dvh", backgroundColor: "#FDFCF0", display: "flex", flexDirection: "column" }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <BlogMarketingHeader backHref="/blog" backLabel="Blog" />

      <main
        style={{
          flex: 1,
          maxWidth: 720,
          width: "100%",
          margin: "0 auto",
          padding: "40px 28px 80px",
          boxSizing: "border-box",
        }}
      >
        <article itemScope itemType="https://schema.org/Article">
          <meta itemProp="datePublished" content={`${post.published}T12:00:00.000Z`} />
          <meta itemProp="dateModified" content={`${post.modified}T12:00:00.000Z`} />
          <p style={{ margin: "0 0 24px", fontSize: 13, fontWeight: 600, color: "#9ca3af" }}>
            <time dateTime={post.published}>{formatPostDate(post.published)}</time>
            <span style={{ marginLeft: 10 }}>·</span>
            <span style={{ marginLeft: 10 }}>About {post.readTimeMinutes} min read</span>
          </p>
          <div itemProp="articleBody">
            <MarkdownBlogBody content={content} />
          </div>
        </article>

        <div
          style={{
            marginTop: 48,
            padding: "20px 24px",
            border: "2px solid #000",
            borderRadius: 16,
            backgroundColor: "#C1F0C1",
            boxShadow: "4px 4px 0 0 #000",
          }}
        >
          <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "#1A1A1A", lineHeight: 1.5 }}>
            Try Vault.env  -  encrypted projects, CLI-friendly workflows, and a master password that never leaves your
            browser.{" "}
            <Link href="/" style={{ color: "#1e40af", fontWeight: 800 }}>
              Open the app →
            </Link>
          </p>
        </div>
      </main>

      <BlogStaticFooter />
    </div>
  );
}
