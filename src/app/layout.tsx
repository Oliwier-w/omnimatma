import type { Metadata, Viewport } from "next";
import "katex/dist/katex.min.css";
import "./globals.css";
import PwaRegister from "@/components/PwaRegister";

export const metadata: Metadata = {
  title: "OmniMatma — Zrozum. Przećwicz. Odkryj.",
  description:
    "Twoja przestrzeń do matematyki. Interaktywne lekcje, nieskończone zadania i nauka w Twoim tempie.",
  applicationName: "OmniMatma",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "OmniMatma",
  },
};
export const viewport: Viewport = {
  themeColor: "#090a0f",
  width: "device-width",
  initialScale: 1,
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pl" suppressHydrationWarning>
      <body>
        {children}
        <PwaRegister />
      </body>
    </html>
  );
}
