import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { ArrowRight, Clock, Newspaper } from "lucide-react";

import { Link } from "@/i18n/navigation";
import { dal } from "@/lib/dal";
import { Button } from "@/components/ui/button";

const TOPICS = ["CPHQ", "Patient Safety", "Quality", "Leadership", "Hospital Management"];

export async function HealthcareInsightsSection() {
  const t = await getTranslations("Marketing");
  const res = await dal.blog.fetchPublicArticles();
  const posts = (res.ok ? res.data.data : []).slice(0, 3);
  if (posts.length === 0) return null; // hide until there are published articles

  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-14 lg:px-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0b3fa8]">{t("insightsLabel")}</p>
          <h2 className="mt-2 text-balance font-heading text-2xl font-bold tracking-tight text-[#0a2f7a] sm:text-3xl lg:text-[2rem]">{t("insightsTitle")}</h2>
        </div>
        <Button asChild variant="ghost" className="gap-1.5">
          <Link href="/blog">{t("insightsViewAll")}<ArrowRight className="size-4 rtl:rotate-180" /></Link>
        </Button>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        {TOPICS.map((topic) => (
          <Link key={topic} href="/blog" className="rounded-full border border-blue-100 bg-blue-50/60 px-3.5 py-1.5 text-xs font-semibold text-[#0a2f7a] transition-colors hover:border-[#0b3fa8]/40 hover:bg-[#0b3fa8]/10">
            {topic}
          </Link>
        ))}
      </div>

      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {posts.map((p) => (
          <Link
            key={p.id}
            href={`/blog/${p.slug}`}
            className="group flex h-full flex-col overflow-hidden rounded-2xl border border-blue-100 bg-white shadow-sm transition-all hover:-translate-y-1 hover:border-[#0b3fa8]/40 hover:shadow-md"
          >
            <div className="relative aspect-[2/1] overflow-hidden bg-blue-50">
              {p.coverImageUrl ? (
                <Image src={p.coverImageUrl} alt={p.title} fill sizes="(max-width:1024px) 100vw, 33vw" className="object-cover transition-transform duration-300 group-hover:scale-[1.03]" />
              ) : (
                <span className="grid size-full place-items-center text-[#0b3fa8]/40"><Newspaper className="size-10" /></span>
              )}
            </div>
            <div className="flex flex-1 flex-col p-4">
              {p.category && (
                <span className="inline-flex w-fit rounded-full bg-[#0b3fa8]/10 px-2.5 py-0.5 text-[11px] font-semibold text-[#0b3fa8]">{p.category}</span>
              )}
              <h3 className="mt-2 line-clamp-2 font-heading text-base font-bold leading-snug text-[#0a2f7a] group-hover:text-[#0b3fa8]">{p.title}</h3>
              {p.excerpt && <p className="mt-1.5 line-clamp-2 flex-1 text-sm leading-relaxed text-slate-600">{p.excerpt}</p>}
              <p className="mt-3 inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                <Clock className="size-3.5" /> {t("insightsReadTime", { count: p.readingMinutes || 5 })}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
