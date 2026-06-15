import Image from "next/image";
import { ArrowRight, CalendarDays } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { Link } from "@/i18n/navigation";
import { Badge } from "@/components/ui/badge";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Marketing" });
  return { title: t("blogTitle") };
}

const POSTS = [
  { id: "1", tag: "Finance", title: "5 financial models every analyst should master in 2026", date: "May 28, 2026", img: "photo-1554224155-6726b3ff858f" },
  { id: "2", tag: "Career", title: "How to transition into product management from any field", date: "May 14, 2026", img: "photo-1460925895917-afdab827c52f" },
  { id: "3", tag: "Leadership", title: "The bilingual advantage: leading teams across the GCC", date: "Apr 30, 2026", img: "photo-1521737604893-d14cc237f11d" },
  { id: "4", tag: "Marketing", title: "Data-driven marketing: a practical starter framework", date: "Apr 18, 2026", img: "photo-1551288049-bebda4e38f71" },
  { id: "5", tag: "HR", title: "Building a talent pipeline that actually converts", date: "Apr 03, 2026", img: "photo-1573496359142-b8d87734a5a2" },
  { id: "6", tag: "Project Mgmt", title: "Agile beyond software: lessons for business teams", date: "Mar 21, 2026", img: "photo-1531403009284-440f080d1e12" },
];

export default async function BlogPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Marketing");

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-10 space-y-2">
        <h1 className="font-heading text-3xl font-bold tracking-tight">
          {t("blogTitle")}
        </h1>
        <p className="text-muted-foreground">{t("blogSubtitle")}</p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {POSTS.map((p) => (
          <Link
            key={p.id}
            href="/blog"
            className="group flex flex-col overflow-hidden rounded-2xl border border-border/70 bg-card shadow-sm transition-all hover:-translate-y-1 hover:shadow-md"
          >
            <div className="relative aspect-video bg-muted">
              <Image
                src={`https://images.unsplash.com/${p.img}?auto=format&fit=crop&w=480&q=70`}
                alt={p.title}
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                className="object-cover transition-transform duration-300 group-hover:scale-105"
              />
            </div>
            <div className="flex flex-1 flex-col gap-3 p-5">
              <Badge variant="secondary" className="w-fit">
                {p.tag}
              </Badge>
              <h3 className="line-clamp-2 font-heading text-base font-semibold leading-snug">
                {p.title}
              </h3>
              <div className="mt-auto flex items-center justify-between pt-2 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1.5">
                  <CalendarDays className="size-3.5" />
                  {p.date}
                </span>
                <span className="inline-flex items-center gap-1 font-medium text-primary">
                  {t("readMore")}
                  <ArrowRight className="size-3.5 rtl:rotate-180" />
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
