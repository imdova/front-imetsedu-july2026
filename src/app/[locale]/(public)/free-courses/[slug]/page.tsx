import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { Sparkles, ChevronRight, Clock, ListVideo, BadgeCheck } from "lucide-react";

import { Link } from "@/i18n/navigation";
import { dal } from "@/lib/dal";
import { mergeSeo } from "@/lib/public-seo";
import { seoAlternates, socialMeta, localeUrl, breadcrumbLd, metaDescription, SITE_NAME } from "@/lib/seo";
import { JsonLd } from "@/components/seo/json-ld";
import { FreeCourseGate } from "@/features/free-courses/components/free-course-gate";
import type { QuizQuestion } from "@/features/free-courses/lib/free-quiz-data";
import { extractYouTubeVideoId } from "@/features/marketing/lib/youtube-id";

const tr = (locale: string, en: string, ar: string) => (locale === "ar" ? ar : en);

/** Free programs (by slug) that skip the email gate and offer a WhatsApp advisor. */
const ADVISOR_WHATSAPP: Record<string, string> = {
  "cphq-preparation": "201142293143",
};

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

  // Admin-selected quiz from the quiz bank (public GET) → mapped to the lesson
  // quiz shape; falls back to the bundled default inside the experience.
  let quiz: QuizQuestion[] | undefined;
  if (program.quizId) {
    const qr = await dal.quizzes.fetchQuizDetail(program.quizId);
    if (qr.ok) {
      const mapped = qr.data.questions
        .filter((q) => ["single", "true-false", "multiple"].includes(q.type) && q.choices.length >= 2)
        .map((q) => ({
          q: { en: q.prompt, ar: q.prompt },
          options: q.choices.map((c) => ({ en: c.text, ar: c.text })),
          correct: Math.max(0, q.choices.findIndex((c) => c.isCorrect)),
        }));
      if (mapped.length) quiz = mapped;
    }
  }

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

        {/* The gate only covers the PLAYER. Advisor-mode slugs skip the form
            and offer a WhatsApp course advisor instead. */}
        <FreeCourseGate locale={locale} program={program} advisorWhatsapp={ADVISOR_WHATSAPP[slug]} quiz={quiz} />

      </div>
    </>
  );
}
