import type { NextConfig } from "next";
import withSerwistInit from "@serwist/next";

const withSerwist = withSerwistInit({
  swSrc: "app/sw.ts",
  swDest: "public/sw.js",
  disable: process.env.NODE_ENV === "development",
  // Exclude manifest files from precaching - let browser handle them natively
  additionalPrecacheEntries: [],
  exclude: [
    /^manifest.*\.json$/,
    /^manifest.*\.webmanifest$/,
  ],
});

const nextConfig: NextConfig = {
  /* config options here */
};

export default withSerwist(nextConfig);
