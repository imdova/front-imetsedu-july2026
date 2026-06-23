"use client";

import * as React from "react";
import { X } from "lucide-react";

import { cn } from "@/lib/utils";

export interface PublicBanner {
  id: string;
  message: string;
  linkUrl: string;
  linkLabel: string;
  variant: string;
}

const VARIANT: Record<string, string> = {
  info: "bg-primary text-primary-foreground",
  success: "bg-success text-white",
  warning: "bg-warning text-black",
  promo: "bg-gradient-to-r from-primary to-primary/80 text-primary-foreground",
};

/** Dismissible promo bar — renders the first non-dismissed active banner.
 * Dismissals persist in localStorage so a banner stays hidden once closed. */
export function BannerBarView({ banners }: { banners: PublicBanner[] }) {
  const [dismissed, setDismissed] = React.useState<string[]>([]);

  React.useEffect(() => {
    try {
      setDismissed(JSON.parse(localStorage.getItem("imets_dismissed_banners") ?? "[]"));
    } catch { /* ignore */ }
  }, []);

  const banner = banners.find((b) => !dismissed.includes(b.id));
  if (!banner) return null;

  const close = () => {
    const next = [...dismissed, banner.id];
    setDismissed(next);
    try { localStorage.setItem("imets_dismissed_banners", JSON.stringify(next)); } catch { /* ignore */ }
  };

  return (
    <div className={cn("relative flex items-center justify-center gap-3 px-4 py-2 text-center text-sm", VARIANT[banner.variant] ?? VARIANT.info)}>
      <span className="font-medium">{banner.message}</span>
      {banner.linkUrl && banner.linkLabel && (
        <a href={banner.linkUrl} className="underline underline-offset-2 hover:opacity-90">
          {banner.linkLabel}
        </a>
      )}
      <button onClick={close} aria-label="Dismiss" className="absolute end-3 top-1/2 -translate-y-1/2 opacity-80 hover:opacity-100">
        <X className="size-4" />
      </button>
    </div>
  );
}
