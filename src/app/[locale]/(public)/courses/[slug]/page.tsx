import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import {
  Clock,
  BarChart3,
  PlayCircle,
  Globe,
  CalendarDays,
  Award,
  Infinity as InfinityIcon,
  ChevronRight,
} from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { Link } from "@/i18n/navigation";
import { dal } from "@/lib/dal";
import { formatCurrency, getInitials } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { CourseCard } from "@/features/marketing/components/course-card";
import { CourseHeroMeta } from "@/features/marketing/components/course-hero-meta";
import { CourseCurriculum } from "@/features/marketing/components/course-curriculum";
import { CourseWhatYouLearn } from "@/features/marketing/components/course-what-you-learn";
import { CourseWhoShouldAttend } from "@/features/marketing/components/course-who-should-attend";
import { CourseApplyDialog } from "@/features/marketing/components/course-apply-dialog";
import { CourseSectionNav } from "@/features/marketing/components/course-section-nav";
import { VideoFacade } from "@/features/marketing/components/video-facade";
import { extractYouTubeVideoId } from "@/features/marketing/lib/youtube-id";
import { JsonLd } from "@/components/seo/json-ld";
import {
  SITE_NAME, localeUrl, seoAlternates, socialMeta, metaDescription,
  courseLd, breadcrumbLd,
} from "@/lib/seo";
import { mergeSeo } from "@/lib/public-seo";


/** Registration deadline — always two weeks from today. */
function registrationEndDate(locale: string): string {
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
  const previewVideoId = extractYouTubeVideoId(course.previewVideoUrl);

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
    { icon: CalendarDays, label: t("startDate"), value: registrationEndDate(locale) },
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

  const tr = (en: string, ar: string) => (locale === "ar" ? ar : en);

  const includes = [
    { icon: PlayCircle, label: `${course.lectures} ${tr("live & on-demand lessons", "درسًا مباشرًا وعند الطلب")}` },
    { icon: Globe, label: tr("English & Arabic", "الإنجليزية والعربية") },
    { icon: Award, label: tr("Certificate of completion", "شهادة إتمام") },
    { icon: InfinityIcon, label: tr("Lifetime access to materials", "وصول مدى الحياة للمواد") },
  ];

  const faqs = [
    { q: tr("Do I need prior experience?", "هل أحتاج خبرة سابقة؟"), a: tr("No — the program starts from the fundamentals and builds up, with mentor support throughout.", "لا — يبدأ البرنامج من الأساسيات ويتدرّج، مع دعم المرشدين طوال الوقت.") },
    { q: tr("Is the course online or in person?", "هل الدورة أونلاين أم حضوريًا؟"), a: tr("100% online — live sessions over Zoom plus self-paced lessons you can revisit anytime.", "أونلاين 100% — جلسات مباشرة عبر Zoom ودروس بوتيرتك يمكنك مراجعتها في أي وقت.") },
    { q: tr("Will I get a certificate?", "هل سأحصل على شهادة؟"), a: tr("Yes — you earn a verifiable certificate of completion to add to your CV and LinkedIn.", "نعم — تحصل على شهادة إتمام موثّقة تضيفها لسيرتك الذاتية وLinkedIn.") },
    { q: tr("How do I enroll?", "كيف أسجّل؟"), a: tr("Tap Apply now, fill the short form, and an advisor will contact you to confirm your seat and answer any questions.", "اضغط قدّم الآن، واملأ النموذج القصير، وسيتواصل معك مستشار لتأكيد مقعدك والإجابة عن أسئلتك.") },
  ];

  const navItems = [
    { id: "overview", label: tr("Overview", "نظرة عامة") },
    { id: "learn", label: t("whatYouLearn") },
    ...(course.modules?.length ? [{ id: "curriculum", label: t("curriculum") }] : []),
    { id: "instructor", label: t("aboutInstructor") },
    { id: "faq", label: tr("FAQ", "الأسئلة الشائعة") },
  ];

  const enrollCard = (
    <div className="overflow-hidden rounded-2xl bg-card shadow-[0_12px_48px_rgba(15,23,42,0.14)] ring-1 ring-border/60">
      <div className="relative aspect-video bg-muted">
        {previewVideoId ? (
          <VideoFacade
            videoId={previewVideoId}
            thumbnail={course.thumbnailUrl}
            title={course.titleEn}
            autoPlay
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
        <div className="border-t border-border/60 pt-4">
          <p className="text-sm font-semibold">{tr("This course includes", "تشمل هذه الدورة")}</p>
          <ul className="mt-2.5 space-y-2 text-sm text-muted-foreground">
            {includes.map((i) => (
              <li key={i.label} className="flex items-center gap-2.5">
                <i.icon className="size-4 shrink-0 text-primary" />
                {i.label}
              </li>
            ))}
          </ul>
        </div>
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
          {
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: faqs.map((f) => ({
              "@type": "Question",
              name: f.q,
              acceptedAnswer: { "@type": "Answer", text: f.a },
            })),
          },
        ]}
      />
      {/* Hero + floating enroll card */}
      <div className="overflow-x-hidden">
        <div className="mx-auto w-full max-w-[100rem] px-4 pt-4 sm:px-6 sm:pt-5 lg:px-8 lg:pt-6">
          <div className="mx-auto max-w-7xl">
            <nav aria-label="Breadcrumb" className="mb-3 flex flex-wrap items-center gap-1 text-xs text-muted-foreground">
              <Link href="/" className="hover:text-foreground">{tr("Home", "الرئيسية")}</Link>
              <ChevronRight className="size-3.5 rtl:rotate-180" />
              <Link href="/courses" className="hover:text-foreground">{t("catalogTitle")}</Link>
              <ChevronRight className="size-3.5 rtl:rotate-180" />
              <span className="line-clamp-1 text-foreground">{courseTitle}</span>
            </nav>
            <section className="marketing-gradient-bg overflow-hidden rounded-2xl px-6 py-8 shadow-2xl shadow-blue-950/30 ring-1 ring-inset ring-white/10 sm:rounded-[1.75rem] sm:px-8 sm:py-9 lg:rounded-[2rem] lg:px-10 lg:py-10">
              <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between lg:gap-10">
                <div className="space-y-4 lg:max-w-3xl">
                  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-300 sm:text-base">
                    {t("heroJourneyLead")}
                  </p>
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

                <CourseSectionNav
                  items={navItems}
                  className="sticky top-16 z-20 -mx-4 mt-6 bg-background/90 px-4 backdrop-blur sm:-mx-6 sm:px-6 lg:mx-0 lg:mt-2 lg:px-0"
                />

                <div className="space-y-12 py-8 sm:py-10 lg:pt-8 lg:pb-12">
                  <section id="overview" className="scroll-mt-32">
                    {richBlock(t("courseDescription"), description)}
                  </section>

                  <CourseWhatYouLearn
                    title={t("whatYouLearn")}
                    subtitle={t("whatYouLearnLead")}
                    items={outcomes}
                    locale={locale}
                  />

                  {course.modules?.length ? (
                    <section id="curriculum" className="scroll-mt-32">
                      <h2 className="font-heading text-xl font-semibold">{t("curriculum")}</h2>
                      <div className="mt-4">
                        <CourseCurriculum modules={course.modules} locale={locale} />
                      </div>
                    </section>
                  ) : null}

                  {whoShouldAttend ? (
                    <CourseWhoShouldAttend
                      title={t("whoShouldAttend")}
                      content={whoShouldAttend}
                      locale={locale}
                    />
                  ) : null}

                  <section id="instructor" className="scroll-mt-32">
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
                  </section>

                  <section id="faq" className="scroll-mt-32">
                    <h2 className="font-heading text-xl font-semibold">{tr("Frequently asked questions", "الأسئلة الشائعة")}</h2>
                    <div className="mt-4 space-y-3">
                      {faqs.map((f) => (
                        <details key={f.q} className="group rounded-xl border border-border/70 bg-card px-5 py-4">
                          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-medium">
                            {f.q}
                            <ChevronRight className="size-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-90 rtl:rotate-180 rtl:group-open:-rotate-90" />
                          </summary>
                          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{f.a}</p>
                        </details>
                      ))}
                    </div>
                  </section>
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

      {/* Sticky mobile enroll bar */}
      <div className="fixed inset-x-0 bottom-0 z-40 flex items-center gap-3 border-t border-border/70 bg-background/95 px-4 py-2.5 shadow-[0_-4px_20px_rgba(15,23,42,0.10)] backdrop-blur lg:hidden">
        <div className="min-w-0 leading-tight">
          <p className="font-heading text-xl font-bold text-primary tabular-nums">{formatCurrency(price, "EGP")}</p>
          {onSale && (
            <p className="text-xs text-muted-foreground line-through tabular-nums">
              {formatCurrency(course.priceEGP, "EGP")}
            </p>
          )}
        </div>
        <div className="ms-auto w-44 shrink-0">
          <CourseApplyDialog
            courseId={course.id}
            courseTitle={course.titleEn}
            trigger={<Button size="lg" className="w-full">{t("applyNow")}</Button>}
          />
        </div>
      </div>
    </>
  );
}
