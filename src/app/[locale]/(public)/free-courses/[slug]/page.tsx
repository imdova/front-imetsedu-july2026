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
    /*
     * Free-lecture pages are lead-capture assets, not search assets. Several
     * carry the same H1 as their paid counterpart on a fraction of the copy,
     * so leaving them indexable had two URLs on one domain competing for one
     * query — and the thin one tends to win, then convert badly.
     *
     * `follow` is deliberate: the links out to the paid course pages still
     * pass their signal, we simply stop the page competing in results.
     */
    robots: { index: false, follow: true },
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

  // Resolve a quiz-bank quiz (public GET) → the lightweight lesson-quiz shape.
  const resolveQuiz = async (quizId: string): Promise<QuizQuestion[] | undefined> => {
    const qr = await dal.quizzes.fetchQuizDetail(quizId);
    if (!qr.ok) return undefined;
    const mapped = qr.data.questions
      .filter((q) => ["single", "true-false", "multiple"].includes(q.type) && q.choices.length >= 2)
      .map((q) => ({
        q: { en: q.prompt, ar: q.prompt },
        options: q.choices.map((c) => ({ en: c.text, ar: c.text })),
        correct: Math.max(0, q.choices.findIndex((c) => c.isCorrect)),
      }));
    return mapped.length ? mapped : undefined;
  };

  // Program-level quiz (legacy single knowledge check) → falls back to bundled.
  const quiz: QuizQuestion[] | undefined = program.quizId ? await resolveQuiz(program.quizId) : undefined;

  // Per-item quizzes for module "quiz" lessons → keyed by lecture id. Items with
  // no bank quiz picked stay out of the map, so the player shows them as locked.
  const quizLectures = program.lectures.filter((l) => l.kind === "quiz" && l.quizId);
  const resolved = await Promise.all(quizLectures.map((l) => resolveQuiz(l.quizId)));
  const quizzesById: Record<string, QuizQuestion[]> = {};
  quizLectures.forEach((l, i) => { const q = resolved[i]; if (q) quizzesById[l.id] = q; });

  // The paid course this lecture previews — free programmes reuse the course
  // slug, so the pairing needs no extra field.
  const coursesRes = await dal.courses.fetchCourses();
  const paidCourse = (coursesRes.ok ? coursesRes.data : []).find((c) => c.slug === slug) ?? null;

  const name = (locale === "ar" ? program.titleAr : program.titleEn) || program.titleEn;
  const body = (locale === "ar" ? program.descriptionAr : program.descriptionEn) || "";
  const url = localeUrl(`/free-courses/${slug}`, locale);
  const lectureTitle = (l: (typeof program.lectures)[number]) =>
    (locale === "ar" ? l.titleAr : l.titleEn) || l.titleEn;

  // Only real lessons (not quiz items) count toward "N lectures" / duration.
  const lessonList = program.lectures.filter((l) => l.kind !== "quiz");
  const totalMin = lessonList.reduce((s, l) => s + (l.durationMinutes || 0), 0);
  const durLabel = totalMin >= 60
    ? `${Math.floor(totalMin / 60)}${tr(locale, "h", "س")}${totalMin % 60 ? ` ${totalMin % 60}${tr(locale, "m", "د")}` : ""}`
    : `${totalMin} ${tr(locale, "min", "د")}`;
  const count = lessonList.length;
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
            ...(lessonList.length
              ? {
                  hasPart: lessonList.map((l) => ({
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
        <FreeCourseGate locale={locale} program={program} advisorWhatsapp={ADVISOR_WHATSAPP[slug]} quiz={quiz} quizzesById={quizzesById} />

        {/* Route on to the paid programme. Free lectures previously had no link
            to the course they preview, which stranded both the visitor and the
            internal link equity. Free slugs mirror course slugs 1:1. */}
        {paidCourse && (
          <section className="mt-10 rounded-2xl border border-primary/20 bg-primary/[0.04] p-6 sm:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">
              {tr(locale, "Continue with the full program", "أكمل مع البرنامج الكامل")}
            </p>
            <h2 className="mt-2 font-heading text-xl font-bold sm:text-2xl">
              {(locale === "ar" ? paidCourse.titleAr : paidCourse.titleEn) || paidCourse.titleEn}
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
              {tr(
                locale,
                "This free lecture is a sample. The full course adds live sessions, the complete curriculum, practice questions and a certificate of completion.",
                "هذه المحاضرة المجانية عيّنة. البرنامج الكامل يضيف جلسات مباشرة والمنهج الكامل وأسئلة تدريبية وشهادة إتمام.",
              )}
            </p>
            <Link
              href={`/courses/${paidCourse.slug}`}
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
            >
              {tr(locale, "View the full course", "شاهد البرنامج الكامل")}
              <ChevronRight className="size-4 rtl:rotate-180" />
            </Link>
          </section>
        )}

      </div>
    </>
  );
}
