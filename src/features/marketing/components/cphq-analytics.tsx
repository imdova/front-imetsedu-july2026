"use client";

import * as React from "react";
import { gaEvent, fbqTrack } from "@/lib/analytics";

/**
 * Landing-page analytics for the CPHQ free-lecture funnel. Fires Meta
 * `ViewContent` on mount, and GA4 `hero_cta_click` / `faq_open` / `scroll_50` /
 * `scroll_90` via lightweight document-level listeners (no per-element wiring).
 * Renders nothing.
 */
export function CphqAnalytics({ contentName = "CPHQ Free Lecture" }: { contentName?: string }) {
  React.useEffect(() => {
    fbqTrack("ViewContent", { content_name: contentName, content_category: "Landing" });

    // Any "book a seat" CTA points at #register.
    const onClick = (e: MouseEvent) => {
      const a = (e.target as HTMLElement | null)?.closest?.('a[href="#register"]');
      if (a) gaEvent("hero_cta_click", { location: a.getAttribute("data-loc") ?? "cta" });
    };
    // FAQ <details> opening.
    const onToggle = (e: Event) => {
      const el = e.target as HTMLElement;
      if (el?.tagName === "DETAILS" && (el as HTMLDetailsElement).open) {
        const q = el.querySelector("summary")?.textContent?.trim().slice(0, 80);
        gaEvent("faq_open", { question: q });
      }
    };
    // Scroll depth (fire each once).
    const fired = { 50: false, 90: false };
    const onScroll = () => {
      const h = document.documentElement;
      const pct = ((h.scrollTop + h.clientHeight) / h.scrollHeight) * 100;
      if (!fired[50] && pct >= 50) { fired[50] = true; gaEvent("scroll_50"); }
      if (!fired[90] && pct >= 90) { fired[90] = true; gaEvent("scroll_90"); }
    };

    document.addEventListener("click", onClick);
    document.addEventListener("toggle", onToggle, true); // capture: toggle doesn't bubble
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      document.removeEventListener("click", onClick);
      document.removeEventListener("toggle", onToggle, true);
      window.removeEventListener("scroll", onScroll);
    };
  }, [contentName]);

  return null;
}
