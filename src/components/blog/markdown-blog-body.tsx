import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Components } from "react-markdown";

const linkColor = "#2563eb";

const prose: Components = {
  h1: ({ children }) => (
    <h1
      style={{
        margin: "0 0 16px",
        fontSize: "clamp(28px, 4vw, 40px)",
        fontWeight: 900,
        letterSpacing: "-0.04em",
        lineHeight: 1.15,
        color: "#1A1A1A",
      }}
    >
      {children}
    </h1>
  ),
  h2: ({ children }) => (
    <h2
      style={{
        margin: "40px 0 14px",
        fontSize: 22,
        fontWeight: 900,
        letterSpacing: "-0.03em",
        lineHeight: 1.25,
        color: "#1A1A1A",
        borderBottom: "2px solid #e5e7eb",
        paddingBottom: 8,
      }}
    >
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3
      style={{
        margin: "28px 0 10px",
        fontSize: 17,
        fontWeight: 800,
        letterSpacing: "-0.02em",
        color: "#374151",
      }}
    >
      {children}
    </h3>
  ),
  p: ({ children }) => (
    <p style={{ margin: "0 0 16px", fontSize: 16, lineHeight: 1.75, color: "#374151" }}>{children}</p>
  ),
  ul: ({ children }) => (
    <ul
      style={{
        margin: "0 0 20px",
        paddingLeft: 22,
        fontSize: 16,
        lineHeight: 1.75,
        color: "#374151",
      }}
    >
      {children}
    </ul>
  ),
  ol: ({ children }) => (
    <ol
      style={{
        margin: "0 0 20px",
        paddingLeft: 22,
        fontSize: 16,
        lineHeight: 1.75,
        color: "#374151",
      }}
    >
      {children}
    </ol>
  ),
  li: ({ children }) => <li style={{ marginBottom: 8 }}>{children}</li>,
  strong: ({ children }) => <strong style={{ color: "#1A1A1A", fontWeight: 800 }}>{children}</strong>,
  hr: () => <hr style={{ border: "none", borderTop: "2px solid #e5e7eb", margin: "32px 0" }} />,
  a: ({ href, children }) => {
    if (href?.startsWith("/")) {
      return (
        <Link href={href} style={{ color: linkColor, fontWeight: 700, textDecoration: "underline" }}>
          {children}
        </Link>
      );
    }
    return (
      <a href={href} style={{ color: linkColor, fontWeight: 600 }} rel="noopener noreferrer" target="_blank">
        {children}
      </a>
    );
  },
  pre: ({ children }) => (
    <pre
      style={{
        margin: "20px 0",
        padding: "16px 18px",
        overflow: "auto",
        borderRadius: 14,
        border: "2px solid #000",
        backgroundColor: "#1A1A1A",
        color: "#e5e7eb",
        fontFamily: "var(--font-geist-mono), ui-monospace, monospace",
        fontSize: 14,
        lineHeight: 1.55,
        boxShadow: "4px 4px 0 0 #000",
      }}
    >
      {children}
    </pre>
  ),
  code: ({ className, children }) => {
    const inline = !className;
    if (inline) {
      return (
        <code
          style={{
            fontFamily: "var(--font-geist-mono), ui-monospace, monospace",
            fontSize: "0.9em",
            padding: "2px 6px",
            borderRadius: 6,
            border: "1px solid #e5e7eb",
            backgroundColor: "#f3f4f6",
            color: "#1f2937",
          }}
        >
          {children}
        </code>
      );
    }
    return (
      <code className={className} style={{ fontFamily: "inherit", fontSize: "inherit", background: "none" }}>
        {children}
      </code>
    );
  },
  blockquote: ({ children }) => (
    <blockquote
      style={{
        margin: "20px 0",
        padding: "16px 20px",
        borderLeft: "4px solid #C1F0C1",
        backgroundColor: "#f9fafb",
        borderRadius: "0 12px 12px 0",
        fontSize: 15,
        color: "#4b5563",
      }}
    >
      {children}
    </blockquote>
  ),
};

export function MarkdownBlogBody({ content }: { content: string }) {
  return (
    <div className="markdown-blog">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={prose}>
        {content}
      </ReactMarkdown>
    </div>
  );
}
