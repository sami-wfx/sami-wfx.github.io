import type { NextConfig } from "next";

// `STATIC_EXPORT=1 next build` produces a fully static site in ./out
// (used for GitHub Pages). A normal `next build` / Vercel deploy is unchanged.
const nextConfig: NextConfig = {
  ...(process.env.STATIC_EXPORT ? { output: "export" as const } : {}),
};

export default nextConfig;
