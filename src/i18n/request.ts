import { getRequestConfig } from "next-intl/server";
import { hasLocale } from "next-intl";
import { routing } from "./routing";

/**
 * Per-request i18n config. Resolves the active locale from the URL segment and
 * loads the matching message catalog. Referenced automatically by the next-intl
 * plugin (see next.config.ts).
 */
export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale; // per-request locale resolution

  const locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale;

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
  };
});
