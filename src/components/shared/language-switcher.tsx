"use client";

import { useLocale, useTranslations } from "next-intl";
import { useTransition } from "react";

import { usePathname, useRouter } from "@/i18n/navigation";
import { routing, type Locale } from "@/i18n/routing";
import { cn } from "@/lib/utils";

const SHORT: Record<Locale, string> = { en: "EN", ar: "ع" };

/**
 * Switches locale while preserving the current path. Uses the i18n-aware router
 * so navigating to `ar` adds the `/ar` prefix and back to `en` removes it.
 */
export function LanguageSwitcher() {
  const t = useTranslations("Common");
  const locale = useLocale() as Locale;
  const pathname = usePathname();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const activeIndex = Math.max(0, routing.locales.indexOf(locale));

  const switchTo = (next: Locale) => {
    if (next === locale) return;
    startTransition(() => {
      router.replace(pathname, { locale: next });
    });
  };

  return (
    <div
      role="group"
      aria-label={t("language")}
      className={cn(
        "inline-grid grid-cols-2 rounded-full border border-border/70 bg-muted/40 p-0.5",
        isPending && "pointer-events-none opacity-60",
      )}
    >
      <span
        aria-hidden
        className="col-span-1 row-start-1 rounded-full bg-background shadow-sm ring-1 ring-border/40 transition-[grid-column] duration-200 ease-out"
        style={{ gridColumnStart: activeIndex + 1 }}
      />
      {routing.locales.map((loc, index) => (
        <button
          key={loc}
          type="button"
          aria-pressed={loc === locale}
          onClick={() => switchTo(loc)}
          style={{ gridColumnStart: index + 1, gridRowStart: 1 }}
          className={cn(
            "relative z-10 min-w-9 rounded-full px-2.5 py-1 text-xs font-semibold tracking-wide transition-colors",
            loc === locale
              ? "text-foreground"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          {SHORT[loc]}
        </button>
      ))}
    </div>
  );
}
