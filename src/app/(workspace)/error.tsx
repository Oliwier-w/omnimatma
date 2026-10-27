"use client";

import { useEffect } from "react";
import Link from "next/link";
import { RotateCw, Home, ShieldCheck } from "lucide-react";

/**
 * Route-level safety net. It never clears storage: progress, notes and theme
 * stay in localStorage, so a retry re-renders the same view with the same data.
 */
export default function WorkspaceError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Keep the technical detail in the console for bug reports, not in the UI.
    console.error("OmniMatma route error:", error);
  }, [error]);

  return (
    <section className="panel" role="alert" aria-labelledby="error-title">
      <span className="eyebrow">COŚ SIĘ ZACIĘŁO</span>
      <h1 id="error-title" style={{ margin: "10px 0" }}>
        Ta część nie wczytała się poprawnie.
      </h1>
      <p className="muted" style={{ maxWidth: 560 }}>
        Twoje postępy, notatki i motyw są bezpieczne — zostają w pamięci
        przeglądarki. Spróbuj ponownie albo wróć na start; nic nie zostało
        usunięte.
      </p>
      <p
        className="muted"
        style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 14 }}
      >
        <ShieldCheck size={16} aria-hidden="true" />
        Dane lokalne nie są czyszczone przy odświeżeniu widoku.
      </p>
      {error.digest && (
        <p className="muted" style={{ fontSize: 11, marginTop: 6 }}>
          Kod błędu: <code>{error.digest}</code>
        </p>
      )}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 10,
          marginTop: 22,
        }}
      >
        <button type="button" className="button primary" onClick={() => reset()}>
          <RotateCw size={16} aria-hidden="true" /> Spróbuj ponownie
        </button>
        <Link className="button" href="/">
          <Home size={16} aria-hidden="true" /> Wróć na start
        </Link>
      </div>
    </section>
  );
}
