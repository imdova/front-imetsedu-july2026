import { notFound } from "next/navigation";
import Image from "next/image";
import {
  Star,
  Users,
  Clock,
  BarChart3,
  PlayCircle,
  CheckCircle2,
  Globe,
} from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { Link } from "@/i18n/navigation";
import { dal } from "@/lib/dal";
import { formatCompact, formatCurrency, getInitials } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { CourseCard } from "@/features/marketing/components/course-card";
import { CourseCurriculum } from "@/features/marketing/components/course-curriculum";
import { CourseApplyDialog } from "@/features/marketing/components/course-apply-dialog";

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

  return (
    <>
      {/* Hero */}
      <section className="border-b border-border/70 bg-gradient-to-b from-primary/5 to-background">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1fr_360px] lg:px-8">
          <div className="space-y-5">
            <Badge variant="secondary">{course.category}</Badge>
            <h1 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl">
              {course.titleEn}
            </h1>
            <p className="text-lg text-muted-foreground" dir="rtl">
              {course.titleAr}
            </p>
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted-foreground">
              {course.rating > 0 && (
                <span className="inline-flex items-center gap-1">
                  <Star className="size-4 fill-warning text-warning" />
                  <span className="font-medium text-foreground">
                    {course.rating.toFixed(1)}
                  </span>
                </span>
              )}
              <span className="inline-flex items-center gap-1">
                <Users className="size-4" />
                {formatCompact(course.students)} {t("students")}
              </span>
              <span className="inline-flex items-center gap-2">
                <Avatar className="size-6 border">
                  <AvatarFallback className="bg-primary/10 text-[10px] text-primary">
                    {getInitials(instructor?.label ?? "IM")}
                  </AvatarFallback>
                </Avatar>
                {instructor?.label}
              </span>
            </div>
          </div>

          {/* Enroll card */}
          <aside className="lg:row-span-2">
            <div className="overflow-hidden rounded-2xl border border-border/70 bg-card shadow-lg lg:sticky lg:top-20">
              <div className="relative aspect-video bg-muted">
                {previewEmbed ? (
                  <iframe
                    src={previewEmbed}
                    title={course.titleEn}
                    className="absolute inset-0 size-full"
                    allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
                    allowFullScreen
                  />
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
          </aside>

          {/* Body */}
          <div className="space-y-10 lg:col-start-1">
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
      </section>

      {related.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <h2 className="font-heading text-2xl font-bold tracking-tight">
            {t("relatedCourses")}
          </h2>
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((c) => (
              <CourseCard key={c.id} course={c} />
            ))}
          </div>
        </section>
      )}
    </>
  );
}
