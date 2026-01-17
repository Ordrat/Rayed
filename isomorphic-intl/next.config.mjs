import createNextIntlPlugin from "next-intl/plugin";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const withNextIntl = createNextIntlPlugin();

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // Enable Turbopack filesystem caching for faster dev server
    turbopackFileSystemCacheForDev: true,
    // Optimize barrel file imports for heavy packages
    optimizePackageImports: [
      "react-icons",
      "react-icons/fa",
      "react-icons/fa6",
      "react-icons/pi",
      "react-icons/bi",
      "react-icons/tb",
      "react-icons/ri",
      "react-icons/io",
      "react-icons/io5",
      "react-icons/hi",
      "react-icons/hi2",
      "react-icons/md",
      "react-icons/bs",
      "react-icons/lu",
      "lodash",
      "recharts",
      "rizzui",
      "@headlessui/react",
      "@tanstack/react-table",
      "motion",
      "dayjs",
      "date-fns",
    ],
  },
  async rewrites() {
    return {
      beforeFiles: [
        {
          source: "/firebase-messaging-sw.js",
          destination: "/firebase-messaging-sw.js",
          locale: false,
        },
      ],
    };
  },
  async headers() {
    return [
      {
        source: "/firebase-messaging-sw.js",
        headers: [
          {
            key: "Service-Worker-Allowed",
            value: "/",
          },
          {
            key: "Content-Type",
            value: "application/javascript; charset=utf-8",
          },
          {
            key: "Cache-Control",
            value: "no-cache, no-store, must-revalidate",
          },
        ],
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "randomuser.me",
        pathname: "/api/portraits/**",
      },
      {
        protocol: "https",
        hostname: "cloudflare-ipfs.com",
        pathname: "/ipfs/**",
      },
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com",
        pathname: "/u/**",
      },
      {
        protocol: "https",
        hostname: "picsum.photos",
      },
      {
        protocol: "https",
        hostname: "flagcdn.com",
      },
      {
        protocol: "https",
        hostname: "utfs.io",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "s3.amazonaws.com",
        pathname: "/redqteam.com/isomorphic-furyroad/public/**",
      },
      {
        protocol: "https",
        hostname: "isomorphic-furyroad.s3.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "cdn.ordrat.com",
      },
    ],
  },
  reactStrictMode: true,
  transpilePackages: ["core"],
};

export default withNextIntl(nextConfig);
