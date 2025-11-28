"use client";

import { useEffect } from "react";

export default function ManifestLink() {
  useEffect(() => {
    // Force manifest link to be in head early
    const existingLink = document.querySelector('link[rel="manifest"]');
    if (existingLink) {
      // Move to head if it's not there
      if (existingLink.parentNode !== document.head) {
        document.head.appendChild(existingLink);
      }
    } else {
      // Create and add manifest link
      const link = document.createElement("link");
      link.rel = "manifest";
      link.href = "/manifest.json";
      document.head.insertBefore(link, document.head.firstChild);
    }
  }, []);

  return null;
}

