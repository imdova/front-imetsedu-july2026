"use client";

import * as React from "react";
import type { SsBranding, SsTheme, SsFeatures } from "@/types/site-settings";

export interface PublicBrand {
  branding: Partial<SsBranding>;
  theme: Partial<SsTheme>;
  features?: Partial<SsFeatures>;
}

const SiteSettingsContext = React.createContext<PublicBrand>({ branding: {}, theme: {} });

/** Feeds the public branding/theme/features down to client components so they
 * read from context instead of re-fetching per page. Wired in the root layout. */
export function SiteSettingsProvider({ value, children }: { value: PublicBrand; children: React.ReactNode }) {
  return <SiteSettingsContext.Provider value={value}>{children}</SiteSettingsContext.Provider>;
}

export const useSiteSettings = (): PublicBrand => React.useContext(SiteSettingsContext);

/** Convenience: is a feature module enabled? Defaults to true when unknown. */
export function useFeature(key: keyof SsFeatures): boolean {
  const { features } = useSiteSettings();
  return features?.[key] ?? true;
}
