import Link from "next/link";
import type { Metadata } from "next";
import { Compass, Home, Network } from "lucide-react";

export const metadata: Metadata = {
  title: "Nie ma tu tej strony — ale jest droga dalej | OmniMatma",
  description:
    "Ten adres nie istnieje. Wróć na start albo przejdź do ścieżki 60 mikro-lekcji.",
};

export default function NotFound() {
  return (
    <main
      id="main"
      tabIndex={-1}
      style={{
        display: "flex",
        minHeight: "100dvh",
        alignItems: "center",
        justifyContent: "center",
        padding: "32px 20px",
      }}
    >
      <section
        className="panel"
        style={{ width: "min(620px, 100%)", textAlign: "left" }}
      >
        <span
          className="eyebrow"
          style={{ display: "inline-flex", alignItems: "center", gap: 7 }}
        >
          <Compass size={14} aria-hidden="true" /> BŁĄD 404 · ZBOCZYŁEŚ ZE ŚCIEŻKI
        </span>
        <h1 style={{ fontSize: "clamp(30px, 6vw, 44px)", margin: "14px 0 10px" }}>
          Tej strony nie ma.
          <br />
          <span style={{ color: "var(--accent)" }}>Matematyka jest obok.</span>
        </h1>
        <p className="muted" style={{ maxWidth: 480 }}>
          Adres mógł się zmienić albo zawierać literówkę. Twoje postępy są
          nietknięte — wróć na start lub wejdź w ścieżkę nauki i wybierz temat.
        </p>
        <div
          style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 24 }}
        >
          <Link className="button primary" href="/">
            <Home size={16} aria-hidden="true" /> Wróć na start
          </Link>
          <Link className="button" href="/sciezka">
            <Network size={16} aria-hidden="true" /> Zobacz 60 lekcji
          </Link>
        </div>
      </section>
    </main>
  );
}
