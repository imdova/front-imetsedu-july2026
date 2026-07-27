import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { Sparkles, PlayCircle, ChevronRight, Clock, ListVideo, BadgeCheck, Award, BrainCircuit, GraduationCap } from "lucide-react";

import { Link } from "@/i18n/navigation";
import { dal } from "@/lib/dal";
import { mergeSeo } from "@/lib/public-seo";
import { seoAlternates, socialMeta, localeUrl, breadcrumbLd, metaDescription, SITE_NAME } from "@/lib/seo";
import { JsonLd } from "@/components/seo/json-ld";
import { FreeCourseGate } from "@/features/free-courses/components/free-course-gate";
import { extractYouTubeVideoId } from "@/features/marketing/lib/youtube-id";

const tr = (locale: string, en: string, ar: string) => (locale === "ar" ? ar : en);

export const revalidate = 120;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const res = await dal.freeCourses.fetchFreeProgram(slug);
  if (!res.ok) return {};
  const p = res.data;
  const name = (locale === "ar" ? p.titleAr : p.titleEn) || p.titleEn;
  const body = (locale === "ar" ? p.descriptionAr : p.descriptionEn) || "";
  const title = p.seoTitle || tr(locale, `${name} — Free Course`, `${name} — كورس مجاني`);
  const description = p.seoDescription || metaDescription(body, `${name} — ${SITE_NAME}`);
  const path = `/free-courses/${slug}`;
  return mergeSeo(path, {
    title,
    description,
    alternates: seoAlternates(path, locale),
    ...socialMeta({ title: name, description, path, locale, image: p.thumbnailUrl }),
  });
}

export default async function FreeCourseDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const res = await dal.freeCourses.fetchFreeProgram(slug);
  if (!res.ok) notFound();
  const program = res.data;

  const name = (locale === "ar" ? program.titleAr : program.titleEn) || program.titleEn;
  const body = (locale === "ar" ? program.descriptionAr : program.descriptionEn) || "";
  const url = localeUrl(`/free-courses/${slug}`, locale);
  const lectureTitle = (l: (typeof program.lectures)[number]) =>
    (locale === "ar" ? l.titleAr : l.titleEn) || l.titleEn;

  const totalMin = program.lectures.reduce((s, l) => s + (l.durationMinutes || 0), 0);
  const durLabel = totalMin >= 60
    ? `${Math.floor(totalMin / 60)}${tr(locale, "h", "س")}${totalMin % 60 ? ` ${totalMin % 60}${tr(locale, "m", "د")}` : ""}`
    : `${totalMin} ${tr(locale, "min", "د")}`;
  const count = program.lectures.length;
  const FACTS = [
    { icon: ListVideo, text: `${count} ${count === 1 ? tr(locale, "lecture", "محاضرة") : tr(locale, "lectures", "محاضرة")}` },
    ...(totalMin > 0 ? [{ icon: Clock, text: durLabel }] : []),
    { icon: BadgeCheck, text: tr(locale, "100% free", "مجاني ١٠٠٪") },
    { icon: Award, text: tr(locale, "Certificate of attendance", "شهادة حضور") },
  ];
  const STEPS = [
    { icon: PlayCircle, t: tr(locale, "Watch the lectures", "شاهد المحاضرات") },
    { icon: BrainCircuit, t: tr(locale, "Take a quick quiz", "اختبر معلوماتك") },
    { icon: GraduationCap, t: tr(locale, "Join the live cohort", "انضم للدفعة المباشرة") },
  ];

  return (
    <>
      <JsonLd
        data={[
          {
            "@context": "https://schema.org",
            "@type": "Course",
            name,
            description: metaDescription(body, name),
            url,
            ...(program.thumbnailUrl ? { image: program.thumbnailUrl } : {}),
            inLanguage: locale,
            provider: { "@type": "EducationalOrganization", name: SITE_NAME },
            // Zero-price offer: required for a free course to qualify for
            // Google's course rich results.
            offers: { "@type": "Offer", price: 0, priceCurrency: "EGP", category: "Free", url },
            ...(program.lectures.length
              ? {
                  hasPart: program.lectures.map((l) => ({
                    "@type": "Course",
                    name: lectureTitle(l),
                    description: (locale === "ar" ? l.descriptionAr : l.descriptionEn) || undefined,
                    provider: { "@type": "EducationalOrganization", name: SITE_NAME },
                  })),
                }
              : {}),
          },
          breadcrumbLd([
            { name: tr(locale, "Home", "الرئيسية"), url: localeUrl("/", locale) },
            { name: tr(locale, "Free Courses", "كورسات مجانية"), url: localeUrl("/free-courses", locale) },
            { name, url },
          ]),
          // VideoObject per playable lecture — these are real, watchable videos,
          // so they're eligible for video rich results. Lectures without a video
          // are skipped rather than declared as ones that don't exist.
          ...program.lectures
            .filter((l) => l.videoUrl && l.videoProvider === "youtube")
            .map((l) => {
              const vid = extractYouTubeVideoId(l.videoUrl);
              if (!vid) return null;
              return {
                "@context": "https://schema.org",
                "@type": "VideoObject",
                name: lectureTitle(l),
                description:
                  (locale === "ar" ? l.descriptionAr : l.descriptionEn) || lectureTitle(l),
                thumbnailUrl: `https://i.ytimg.com/vi/${vid}/hqdefault.jpg`,
                embedUrl: `https://www.youtube.com/embed/${vid}`,
                contentUrl: l.videoUrl,
                ...(l.durationMinutes > 0 ? { duration: `PT${l.durationMinutes}M` } : {}),
                isFamilyFriendly: true,
                publisher: { "@type": "Organization", name: SITE_NAME },
              };
            })
            .filter(Boolean),
        ]}
      />

      <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        <nav aria-label="Breadcrumb" className="mb-4 flex flex-wrap items-center gap-1 text-xs text-muted-foreground">
          <Link href="/" className="hover:text-foreground">{tr(locale, "Home", "الرئيسية")}</Link>
          <ChevronRight className="size-3.5 rtl:rotate-180" />
          <Link href="/free-courses" className="hover:text-foreground">{tr(locale, "Free Courses", "كورسات مجانية")}</Link>
          <ChevronRight className="size-3.5 rtl:rotate-180" />
          <span className="text-foreground">{name}</span>
        </nav>

        {/* Hero — always server-rendered so it stays indexable. */}
        <header className="mb-8">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
            <Sparkles className="size-3.5" /> {tr(locale, "FREE COURSE", "كورس مجاني")}
          </span>
          <h1 className="mt-3 font-heading text-3xl font-bold tracking-tight text-balance sm:text-4xl">{name}</h1>
          {body && <p className="mt-3 max-w-2xl text-base leading-relaxed text-muted-foreground">{body}</p>}
          <div className="mt-4 flex flex-wrap gap-2">
            {FACTS.map((f) => (
              <span key={f.text} className="inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-card px-3 py-1.5 text-xs font-medium">
                <f.icon className="size-3.5 text-primary" /> {f.text}
              </span>
            ))}
          </div>
        </header>

        {/* Learning path — orients the visitor before the gate. */}
        <div className="mb-8 grid gap-3 sm:grid-cols-3">
          {STEPS.map((s, i) => (
            <div key={s.t} className="relative flex items-center gap-3 rounded-2xl border border-border/70 bg-card p-4">
              <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary"><s.icon className="size-5" /></span>
              <div>
                <div className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">{tr(locale, `Step ${i + 1}`, `خطوة ${i + 1}`)}</div>
                <div className="text-sm font-semibold">{s.t}</div>
              </div>
              {i < STEPS.length - 1 && <ChevronRight className="absolute -end-2 top-1/2 hidden size-4 -translate-y-1/2 text-muted-foreground/40 sm:block rtl:rotate-180" />}
            </div>
          ))}
        </div>

        {/* The gate only covers the PLAYER. */}
        <FreeCourseGate locale={locale} program={program} />

        {/* Curriculum in server HTML — indexable whether or not the gate is open,
            which is the whole point of gating the player and not the page. */}
        {program.lectures.length > 0 && (
          <section className="mt-10">
            <h2 className="font-heading text-xl font-semibold">
              {tr(locale, "What's included", "ماذا يتضمّن")}
            </h2>
            <ol className="mt-4 divide-y divide-border/60 overflow-hidden rounded-2xl border border-border/70 bg-card">
              {program.lectures.map((l, i) => (
                <li key={l.id} className="flex items-start gap-3 p-4">
                  <span className="grid size-7 shrink-0 place-items-center rounded-full bg-primary/10 text-xs font-bold tabular-nums text-primary">
                    {i + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-semibold text-foreground">{lectureTitle(l)}</h3>
                    {(locale === "ar" ? l.descriptionAr : l.descriptionEn) && (
                      <p className="mt-1 text-sm text-muted-foreground">
                        {locale === "ar" ? l.descriptionAr : l.descriptionEn}
                      </p>
                    )}
                  </div>
                  {l.durationMinutes > 0 && (
                    <span className="inline-flex shrink-0 items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="size-3.5" /> {l.durationMinutes} {tr(locale, "min", "د")}
                    </span>
                  )}
                </li>
              ))}
            </ol>
          </section>
        )}

        <section className="mt-10 rounded-2xl border border-border/70 bg-muted/30 p-6 text-center">
          <p className="font-heading text-lg font-bold">
            {tr(locale, "Want the full program?", "تريد البرنامج الكامل؟")}
          </p>
          <p className="mx-auto mt-1.5 max-w-md text-sm text-muted-foreground">
            {tr(
              locale,
              "Our accredited diplomas go far beyond these free lectures — live sessions, assignments and a certificate.",
              "دبلوماتنا المعتمدة تتجاوز هذه المحاضرات المجانية بكثير — جلسات مباشرة وواجبات وشهادة.",
            )}
          </p>
          <Link
            href="/courses"
            className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
          >
            {tr(locale, "Explore diplomas", "استكشف الدبلومات")}
            <ChevronRight className="size-4 rtl:rotate-180" />
          </Link>
        </section>
      </div>
    </>
  );
}
