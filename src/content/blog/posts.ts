export interface BlogPost {
  slug: string;
  /** Lower = higher on index when dates tie */
  sortOrder: number;
  /** `<title>` and H1 source of truth for listings */
  title: string;
  metaDescription: string;
  excerpt: string;
  /** schema.org Article headline */
  headline: string;
  published: string;
  modified: string;
  readTimeMinutes: number;
  keywords: string[];
  openGraphTitle: string;
  openGraphDescription: string;
}

export const blogPosts: BlogPost[] = [
  {
    slug: "secure-env-files-api-keys",
    sortOrder: 0,
    title: "Securing .env Files, Dotenv & API Keys  -  Developer Guide | Vault.env",
    metaDescription:
      "Learn how .env files, dotenv, and API keys fit together - and how to approach env protection with encryption and zero-knowledge secret management.",
    excerpt:
      "A practical guide to env protection, why API keys leak, how dotenv fits in, and what zero-knowledge means for developers.",
    headline: "Securing .env files, dotenv workflows, and API keys: a practical guide",
    published: "2026-04-16",
    modified: "2026-04-16",
    readTimeMinutes: 8,
    keywords: [
      ".env",
      "dotenv",
      "env file",
      "environment variables",
      "env protection",
      "api keys",
      "secure api keys",
      "secrets management",
      "zero knowledge",
      "encrypted env",
      "developer secrets",
    ],
    openGraphTitle: "Securing .env files, dotenv workflows, and API keys",
    openGraphDescription:
      "Practical env protection: .env files, dotenv, API keys, and zero-knowledge encryption for developers.",
  },
  {
    slug: "never-commit-env-git-api-keys",
    sortOrder: 1,
    title: "Never Commit Your .env: Git, Leaks & API Key Rotation | Vault.env",
    metaDescription:
      "Why committing a .env file is dangerous, how API keys end up in public repos, and a practical checklist for rotation, gitignore, and env protection.",
    excerpt:
      "How .env files leak through git, what to do the moment an API key is exposed, and habits that keep environment variables out of history.",
    headline: "Never commit your .env: git, leaks, and API key rotation",
    published: "2026-04-16",
    modified: "2026-04-16",
    readTimeMinutes: 6,
    keywords: [
      ".env gitignore",
      "commit env file",
      "api keys leaked",
      "rotate api keys",
      "git secrets",
      "env file security",
      "github api key",
      "environment variables git",
    ],
    openGraphTitle: "Never commit your .env  -  git, leaks, and API key rotation",
    openGraphDescription:
      "Protect your .env from git: why API keys in repos are a top risk and how to recover when secrets slip out.",
  },
  {
    slug: "api-keys-ci-cd-github-actions",
    sortOrder: 2,
    title: "API Keys in CI/CD & GitHub Actions: Env Files vs Secrets | Vault.env",
    metaDescription:
      "Use API keys safely in CI/CD: GitHub Actions secrets, environment variables per branch, and why pasting keys into workflows breaks env protection.",
    excerpt:
      "A developer-focused look at GitHub Actions, repository secrets, OIDC, and how to avoid logging environment variables or .env contents in pipelines.",
    headline: "API keys in CI/CD: GitHub Actions, secrets, and env files",
    published: "2026-04-16",
    modified: "2026-04-16",
    readTimeMinutes: 7,
    keywords: [
      "github actions secrets",
      "api keys ci cd",
      "environment variables github actions",
      "ci env file",
      "deployment secrets",
      "github environment variables",
      "api keys in pipeline",
    ],
    openGraphTitle: "API keys in CI/CD and GitHub Actions",
    openGraphDescription:
      "Keep API keys out of logs: how to wire GitHub Actions and other CI systems without exposing your .env.",
  },
  {
    slug: "zero-knowledge-secrets-explained",
    sortOrder: 3,
    title: "Zero-Knowledge Secrets: What It Means for .env & API Keys | Vault.env",
    metaDescription:
      "Zero-knowledge encryption for developer secrets: who can read your API keys, what never leaves your device, and how it differs from trusting a plain env file host.",
    excerpt:
      "Plain English on zero-knowledge vaults, client-side encryption, and the questions to ask any tool that stores your environment variables or API keys.",
    headline: "Zero-knowledge secrets storage: what developers should know",
    published: "2026-04-16",
    modified: "2026-04-16",
    readTimeMinutes: 6,
    keywords: [
      "zero knowledge encryption",
      "client side encryption secrets",
      "api keys encryption",
      "secure env storage",
      "secrets manager developers",
      "end to end encrypted secrets",
    ],
    openGraphTitle: "Zero-knowledge secrets for developers",
    openGraphDescription:
      "Understand zero-knowledge design for API keys and .env data before you pick a secrets workflow.",
  },
];

export function getBlogPost(slug: string): BlogPost | undefined {
  return blogPosts.find((p) => p.slug === slug);
}

export function getAllBlogPostsSorted(): BlogPost[] {
  return [...blogPosts].sort((a, b) => {
    if (a.published !== b.published) return a.published < b.published ? 1 : -1;
    return a.sortOrder - b.sortOrder;
  });
}

export function formatPostDate(isoDate: string): string {
  const d = new Date(`${isoDate}T12:00:00.000Z`);
  return d.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}
