import type { NextConfig } from "next";

/**
 * The Markdown vault is read while rendering the workspace routes only.
 * Keep it out of `/api/omnibot`, static assets, robots/sitemap and the
 * service worker so those bundles stay small.
 */
const VAULT_FILES = ["./curriculum_vault/**/*.md"];
const VAULT_ROUTES = [
  "/",
  "/zadania",
  "/sciezka",
  "/laboratorium",
  "/powtorki",
  "/sprawdzian",
  "/omnikumpel",
  "/lekcja/[lessonId]",
];

const config: NextConfig = {
  outputFileTracingIncludes: Object.fromEntries(
    VAULT_ROUTES.map((route) => [route, VAULT_FILES]),
  ),
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
      {
        source: "/sw.js",
        headers: [
          {
            key: "Cache-Control",
            value: "no-cache, no-store, must-revalidate",
          },
          {
            key: "Content-Type",
            value: "application/javascript; charset=utf-8",
          },
          { key: "X-Content-Type-Options", value: "nosniff" },
        ],
      },
    ];
  },
};
export default config;
