"use client";

import { useEffect } from "react";

export default function PwaRegister() {
  useEffect(() => {
    if (
      process.env.NODE_ENV !== "production" ||
      !("serviceWorker" in navigator)
    )
      return;
    navigator.serviceWorker
      .register("/sw.js", { scope: "/", updateViaCache: "none" })
      .then(async () => {
        const registration = await navigator.serviceWorker.ready;
        const urls = [
          ...Array.from(
            document.querySelectorAll<HTMLScriptElement>("script[src]"),
          ).map((s) => s.src),
          ...Array.from(
            document.querySelectorAll<HTMLLinkElement>(
              'link[rel="stylesheet"]',
            ),
          ).map((s) => s.href),
          ...performance.getEntriesByType("resource").map((r) => r.name),
        ];
        registration.active?.postMessage({
          type: "CACHE_URLS",
          urls: [...new Set(urls)],
        });
      })
      .catch((error: unknown) =>
        console.warn("OmniMatma: offline registration unavailable", error),
      );
  }, []);
  return null;
}
