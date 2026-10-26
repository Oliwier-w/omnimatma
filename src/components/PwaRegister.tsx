"use client";

import { useEffect, useRef, useState } from "react";

export default function PwaRegister() {
  const [waiting, setWaiting] = useState<ServiceWorker | null>(null);
  const requestedReload = useRef(false);
  useEffect(() => {
    if (
      process.env.NODE_ENV !== "production" ||
      !("serviceWorker" in navigator)
    )
      return;
    let disposed = false;
    const cleanups: (() => void)[] = [];
    const controllerChanged = () => {
      if (requestedReload.current) window.location.reload();
    };
    navigator.serviceWorker.addEventListener("controllerchange", controllerChanged);
    navigator.serviceWorker
      .register("/sw.js", { scope: "/", updateViaCache: "none" })
      .then(async (registered) => {
        if (disposed) return;
        const checkWaiting = () => {
          if (!disposed && registered.waiting && navigator.serviceWorker.controller)
            setWaiting(registered.waiting);
        };
        checkWaiting();
        const watched = new Set<ServiceWorker>();
        const updateFound = () => {
          const installing = registered.installing;
          if (!installing || watched.has(installing)) return;
          watched.add(installing);
          installing.addEventListener("statechange", checkWaiting);
          cleanups.push(() => installing.removeEventListener("statechange", checkWaiting));
        };
        registered.addEventListener("updatefound", updateFound);
        cleanups.push(() => registered.removeEventListener("updatefound", updateFound));
        updateFound();
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
    return () => {
      disposed = true;
      navigator.serviceWorker.removeEventListener("controllerchange", controllerChanged);
      cleanups.forEach((cleanup) => cleanup());
    };
  }, []);
  if (!waiting) return null;
  return <aside className="pwa-update" aria-label="Aktualizacja aplikacji">
    <strong>Nowa wersja jest gotowa.</strong>
    <p>Postęp pozostanie zapisany. Przed odświeżeniem zachowaj notatki z brudnopisu.</p>
    <button type="button" className="button primary" onClick={() => {
      requestedReload.current = true;
      waiting.postMessage({ type: "SKIP_WAITING" });
    }}>Odśwież aplikację</button>
    <button type="button" className="text-button" onClick={() => setWaiting(null)}>Później</button>
  </aside>;
}
