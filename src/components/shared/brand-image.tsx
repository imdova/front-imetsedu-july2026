"use client";

import * as React from "react";

import { useSiteSettings } from "@/components/providers/site-settings-provider";
import { SmartImage } from "@/components/shared/smart-image";

/**
 * Renders the configured logo (from site settings) for the navbar or footer,
 * falling back to the provided static node when no logo is set. Navbar swaps to
 * the dark-mode logo when the document is in dark mode.
 */
export function BrandImage({
  kind, alt, className, fallback,
}: {
  kind: "navbar" | "footer";
  alt: string;
  className?: string;
  fallback: React.ReactNode;
}) {
  const { branding } = useSiteSettings();
  const [dark, setDark] = React.useState(false);

  React.useEffect(() => {
    const check = () => setDark(document.documentElement.classList.contains("dark"));
    check();
    const obs = new MutationObserver(check);
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => obs.disconnect();
  }, []);

  const url = kind === "footer"
    ? branding.footerLogoUrl || branding.logoUrl
    : (dark && branding.darkLogoUrl) || branding.logoUrl;

  if (!url) return <>{fallback}</>;
  // The navbar logo is in the first screen of every page; the footer one is not.
  return (
    <SmartImage
      src={url}
      alt={alt}
      width={108}
      height={36}
      sizes="108px"
      priority={kind === "navbar"}
      className={className}
    />
  );
}
