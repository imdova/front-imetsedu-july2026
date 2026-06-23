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
export function LanguageSwitcher({ variant = "default" }: { variant?: "default" | "overlay" }) {
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

  const overlay = variant === "overlay";

  return (
    <div
      role="group"
      aria-label={t("language")}
      className={cn(
        "inline-grid grid-cols-2 rounded-full border p-0.5",
        overlay
          ? "border-white/25 bg-white/10"
          : "border-border/70 bg-muted/40",
        isPending && "pointer-events-none opacity-60",
      )}
    >
      <span
        aria-hidden
        className={cn(
          "col-span-1 row-start-1 rounded-full shadow-sm transition-[grid-column] duration-200 ease-out",
          overlay
            ? "bg-white ring-1 ring-white/30"
            : "bg-background ring-1 ring-border/40",
        )}
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
            overlay
              ? loc === locale
                ? "text-[#0a1424]"
                : "text-white/75 hover:text-white"
              : loc === locale
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
