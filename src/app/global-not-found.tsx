import type { Metadata } from "next";
import { Geist } from "next/font/google";
import Link from "next/link";

import "./globals.css";

const geistSans = Geist({ variable: "--font-sans", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "404 — Page not found · IMETS Medical School",
};

/**
 * Global 404 for URLs that don't match any route (no `[locale]` segment to
 * resolve, so the locale layout never runs). Next.js would otherwise fall back
 * to a bare synthesized `<html><body>` with no `suppressHydrationWarning`, which
 * browser extensions (Grammarly, Demoway, …) mutate before hydration and trip a
 * hydration-mismatch warning. Owning the document here lets us suppress that.
 */
export default function GlobalNotFound() {
  return (
    <html lang="en" suppressHydrationWarning className={`${geistSans.variable} antialiased`}>
      <body
        suppressHydrationWarning
        style={{
          minHeight: "100vh",
          margin: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "var(--font-sans), system-ui, sans-serif",
          background: "#f8fafc",
          color: "#0f172a",
        }}
      >
        <main style={{ textAlign: "center", padding: "2rem" }}>
          <p style={{ fontSize: "0.875rem", fontWeight: 600, letterSpacing: "0.1em", color: "#2563eb", margin: 0 }}>
            404
          </p>
          <h1 style={{ fontSize: "1.75rem", fontWeight: 700, margin: "0.5rem 0 0.75rem" }}>
            This page could not be found.
          </h1>
          <p style={{ color: "#64748b", margin: "0 0 1.5rem" }}>
            The page you’re looking for doesn’t exist or has moved.
          </p>
          <Link
            href="/"
            style={{
              display: "inline-block",
              background: "#2563eb",
              color: "#fff",
              padding: "0.625rem 1.25rem",
              borderRadius: "0.5rem",
              textDecoration: "none",
              fontWeight: 600,
            }}
          >
            Back to home
          </Link>
        </main>
      </body>
    </html>
  );
}
