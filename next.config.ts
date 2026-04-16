import type { NextConfig } from "next";

const securityHeaders = [
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
  },
];

const nextConfig: NextConfig = {
  transpilePackages: ["@vaultenv/crypto"],
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
  /**
   * Dev-only: Next.js blocks cross-origin requests to `/_next/*` (including the
   * HMR WebSocket) unless the browser's origin host matches this list.
   * Without it, opening the app via a LAN IP (e.g. http://192.168.1.221:3000)
   * causes `WebSocket connection to ws://192.168.../_next/webpack-hmr` to fail.
   * @see https://nextjs.org/docs/app/api-reference/config/next-config-js/allowedDevOrigins
   */
  allowedDevOrigins: ["192.168.*.*", "10.*.*.*", "172.*.*.*"],
};

export default nextConfig;
