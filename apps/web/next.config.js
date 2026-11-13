/** @type {import('next').NextConfig} */
const path = require("path");
// Next only reads apps/web/.env*, but the project's single .env lives at the root.
const { patchNextConfig } = require("./lib/root-env");

const nextConfig = {
  outputFileTracingRoot: path.join(__dirname, "../.."),
  transpilePackages: ["@pinguin/shared", "@pinguin/ui"],
  allowedDevOrigins: [process.env.NEXT_PUBLIC_DEV_ORIGIN].filter(Boolean),
  images: {
    // AVIF first, WebP fallback: dashboard avatars and icons are small but
    // numerous, and Discord only serves PNG/WebP today.
    formats: ["image/avif", "image/webp"],
    // 32/64px Discord sizes are only requested for tiny avatars.
    deviceSizes: [64, 96, 128, 256, 384, 640, 750, 828, 1080, 1200, 1920],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.discordapp.com",
        pathname: "/**",
      },
      // Media hosts that appear in embeds and music thumbnails; user-supplied
      // URLs elsewhere render with `unoptimized` so they never reach the proxy.
      { protocol: "https", hostname: "i.ytimg.com", pathname: "/**" },
      { protocol: "https", hostname: "media.discordapp.net", pathname: "/**" },
    ],
  },
  experimental: {
    optimizePackageImports: ["lucide-react", "motion"],
  },
  serverExternalPackages: ["pino", "pino-roll", "thread-stream"],
  async headers() {
    // The dashboard renders Tailwind and inline styles from Next, so a strict
    // script-src without 'unsafe-inline' would break hydration. Ship the policy
    // in report-only mode first: violations are reported without blocking, and
    // the policy can be flipped to `Content-Security-Policy` once clean.
    const isDev = process.env.NODE_ENV !== "production";
    const connectSrc = [
      "'self'",
      process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000",
      "https://cdn.discordapp.com",
    ].join(" ");

    const csp = [
      "default-src 'self'",
      `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob: https://cdn.discordapp.com https://images.unsplash.com",
      `connect-src ${connectSrc}`,
      "font-src 'self' data:",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
    ].join("; ");

    return [
      {
        source: "/:path*",
        headers: [
          { key: "Content-Security-Policy-Report-Only", value: csp },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000"}/api/:path*`,
      },
      {
        source: "/dashboard/overview",
        destination: "/dashboard",
      },
      {
        source: "/dashboard",
        destination: "/",
      },
      {
        source: "/dashboard/:path*",
        destination: "/:path*",
      },
    ];
  },
};

// Without this, `next start` sees no NEXT_PUBLIC_* / NEXT_PUBLIC_API_URL and the dashboard
// has no API address (the setup assistant writes those keys to the root .env).
module.exports = patchNextConfig(nextConfig);
