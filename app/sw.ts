// Minimal service worker - just enough for PWA installability
import type { PrecacheEntry, SerwistGlobalConfig } from "serwist";
import { Serwist } from "serwist";

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: ServiceWorkerGlobalScope;

// Minimal Serwist setup - no caching, just registration
const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST || [],
  skipWaiting: true,
  clientsClaim: true,
  // No runtime caching - everything goes to network
  runtimeCaching: [],
});

serwist.addEventListeners();

// Explicitly handle manifest.json - always fetch from network
self.addEventListener("fetch", (event) => {
  if (event.request.url.includes("/manifest.json")) {
    event.respondWith(fetch(event.request));
  }
});
