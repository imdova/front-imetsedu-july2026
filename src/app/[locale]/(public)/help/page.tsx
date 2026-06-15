import { ChevronDown, LifeBuoy } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Pages" });
  return { title: t("helpTitle") };
}

export default async function HelpPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Pages");

  const faqs = [1, 2, 3, 4, 5].map((i) => ({
    q: t(`faq${i}Q` as never),
    a: t(`faq${i}A` as never),
  }));

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="text-center">
        <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-primary/10 text-primary">
          <LifeBuoy className="size-6" />
        </span>
        <h1 className="mt-5 font-heading text-4xl font-bold tracking-tight">{t("helpTitle")}</h1>
        <p className="mx-auto mt-4 max-w-xl text-lg text-muted-foreground">{t("helpLead")}</p>
      </div>

      <div className="mt-10 space-y-3">
        {faqs.map((f, i) => (
          <details
            key={i}
            className="group rounded-2xl border border-border/70 bg-card px-5 py-4 shadow-sm [&_summary::-webkit-details-marker]:hidden"
          >
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-heading text-base font-semibold">
              {f.q}
              <ChevronDown className="size-5 shrink-0 text-muted-foreground transition-transform group-open:rotate-180" />
            </summary>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{f.a}</p>
          </details>
        ))}
      </div>

      <div className="mt-12 rounded-2xl border border-border/70 bg-muted/30 p-8 text-center">
        <h2 className="font-heading text-lg font-semibold">{t("stillNeedHelp")}</h2>
        <Button asChild className="mt-4">
          <Link href="/contact">{t("contactSupport")}</Link>
        </Button>
      </div>
    </div>
  );
}
