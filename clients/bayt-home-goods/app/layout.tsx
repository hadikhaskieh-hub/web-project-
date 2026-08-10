import type { Metadata } from "next";
import localFont from "next/font/local";

import "./globals.css";

// Outfit and IBM Plex Mono are served from this project rather than from a
// font CDN, so the site builds offline and loads no third party requests.
const outfit = localFont({
  src: [
    { path: "./fonts/outfit-latin.woff2", weight: "300 600", style: "normal" },
    {
      path: "./fonts/outfit-latin-ext.woff2",
      weight: "300 600",
      style: "normal",
    },
  ],
  variable: "--font-outfit",
  display: "swap",
  fallback: ["ui-sans-serif", "system-ui", "sans-serif"],
});

const plexMono = localFont({
  src: [
    { path: "./fonts/plex-mono-400-latin.woff2", weight: "400", style: "normal" },
    {
      path: "./fonts/plex-mono-400-latin-ext.woff2",
      weight: "400",
      style: "normal",
    },
    { path: "./fonts/plex-mono-500-latin.woff2", weight: "500", style: "normal" },
    {
      path: "./fonts/plex-mono-500-latin-ext.woff2",
      weight: "500",
      style: "normal",
    },
  ],
  variable: "--font-plex-mono",
  display: "swap",
  fallback: ["ui-monospace", "SFMono-Regular", "monospace"],
});

export const metadata: Metadata = {
  title: {
    default: "Bayt, home goods in Beirut",
    template: "%s | Bayt",
  },
  description:
    "Ceramics, linen, lamps, baskets and kitchenware for Beirut homes. Delivered across the city, paid in cash on delivery or by transfer.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${outfit.variable} ${plexMono.variable}`}>
      <body className="min-h-dvh bg-ground text-ink antialiased">
        <a
          href="#main"
          className="label-mono sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:bg-accent focus:px-4 focus:py-3 focus:text-ground"
        >
          Skip to content
        </a>
        {children}
      </body>
    </html>
  );
}
