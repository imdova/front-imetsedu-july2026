import { defineRouting } from "next-intl/routing";

/**
 * Locale routing. English is the default and served at the root (no prefix);
 * Arabic is served under `/ar`. `as-needed` keeps English URLs clean while
 * giving Arabic its own prefixed space.
 */
export const routing = defineRouting({
  locales: ["en", "ar"],
  defaultLocale: "en",
  localePrefix: "as-needed",
});

export type Locale = (typeof routing.locales)[number];

/** RTL locales — drives <html dir> and the Arabic font. */
export const RTL_LOCALES: Locale[] = ["ar"];

export const isRtl = (locale: string) =>
  RTL_LOCALES.includes(locale as Locale);
