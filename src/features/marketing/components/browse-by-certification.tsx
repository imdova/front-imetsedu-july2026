"use client";

import { useTranslations } from "next-intl";
import { BadgeCheck } from "lucide-react";

import { cn } from "@/lib/utils";
import { CERT_OPTIONS } from "@/features/marketing/lib/catalog-filters";

interface Props {
  selected: string[];
  onSelect: (value: string) => void;
}

export function BrowseByCertification({ selected, onSelect }: Props) {
  const t = useTranslations("Marketing");

  return (
    <section className="space-y-4">
      <div>
        <h2 className="font-heading text-2xl font-bold tracking-tight text-[#0a2f7a]">
          {t("browseCertTitle")}
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">{t("browseCertSubtitle")}</p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {CERT_OPTIONS.map((cert) => {
          const on = selected.includes(cert.value);
          return (
            <button
              key={cert.value}
              type="button"
              onClick={() => onSelect(cert.value)}
              className={cn(
                "group flex min-h-[108px] flex-col items-center justify-center gap-2 rounded-2xl border px-3 py-4 text-center shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md",
                on
                  ? "border-[#0b3fa8] bg-[#0b3fa8] text-white"
                  : "border-blue-100 bg-white text-[#0a2f7a] hover:border-[#0b3fa8]/40",
              )}
            >
              <span
                className={cn(
                  "grid size-10 place-items-center rounded-xl transition-colors",
                  on ? "bg-white/15 text-white" : "bg-[#0b3fa8]/10 text-[#0b3fa8]",
                )}
              >
                <BadgeCheck className="size-5" />
              </span>
              <span className="font-heading text-base font-bold tracking-wide">
                {t(cert.labelKey)}
              </span>
              <span
                className={cn(
                  "text-[11px] leading-snug",
                  on ? "text-white/80" : "text-muted-foreground",
                )}
              >
                {t(cert.hintKey)}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
