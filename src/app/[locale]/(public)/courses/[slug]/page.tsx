import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import {
  Clock,
  BarChart3,
  PlayCircle,
  CheckCircle2,
  Globe,
  CalendarDays,
} from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { dal } from "@/lib/dal";
import { formatCurrency, getInitials } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { CourseCard } from "@/features/marketing/components/course-card";
import { CourseHeroMeta } from "@/features/marketing/components/course-hero-meta";
import { CourseCurriculum } from "@/features/marketing/components/course-curriculum";
import { CourseApplyDialog } from "@/features/marketing/components/course-apply-dialog";
import { VideoFacade } from "@/features/marketing/components/video-facade";
import { JsonLd } from "@/components/seo/json-ld";
import {
  SITE_NAME, localeUrl, seoAlternates, socialMeta, metaDescription,
  courseLd, breadcrumbLd,
} from "@/lib/seo";
import { mergeSeo } from "@/lib/public-seo";

/** Convert a YouTube watch/share URL to an autoplaying (muted) embed URL.
 * Muted autoplay is required by browser policies; the user can unmute. */
function youTubeEmbed(url?: string): string | null {
  if (!url) return null;
  const m = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/|v\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/,
  );
  const id = m?.[1];
  if (!id) return null;
  const p = new URLSearchParams({
    autoplay: "1", mute: "1", rel: "0", playsinline: "1", modestbranding: "1",
  });
  return `https://www.youtube.com/embed/${id}?${p.toString()}`;
}

/** Next cohort start — always two weeks from today. */
function nextCohortStartDate(locale: string): string {
  const start = new Date();
  start.setDate(start.getDate() + 14);
  return new Intl.DateTimeFormat(locale === "ar" ? "ar-EG" : "en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(start);
}

export const revalidate = 86400;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const res = await dal.courses.fetchCourses();
  const course = (res.ok ? res.data : []).find((c) => c.slug === slug);
  if (!course) return {};
  const title = locale === "ar" ? course.titleAr : course.titleEn;
  const description = metaDescription(
    locale === "ar" ? course.descriptionAr : course.descriptionEn,
    `${title} — ${SITE_NAME}`,
  );
  const path = `/courses/${slug}`;
  return mergeSeo(path, {
    title,
    description,
    alternates: seoAlternates(path, locale),
    ...socialMeta({ title, description, path, locale, image: course.thumbnailUrl }),
  });
}

export default async function CourseDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Marketing");

  const [coursesRes, instructorsRes] = await Promise.all([
    dal.courses.fetchCourses(),
    dal.lookups.fetchInstructors(),
  ]);
  const courses = coursesRes.ok ? coursesRes.data : [];
  const course = courses.find((c) => c.slug === slug);
  if (!course) notFound();

  const instructors = instructorsRes.ok ? instructorsRes.data : [];
  const instructor = instructors[course.titleEn.length % instructors.length];
  const onSale = course.salePriceEGP > 0 && course.salePriceEGP < course.priceEGP;
  const price = onSale ? course.salePriceEGP : course.priceEGP;
  const previewEmbed = youTubeEmbed(course.previewVideoUrl);

  const outcomes = [
    "Build and interpret professional models from scratch",
    "Apply industry frameworks to real business scenarios",
    "Make data-driven decisions with confidence",
    "Communicate insights to senior stakeholders",
    "Earn a verifiable, employer-recognized certificate",
    "Access lifetime updates and a peer community",
  ];

  const related = courses
    .filter((c) => c.id !== course.id && c.category === course.category)
    .slice(0, 4);

  const meta = [
    { icon: BarChart3, label: t("level"), value: course.difficulty },
    { icon: Clock, label: t("duration"), value: "12 weeks" },
    { icon: CalendarDays, label: t("startDate"), value: nextCohortStartDate(locale) },
    { icon: PlayCircle, label: t("lessons"), value: `${course.lectures}` },
    { icon: Globe, label: t("language"), value: "EN · AR" },
  ];

  // Long-form content for the new sections — prefer the active locale, fall back.
  const pick = (en?: string, ar?: string) =>
    (locale === "ar" ? ar || en : en || ar)?.trim() ?? "";
  const description = pick(course.descriptionEn, course.descriptionAr);
  const whoShouldAttend = pick(course.whoCanAttendEn, course.whoCanAttendAr);
  const isHtml = (s: string) => /<[a-z][\s\S]*>/i.test(s);
  const richBlock = (title: string, content: string) =>
    content ? (
      <div>
        <h2 className="font-heading text-xl font-semibold">{title}</h2>
        {isHtml(content) ? (
          <div
            dir={locale === "ar" ? "rtl" : "ltr"}
            className="prose prose-sm mt-4 max-w-none text-muted-foreground dark:prose-invert"
            dangerouslySetInnerHTML={{ __html: content }}
          />
        ) : (
          <p
            dir={locale === "ar" ? "rtl" : "ltr"}
            className="mt-4 whitespace-pre-line text-sm leading-relaxed text-muted-foreground"
          >
            {content}
          </p>
        )}
      </div>
    ) : null;

  const courseUrl = localeUrl(`/courses/${slug}`, locale);
  const courseTitle = locale === "ar" ? course.titleAr : course.titleEn;

  const enrollCard = (
    <div className="overflow-hidden rounded-2xl bg-card shadow-[0_12px_48px_rgba(15,23,42,0.14)] ring-1 ring-border/60">
      <div className="relative aspect-video bg-muted">
        {previewEmbed ? (
          <VideoFacade embedUrl={previewEmbed} thumbnail={course.thumbnailUrl} title={course.titleEn} />
        ) : (
          <>
            <Image
              src={course.thumbnailUrl}
              alt={course.titleEn}
              fill
              sizes="360px"
              className="object-cover"
            />
            <span className="absolute inset-0 grid place-items-center bg-black/20">
              <PlayCircle className="size-14 text-white/90" />
            </span>
          </>
        )}
      </div>
      <div className="space-y-4 p-5">
        <div className="flex items-baseline gap-2">
          <span className="font-heading text-3xl font-bold text-primary tabular-nums">
            {formatCurrency(price, "EGP")}
          </span>
          {onSale && (
            <span className="text-muted-foreground line-through tabular-nums">
              {formatCurrency(course.priceEGP, "EGP")}
            </span>
          )}
        </div>
        <CourseApplyDialog courseId={course.id} courseTitle={course.titleEn} />
        <ul className="space-y-2 pt-1 text-sm">
          {meta.map((m) => (
            <li key={m.label} className="flex items-center justify-between">
              <span className="inline-flex items-center gap-2 text-muted-foreground">
                <m.icon className="size-4" />
                {m.label}
              </span>
              <span className="font-medium">{m.value}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );

  return (
    <>
      <JsonLd
        data={[
          courseLd({
            name: courseTitle,
            description: metaDescription(description, courseTitle),
            url: courseUrl,
            image: course.thumbnailUrl,
            locale,
            price,
            currency: "EGP",
          }),
          breadcrumbLd([
            { name: locale === "ar" ? "الرئيسية" : "Home", url: localeUrl("/", locale) },
            { name: t("catalogTitle"), url: localeUrl("/courses", locale) },
            { name: courseTitle, url: courseUrl },
          ]),
        ]}
      />
      {/* Hero + floating enroll card */}
      <div className="overflow-x-hidden">
        <div className="mx-auto w-full max-w-[100rem] px-4 pt-4 sm:px-6 sm:pt-5 lg:px-8 lg:pt-6">
          <div className="mx-auto max-w-7xl">
            <section className="marketing-gradient-bg overflow-hidden rounded-2xl px-6 py-8 shadow-2xl shadow-blue-950/30 ring-1 ring-inset ring-white/10 sm:rounded-[1.75rem] sm:px-8 sm:py-9 lg:rounded-[2rem] lg:px-10 lg:py-10">
              <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between lg:gap-10">
                <div className="space-y-4 lg:max-w-3xl">
                  <h1 className="font-heading text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-[2.5rem] lg:leading-tight">
                    {course.titleEn}
                  </h1>
                  <CourseHeroMeta course={course} price={price} onSale={onSale} />
                </div>

                <p
                  className="text-base leading-relaxed text-white/80 sm:text-lg lg:max-w-[14rem] lg:shrink-0 lg:pt-8 lg:text-end xl:max-w-xs"
                  dir="rtl"
                >
                  {course.titleAr}
                </p>
              </div>
            </section>

            <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_380px] lg:items-start lg:gap-x-10 lg:-mt-1 xl:gap-x-12">
              <div className="min-w-0">
                <aside className="mt-6 lg:hidden">{enrollCard}</aside>

                <div className="space-y-10 py-8 sm:py-10 lg:pt-6 lg:pb-12">
                  {richBlock(t("courseDescription"), description)}
                  {richBlock(t("whoShouldAttend"), whoShouldAttend)}

                  <div>
                    <h2 className="font-heading text-xl font-semibold">{t("whatYouLearn")}</h2>
                    <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                      {outcomes.map((o) => (
                        <li key={o} className="flex items-start gap-2.5 text-sm">
                          <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-success" />
                          {o}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {course.modules?.length ? (
                    <div>
                      <h2 className="font-heading text-xl font-semibold">{t("curriculum")}</h2>
                      <div className="mt-4">
                        <CourseCurriculum modules={course.modules} locale={locale} />
                      </div>
                    </div>
                  ) : null}

                  <div>
                    <h2 className="font-heading text-xl font-semibold">{t("aboutInstructor")}</h2>
                    <div className="mt-4 flex items-start gap-4 rounded-xl border border-border/70 bg-card p-5">
                      <Avatar className="size-14 border">
                        <AvatarFallback className="bg-primary/10 text-lg font-semibold text-primary">
                          {getInitials(instructor?.label ?? "IM")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{instructor?.label}</p>
                        <p className="text-sm text-muted-foreground">{instructor?.title}</p>
                        <p className="mt-2 text-sm text-muted-foreground">
                          An experienced practitioner and educator with a track record of
                          helping professionals advance their careers across the MENA region.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <aside className="relative z-10 hidden lg:block">
                <div className="sticky top-24 -mt-32 xl:-mt-36">{enrollCard}</div>
              </aside>
            </div>
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <section className="mx-auto w-full max-w-[100rem] px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl py-14">
          <h2 className="font-heading text-2xl font-bold tracking-tight">
            {t("relatedCourses")}
          </h2>
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((c) => (
              <CourseCard key={c.id} course={c} />
            ))}
          </div>
          </div>
        </section>
      )}
    </>
  );
}
