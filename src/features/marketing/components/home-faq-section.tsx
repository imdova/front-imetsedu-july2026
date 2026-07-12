import { getTranslations } from "next-intl/server";
import { ChevronDown } from "lucide-react";

import { JsonLd } from "@/components/seo/json-ld";

const FAQ_KEYS = ["faqDelivery", "faqAccredited", "faqOutside", "faqRecordings", "faqSupport", "faqDuration", "faqCertificate"] as const;

export async function HomeFaqSection() {
  const t = await getTranslations("Marketing");
  const items = FAQ_KEYS.map((k) => ({ q: t(`${k}Q`), a: t(`${k}A`) }));

  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  return (
    <section className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-14 lg:px-8">
      <JsonLd data={faqLd} />
      <div className="mx-auto mb-8 max-w-2xl text-center">
        <h2 className="text-balance font-heading text-2xl font-bold tracking-tight text-[#0a2f7a] sm:text-3xl lg:text-[2rem]">{t("faqHomeTitle")}</h2>
        <p className="mt-3 text-pretty leading-relaxed text-muted-foreground">{t("faqHomeSubtitle")}</p>
      </div>
      <div className="space-y-3">
        {items.map((f) => (
          <details key={f.q} className="group rounded-xl border border-blue-100 bg-white px-5 py-4 shadow-sm">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold text-[#0a2f7a]">
              {f.q}
              <ChevronDown className="size-4 shrink-0 text-slate-400 transition-transform group-open:rotate-180" />
            </summary>
            <p className="mt-3 text-sm leading-relaxed text-slate-600">{f.a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
