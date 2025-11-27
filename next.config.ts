import type { NextConfig } from "next";
import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  // Disable aggressive front-end caching to fix redirects and auth flows
  cacheOnFrontEndNav: false,
  aggressiveFrontEndNavCaching: false,
  reloadOnOnline: true,
  extendDefaultRuntimeCaching: false,
  workboxOptions: {
    disableDevLogs: true,
    skipWaiting: true, // Force new SW to take over immediately
    clientsClaim: true, // Force new SW to control open pages immediately
    exclude: [
      // Exclude the middleware file from the service worker
      /middleware-manifest\.json$/,
      /middleware-build-manifest\.js$/,
      // Exclude all next.js internal files that might conflict
      /_next\/server\/middleware-manifest\.json$/,
    ],
    runtimeCaching: [
      {
        // NetworkOnly for auth related paths and query parameters
        // This prevents caching of auth callbacks which can cause redirect loops
        urlPattern: ({ url }) => 
          url.pathname.includes('sign-in') || 
          url.pathname.includes('sign-up') ||
          url.pathname.includes('clerk') ||
          url.searchParams.has('__clerk_db_jwt') ||
          url.searchParams.has('__clerk_handshake') ||
          url.searchParams.has('code') ||
          url.searchParams.has('state') ||
          url.searchParams.has('redirect_url'),
        handler: "NetworkOnly",
      },
      {
        // NetworkFirst for all navigation requests to handle redirects correctly
        // and provide offline access to visited pages.
        urlPattern: ({ request }) => request.mode === "navigate",
        handler: "NetworkFirst",
        options: {
          cacheName: "pages",
          expiration: {
            maxEntries: 32,
            maxAgeSeconds: 24 * 60 * 60, // 24 hours
          },
          networkTimeoutSeconds: 5, // Fallback to cache after 5 seconds
        },
      },
      {
        // StaleWhileRevalidate for static assets (scripts, styles)
        urlPattern: ({ request }) =>
          request.destination === "style" ||
          request.destination === "script" ||
          request.destination === "worker",
        handler: "StaleWhileRevalidate",
        options: {
          cacheName: "static-resources",
          expiration: {
            maxEntries: 32,
            maxAgeSeconds: 24 * 60 * 60, // 24 hours
          },
        },
      },
      {
        // StaleWhileRevalidate for images
        urlPattern: ({ request }) => request.destination === "image",
        handler: "StaleWhileRevalidate",
        options: {
          cacheName: "images",
          expiration: {
            maxEntries: 64,
            maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
          },
        },
      },
      {
        // NetworkOnly for API routes to avoid caching sensitive data
        urlPattern: ({ url }) => url.pathname.startsWith("/api/"),
        handler: "NetworkOnly",
      },
      // Ensure cross-origin requests are not cached by default strategies
      // unless explicitly defined. Workbox defaults to handling only same-origin
      // for most strategies unless configured otherwise.
    ],
  },
});

const nextConfig: NextConfig = {
  /* config options here */
};

export default withPWA(nextConfig);
