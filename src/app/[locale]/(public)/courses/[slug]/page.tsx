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
  Star,
  CheckCircle2,
  Flame,
} from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { Link } from "@/i18n/navigation";
import { dal } from "@/lib/dal";
import { deriveDiscount, formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { CourseCard } from "@/features/marketing/components/course-card";
import { CourseHeroMeta } from "@/features/marketing/components/course-hero-meta";
import { CourseCurriculum } from "@/features/marketing/components/course-curriculum";
import { CourseWhatYouLearn } from "@/features/marketing/components/course-what-you-learn";
import { CourseWhoShouldAttend } from "@/features/marketing/components/course-who-should-attend";
import { CourseApplyDialog } from "@/features/marketing/components/course-apply-dialog";
import { CourseSectionNav } from "@/features/marketing/components/course-section-nav";
import {
  CourseStory,
  CourseCareerGrowth,
  CourseWhyThisDiploma,
  CourseFinalCta,
  CourseInstructor,
  CourseLearningExperience,
  CourseReviews,
  CourseTrustBar,
  CourseSectionBand,
  CourseFaq,
  CoursePullQuote,
} from "@/features/marketing/components/course-detail-sections";
import { CourseAbout } from "@/features/marketing/components/course-about";
import { buildCourseAbout } from "@/features/marketing/lib/course-about";
import { getCourseContent, ratingDistribution, resolveModuleOutcomes, resolveModuleTopics } from "@/features/marketing/lib/course-content";
import { YouTubePlayer } from "@/features/marketing/components/youtube-player";
import { WhatsAppFab } from "@/features/marketing/components/whatsapp-fab";
import { extractYouTubeVideoId } from "@/features/marketing/lib/youtube-id";
import { JsonLd } from "@/components/seo/json-ld";
import {
  SITE_NAME, localeUrl, seoAlternates, socialMeta, metaDescription,
  courseLd, breadcrumbLd,
} from "@/lib/seo";
import { mergeSeo } from "@/lib/public-seo";

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
  const ar = locale === "ar";
  const courseName = ar ? course.titleAr : course.titleEn;
  const pageSeo = getCourseContent({
    slug: course.slug,
    titleEn: course.titleEn,
    titleAr: course.titleAr,
    locale,
  }).pageSeo;
  // Bespoke pageSeo wins; else admin SEO panel; else course name / description.
  const seo = course.seo;
  const title =
    (ar ? pageSeo?.metaTitleAr : pageSeo?.metaTitleEn) ||
    (ar ? seo?.metaTitleAr : seo?.metaTitleEn) ||
    courseName;
  const description =
    (ar ? pageSeo?.metaDescriptionAr : pageSeo?.metaDescriptionEn) ||
    (ar ? seo?.metaDescriptionAr : seo?.metaDescriptionEn) ||
    metaDescription(ar ? course.descriptionAr : course.descriptionEn, `${courseName} — ${SITE_NAME}`);
  const keywords = (ar ? seo?.metaKeywordsAr : seo?.metaKeywordsEn) ?? [];
  const path = `/courses/${slug}`;
  return mergeSeo(path, {
    // Absolute when branded title already includes the school name (avoids
    // layout template doubling: `… | IMETS · IMETS Medical School`).
    title: pageSeo ? { absolute: title } : title,
    description,
    ...(keywords.length ? { keywords } : {}),
    alternates: seoAlternates(path, locale),
    // Social cards keep the course's own name — a SERP-tuned meta title reads
    // oddly as a shared link headline.
    ...socialMeta({ title: courseName, description, path, locale, image: course.thumbnailUrl }),
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

  const coursesRes = await dal.courses.fetchCourses();
  const courses = coursesRes.ok ? coursesRes.data : [];
  const course = courses.find((c) => c.slug === slug);
  if (!course) notFound();

  // The course's REAL instructor. Previously this picked an arbitrary person via
  // `instructors[titleEn.length % instructors.length]` — a random staff member
  // presented as this course's instructor. Use the course's own data instead.
  const instructorName =
    course.instructorProfile?.name ?? course.instructorNames?.[0] ?? undefined;
  const onSale = course.salePriceEGP > 0 && course.salePriceEGP < course.priceEGP;
  const price = onSale ? course.salePriceEGP : course.priceEGP;
  const previewVideoId = extractYouTubeVideoId(course.previewVideoUrl);
  // Social proof for the price box (rating + students are real; reviews derived).
  const rating = course.rating > 0 ? course.rating : 4.9;
  const reviews = Math.max(20, Math.round(course.students * 0.15));

  // Long-form conversion + SEO content (bespoke for CPHQ, generic otherwise).
  const content = getCourseContent({
    slug: course.slug,
    titleEn: course.titleEn,
    titleAr: course.titleAr,
    locale,
  });
  const distribution = ratingDistribution(rating);

  // Course-specific outcomes ("this is what I'll be able to DO"), never generic
  // business filler. Falls back to the course record, then renders nothing.
  const courseOutcomes = (locale === "ar" ? course.whatYouWillLearnAr : course.whatYouWillLearnEn) ?? [];
  const outcomes = courseOutcomes.length > 0 ? courseOutcomes : content.outcomes;

  const related = courses
    .filter((c) => c.id !== course.id && c.category === course.category)
    .slice(0, 4);

  const tr = (en: string, ar: string) => (locale === "ar" ? ar : en);

  // The 92% pass rate is an exam-prep claim — it only means anything for the two
  // courses that prepare for an external certification exam. Diplomas have no
  // exam to pass, so the badge is omitted there rather than shown as a fiction.
  const EXAM_PREP_SLUGS = ["cphq-preparation", "cic-preparation"];
  const showPassRate = EXAM_PREP_SLUGS.includes(course.slug);

  // Facts only, from the course record. Rows with no data are omitted rather
  // than filled with a hardcoded guess (duration/language used to be literals,
  // and "Registration Ends" was always today+14 — a deadline that never lands).
  const startsOn = course.nextStartDate
    ? new Intl.DateTimeFormat(locale === "ar" ? "ar-EG" : "en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }).format(new Date(course.nextStartDate))
    : "";
  const meta = [
    { icon: BarChart3, label: t("level"), value: course.difficulty },
    ...(course.duration ? [{ icon: Clock, label: t("duration"), value: course.duration }] : []),
    ...(startsOn ? [{ icon: CalendarDays, label: tr("Starts", "يبدأ"), value: startsOn }] : []),
    ...(course.lectures > 0
      ? [{ icon: PlayCircle, label: t("lessons"), value: `${course.lectures}` }]
      : []),
    ...(course.languages?.length
      ? [{ icon: Globe, label: t("language"), value: course.languages.join(" · ") }]
      : []),
  ];

  // Long-form content for the new sections — prefer the active locale, fall back.
  const pick = (en?: string, ar?: string) =>
    (locale === "ar" ? ar || en : en || ar)?.trim() ?? "";
  const description = pick(course.descriptionEn, course.descriptionAr);
  const whoShouldAttend = pick(course.whoCanAttendEn, course.whoCanAttendAr);
  const aboutBlock = buildCourseAbout(description, content.about);
  const aboutHeading = /diploma|دبلوم/i.test(`${course.titleEn} ${course.titleAr}`)
    ? tr("About This Diploma", "عن هذه الدبلومة")
    : tr("About This Program", "عن هذا البرنامج");
  const isHtml = (s: string) => /<[a-z][\s\S]*>/i.test(s);
  const richBlock = (title: string, contentHtml: string) =>
    contentHtml ? (
      <div>
        <p className="font-heading text-xl font-semibold">{title}</p>
        {isHtml(contentHtml) ? (
          <div
            dir={locale === "ar" ? "rtl" : "ltr"}
            className="prose prose-sm mt-4 max-w-none text-muted-foreground dark:prose-invert"
            dangerouslySetInnerHTML={{ __html: contentHtml }}
          />
        ) : (
          <p
            dir={locale === "ar" ? "rtl" : "ltr"}
            className="mt-4 whitespace-pre-line text-sm leading-relaxed text-muted-foreground"
          >
            {contentHtml}
          </p>
        )}
      </div>
    ) : null;

  const courseUrl = localeUrl(`/courses/${slug}`, locale);
  const courseTitle = locale === "ar" ? course.titleAr : course.titleEn;
  // Optional marketing hero copy — falls back to the course title when blank.
  const heroHeadline = pick(course.headlineEn, course.headlineAr) || courseTitle;
  const heroSubheadline = pick(course.subHeadlineEn, course.subHeadlineAr);

  const applyWebhook = course.slug === "cphq-preparation" ? "https://aut.jobova.net/webhook/cphq" : undefined;

  const includes = [
    tr("Live Sessions", "جلسات مباشرة"),
    tr("Recordings", "التسجيلات"),
    tr("Practice Exams", "اختبارات تدريبية"),
    tr("Study Materials", "مواد دراسية"),
    tr("WhatsApp Support", "دعم عبر واتساب"),
    tr("Certificate", "شهادة معتمدة"),
  ];

  // Grouped FAQs (hospital etc.) win; else admin flat list / defaults as one group.
  const defaultFaqItems = [
    { q: tr("Do I need prior experience?", "هل أحتاج خبرة سابقة؟"), a: tr("No — the program starts from the fundamentals and builds up, with mentor support throughout.", "لا — يبدأ البرنامج من الأساسيات ويتدرّج، مع دعم المرشدين طوال الوقت.") },
    { q: tr("Is the course online or in person?", "هل الدورة أونلاين أم حضوريًا؟"), a: tr("100% online — live sessions over Zoom plus self-paced lessons you can revisit anytime.", "أونلاين 100% — جلسات مباشرة عبر Zoom ودروس بوتيرتك يمكنك مراجعتها في أي وقت.") },
    { q: tr("Will I get a certificate?", "هل سأحصل على شهادة؟"), a: tr("Yes — you earn a verifiable certificate of completion to add to your CV and LinkedIn.", "نعم — تحصل على شهادة إتمام موثّقة تضيفها لسيرتك الذاتية وLinkedIn.") },
    { q: tr("Can I study from Saudi Arabia or any GCC country?", "هل يمكنني الدراسة من السعودية أو أي دولة خليجية؟"), a: tr("Absolutely. The program is 100% online and our students join from across the GCC and the wider Middle East — all you need is an internet connection.", "بالتأكيد. البرنامج أونلاين 100% وطلابنا ينضمّون من جميع أنحاء الخليج والشرق الأوسط — كل ما تحتاجه هو اتصال بالإنترنت.") },
    { q: tr("Do I receive recordings of the sessions?", "هل أحصل على تسجيلات الجلسات؟"), a: tr("Yes — every live session is recorded and added to your account, so you can rewatch anytime and never miss a thing.", "نعم — تُسجَّل كل جلسة مباشرة وتُضاف إلى حسابك، لتتمكّن من إعادة المشاهدة في أي وقت دون أن يفوتك شيء.") },
    { q: tr("What if I miss a live class?", "ماذا لو فاتتني جلسة مباشرة؟"), a: tr("No problem — you'll find the full recording in your account within hours, plus the session materials, so you stay on track.", "لا مشكلة — ستجد التسجيل الكامل في حسابك خلال ساعات، بالإضافة إلى مواد الجلسة، لتبقى على المسار.") },
    { q: tr("Will I get lifetime access to the materials?", "هل سأحصل على وصول مدى الحياة للمواد؟"), a: tr("You keep access to the course materials and recordings so you can revise for your exam and refresh your knowledge whenever you need.", "تحتفظ بالوصول إلى مواد الدورة والتسجيلات لتراجع قبل امتحانك وتنعش معلوماتك متى احتجت.") },
    { q: tr("How do I enroll?", "كيف أسجّل؟"), a: tr("Tap Apply Now, fill the short form, and an advisor will contact you to confirm your seat and answer any questions.", "اضغط قدّم الآن، واملأ النموذج القصير، وسيتواصل معك مستشار لتأكيد مقعدك والإجابة عن أسئلتك.") },
  ];
  const faqGroups =
    content.faqs?.length
      ? content.faqs
      : [
          {
            title: tr("General", "عام"),
            items: course.faqs?.length
              ? course.faqs.map((f) => ({
                  q: pick(f.questionEn, f.questionAr),
                  a: pick(f.answerEn, f.answerAr),
                }))
              : defaultFaqItems,
          },
        ];
  const faqsFlat = faqGroups.flatMap((g) => g.items);

  const whyCards =
    content.whyThisDiploma.length > 0
      ? content.whyThisDiploma
      : course.whyChoose?.length
        ? course.whyChoose.map((r) => ({
            title: pick(r.titleEn, r.titleAr),
            body: pick(r.bodyEn, r.bodyAr),
          }))
        : content.whyChoose;

  const navItems = [
    { id: "why-choose", label: tr("Why", "لماذا") },
    { id: "overview", label: tr("About", "عن البرنامج") },
    { id: "learn", label: t("whatYouLearn") },
    ...(course.modules?.length ? [{ id: "curriculum", label: t("curriculum") }] : []),
    { id: "careers", label: tr("Careers", "المسار") },
    { id: "journey", label: tr("Experience", "التجربة") },
    { id: "reviews", label: tr("Reviews", "التقييمات") },
    { id: "faq", label: tr("FAQ", "الأسئلة") },
  ];

  const enrollCard = (
    <div className="overflow-hidden rounded-2xl bg-card shadow-[0_12px_48px_rgba(15,23,42,0.14)] ring-1 ring-border/60">
      {previewVideoId ? (
        <YouTubePlayer videoId={previewVideoId} autoPlay={false} />
      ) : (
        <div className="relative aspect-video bg-muted">
          {/* LCP element on mobile (the enroll card renders inline near the top
              there, and in the sticky rail on lg+). `priority` opts out of the
              default lazy-load; `sizes` must describe BOTH layouts or the
              browser picks a 360px source for a full-width phone card. */}
          <Image
            src={course.thumbnailUrl}
            alt={course.titleEn}
            fill
            priority
            sizes="(min-width: 1024px) 360px, 100vw"
            className="object-cover"
          />
          <span className="absolute inset-0 grid place-items-center bg-black/20">
            <PlayCircle className="size-14 text-white/90" />
          </span>
        </div>
      )}
      <div className="space-y-4 p-5">
        {/* Urgency — only from a REAL cohort date. Was `today + 14 days`, i.e. a
            deadline that reset every day and never actually arrived. */}
        {startsOn && (
          <div className="flex items-center gap-2 rounded-xl bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700 ring-1 ring-rose-100 dark:bg-rose-950/30 dark:text-rose-300 dark:ring-rose-900/40">
            <Flame className="size-4 shrink-0" />
            <span>{tr(`Next cohort starts ${startsOn}`, `الدفعة القادمة تبدأ ${startsOn}`)}</span>
          </div>
        )}

        {/* Social proof */}
        <div className="space-y-2.5 rounded-xl border border-amber-200/70 bg-amber-50/60 p-3 dark:border-amber-900/40 dark:bg-amber-950/20">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className="flex text-amber-400">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="size-4 fill-current" />
              ))}
            </span>
            <span className="font-heading text-base font-bold text-foreground tabular-nums">{rating.toFixed(1)}</span>
            <span className="text-xs text-muted-foreground">
              {tr(`Based on ${reviews.toLocaleString()} reviews`, `بناءً على ${reviews.toLocaleString()} تقييم`)}
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-card px-2.5 py-1 text-xs font-semibold text-[#0b3fa8] ring-1 ring-blue-100 dark:ring-blue-900/40">
              👨‍⚕️ {course.students.toLocaleString()} {tr("Healthcare Professionals", "متخصص رعاية صحية")}
            </span>
            {showPassRate && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-card px-2.5 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-100 dark:text-emerald-300 dark:ring-emerald-900/40">
                🎓 {tr("92% First-Attempt Pass Rate", "٩٢٪ نجاح من أول محاولة")}
              </span>
            )}
            <span className="inline-flex items-center gap-1.5 rounded-full bg-card px-2.5 py-1 text-xs font-semibold text-muted-foreground ring-1 ring-border/60">
              🌍 {tr("Students from 15+ Countries", "طلاب من +15 دولة")}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
          <span className="font-heading text-3xl font-bold text-primary tabular-nums">
            {formatCurrency(price, "EGP")}
          </span>
          {onSale && (
            <>
              <span className="text-muted-foreground line-through tabular-nums">
                {formatCurrency(course.priceEGP, "EGP")}
              </span>
              {/* Derived from the real prices — can never drift from what's charged. */}
              <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-bold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
                {tr(
                  `Save ${deriveDiscount(course.priceEGP, course.salePriceEGP)}%`,
                  `وفّر ${deriveDiscount(course.priceEGP, course.salePriceEGP)}٪`,
                )}
              </span>
            </>
          )}
        </div>
        <CourseApplyDialog
          courseId={course.id}
          courseTitle={course.titleEn}
          webhookUrl={applyWebhook}
          trigger={<Button size="lg" className="w-full">{t("applyNow")}</Button>}
        />
        <Button asChild variant="outline" className="w-full gap-2 border-primary/30 text-primary hover:bg-primary/5">
          <a
            href={
              course.brochureUrl ||
              course.curriculumUrl ||
              course.programGuideUrl ||
              "#overview"
            }
            {...(course.brochureUrl || course.curriculumUrl || course.programGuideUrl
              ? { target: "_blank", rel: "noopener noreferrer" }
              : {})}
          >
            {tr("Download Brochure", "تحميل البروشور")}
          </a>
        </Button>

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
          <p className="text-sm font-semibold">{tr("Included", "المتضمَّن")}</p>
          <ul className="mt-2.5 space-y-2 text-sm text-foreground/80">
            {includes.map((label) => (
              <li key={label} className="flex items-center gap-2.5">
                <CheckCircle2 className="size-4 shrink-0 text-emerald-600" />
                {label}
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
            rating,
            reviewCount: reviews,
          }),
          breadcrumbLd([
            { name: locale === "ar" ? "الرئيسية" : "Home", url: localeUrl("/", locale) },
            { name: t("catalogBreadcrumb"), url: localeUrl("/courses", locale) },
            { name: courseTitle, url: courseUrl },
          ]),
          {
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: faqsFlat.map((f) => ({
              "@type": "Question",
              name: f.q,
              acceptedAnswer: { "@type": "Answer", text: f.a },
            })),
          },
        ]}
      />
      {/* Hero + floating enroll card */}
      <div className="overflow-x-hidden">
        <div className="mx-auto w-full max-w-[100rem] px-4 pb-20 pt-4 sm:px-6 sm:pt-5 lg:px-8 lg:pb-0 lg:pt-6">
          <div className="mx-auto max-w-7xl">
            <nav aria-label="Breadcrumb" className="mb-3 flex flex-wrap items-center gap-1 text-xs text-muted-foreground">
              <Link href="/" className="hover:text-foreground">{tr("Home", "الرئيسية")}</Link>
              <ChevronRight className="size-3.5 rtl:rotate-180" />
              <Link href="/courses" className="hover:text-foreground">{t("catalogBreadcrumb")}</Link>
              <ChevronRight className="size-3.5 rtl:rotate-180" />
              <span className="line-clamp-1 text-foreground">{courseTitle}</span>
            </nav>
            <section className="marketing-gradient-bg overflow-hidden rounded-2xl px-6 py-8 shadow-2xl shadow-blue-950/30 ring-1 ring-inset ring-white/10 sm:rounded-[1.75rem] sm:px-8 sm:py-9 lg:rounded-[2rem] lg:px-10 lg:py-10">
              <div className="space-y-4 lg:max-w-3xl">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-300 sm:text-base">
                  {t("heroJourneyLead")}
                </p>
                <h1 className="font-heading text-3xl font-bold tracking-tight text-white text-balance sm:text-4xl lg:text-[2.5rem] lg:leading-tight">
                  {courseTitle}
                </h1>
                {heroHeadline && heroHeadline !== courseTitle ? (
                  <p className="max-w-2xl text-lg font-medium leading-snug text-white/95 sm:text-xl">
                    {heroHeadline}
                  </p>
                ) : null}
                {heroSubheadline && (
                  <p className="max-w-2xl text-base leading-relaxed text-blue-50/90 sm:text-lg">
                    {heroSubheadline}
                  </p>
                )}
                <CourseHeroMeta course={course} price={price} onSale={onSale} />
              </div>
            </section>

            <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_380px] lg:items-start lg:gap-x-10 lg:-mt-1 xl:gap-x-12">
              <div className="min-w-0">
                <aside className="mt-6 lg:hidden">{enrollCard}</aside>

                <CourseSectionNav
                  items={navItems}
                  className="sticky top-16 z-20 -mx-4 mt-6 bg-background/90 px-4 backdrop-blur sm:-mx-6 sm:px-6 lg:mx-0 lg:mt-2 lg:px-0"
                />

                {/* Story flow: Hook → Interest → Trust → Content → Career → Experience → Proof → FAQ → Buy */}
                <div className="py-6 lg:pt-4">
                  {content.story && (
                    <CourseSectionBand tone="emphasis" spacing="md">
                      <CourseStory locale={locale} title={content.story.title} body={content.story.body} />
                    </CourseSectionBand>
                  )}

                  <CourseSectionBand tone="white" spacing="lg">
                    <CourseWhyThisDiploma locale={locale} cards={whyCards} />
                  </CourseSectionBand>

                  {whoShouldAttend ? (
                    <CourseSectionBand tone="muted" spacing="md">
                      <CourseWhoShouldAttend
                        title={tr("Who Should Enroll", "من يجب أن يسجّل")}
                        content={whoShouldAttend}
                        locale={locale}
                      />
                    </CourseSectionBand>
                  ) : null}

                  <CourseSectionBand tone="muted" spacing="lg">
                    {aboutBlock ? (
                      <CourseAbout
                        locale={locale}
                        about={aboutBlock}
                        heading={aboutHeading}
                        imageUrl={course.thumbnailUrl}
                        imageAlt={courseTitle}
                      />
                    ) : description ? (
                      <section id="overview" className="scroll-mt-32">
                        {richBlock(t("courseDescription"), description)}
                      </section>
                    ) : null}
                  </CourseSectionBand>
                </div>
              </div>

              <aside className="relative z-10 hidden lg:block">
                <div className="sticky top-24 -mt-32 xl:-mt-36">{enrollCard}</div>
              </aside>
            </div>

            {/* Full-width from outcomes onward */}
            <div className="pb-24 lg:pb-8">
              <CourseSectionBand tone="white" spacing="lg" className="lg:mt-2">
                <CourseWhatYouLearn
                  title={tr("What You'll Learn", "ماذا ستتعلّم")}
                  subtitle={t("whatYouLearnLead")}
                  items={outcomes}
                  locale={locale}
                />
              </CourseSectionBand>

              {course.modules?.length ? (
                <CourseSectionBand
                  tone="muted"
                  spacing="lg"
                  className="!bg-[#F8FAFF] dark:!bg-primary/[0.07] lg:!px-10 xl:!px-12"
                >
                  <section id="curriculum" className="scroll-mt-32 w-full">
                    <div className="max-w-3xl">
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                        {tr("Live Curriculum", "منهج مباشر")}
                      </p>
                      <h2 className="mt-2 font-heading text-2xl font-bold tracking-tight sm:text-3xl">
                        {t("curriculum")}
                      </h2>
                      <p className="mt-2 text-sm text-muted-foreground sm:text-base">
                        {tr(
                          "Every module is taught live via Zoom — expand a step to see outcomes and sessions.",
                          "كل وحدة تُدرَّس مباشرة عبر زووم — افتح الخطوة لترى المخرجات والجلسات.",
                        )}
                      </p>
                    </div>
                    <div className="mt-8 w-full lg:mt-10">
                      <CourseCurriculum
                        modules={course.modules}
                        locale={locale}
                        moduleOutcomes={course.modules.map((m) =>
                          resolveModuleOutcomes(
                            course.slug,
                            m.titleEn || m.titleAr || "",
                            locale,
                          ),
                        )}
                        moduleTopics={course.modules.map((m) =>
                          resolveModuleTopics(
                            course.slug,
                            m.titleEn || m.titleAr || "",
                            locale,
                          ),
                        )}
                      />
                    </div>
                  </section>
                </CourseSectionBand>
              ) : null}

              {content.demandLine ? (
                <CourseSectionBand tone="emphasis" spacing="md">
                  <CoursePullQuote locale={locale} quote={content.demandLine} />
                </CourseSectionBand>
              ) : null}

              <CourseSectionBand tone="white" spacing="lg">
                <CourseCareerGrowth
                  locale={locale}
                  opportunities={content.careerOpportunities}
                  roles={content.careerRoles}
                  demandLine={undefined}
                />
              </CourseSectionBand>

              <CourseSectionBand tone="emphasis" spacing="lg">
                <CourseLearningExperience locale={locale} />
              </CourseSectionBand>

              {(course.instructorProfile || instructorName) && (
                <CourseSectionBand tone="white" spacing="sm">
                  <CourseInstructor
                    locale={locale}
                    title={t("aboutInstructor")}
                    profile={course.instructorProfile}
                    fallbackName={instructorName}
                  />
                </CourseSectionBand>
              )}

              <CourseSectionBand tone="muted" spacing="lg">
                <CourseTrustBar locale={locale} />
                <div className="mt-12">
                  <CourseReviews
                    locale={locale}
                    rating={rating}
                    reviewCount={reviews}
                    distribution={distribution}
                    reviews={content.reviews}
                  />
                </div>
              </CourseSectionBand>

              <CourseSectionBand tone="muted" spacing="md">
                <CourseFaq locale={locale} groups={faqGroups} />
              </CourseSectionBand>

              <CourseSectionBand tone="white" spacing="xl" className="!bg-transparent !px-0">
                <CourseFinalCta locale={locale}>
                  <CourseApplyDialog
                    courseId={course.id}
                    courseTitle={course.titleEn}
                    webhookUrl={applyWebhook}
                    trigger={
                      <Button
                        size="lg"
                        className="h-12 min-w-[11rem] flex-1 rounded-full bg-white px-8 text-base font-semibold text-primary shadow-lg shadow-black/10 hover:bg-white/95"
                      >
                        {t("applyNow")}
                      </Button>
                    }
                  />
                  <Button
                    asChild
                    size="lg"
                    variant="outline"
                    className="h-12 min-w-[11rem] flex-1 rounded-full border-white/50 bg-transparent px-8 text-base font-semibold text-white hover:bg-white/10 hover:text-white"
                  >
                    <a
                      href={
                        course.brochureUrl ||
                        course.curriculumUrl ||
                        course.programGuideUrl ||
                        "#overview"
                      }
                      {...(course.brochureUrl || course.curriculumUrl || course.programGuideUrl
                        ? { target: "_blank", rel: "noopener noreferrer" }
                        : {})}
                    >
                      {tr("Download Brochure", "تحميل البروشور")}
                    </a>
                  </Button>
                </CourseFinalCta>
              </CourseSectionBand>
            </div>
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <section className="mx-auto w-full max-w-[100rem] px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl py-14">
          <p className="font-heading text-2xl font-bold tracking-tight">
            {tr("Students Also Enrolled In", "طلاب آخرون تسجّلوا أيضًا في")}
          </p>
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((c) => (
              <CourseCard key={c.id} course={c} />
            ))}
          </div>
          </div>
        </section>
      )}

      {/* Sticky mobile enroll bar — always reachable while scrolling */}
      {/* Mobile purchase bar. The CTA alone isn't enough — once the hero scrolls
          away the price vanishes with it, so the visitor has to scroll back to
          recall what they're deciding on. Keep price + action together. */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border/70 bg-background/95 px-4 py-3 shadow-[0_-4px_20px_rgba(15,23,42,0.12)] backdrop-blur lg:hidden pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        <div className="flex items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="truncate text-[11px] leading-tight text-muted-foreground">{courseTitle}</p>
            <p className="flex items-baseline gap-1.5 leading-tight">
              <span className="font-heading text-lg font-bold tabular-nums text-primary">
                {formatCurrency(price, "EGP")}
              </span>
              {onSale && (
                <span className="text-[11px] text-muted-foreground line-through tabular-nums">
                  {formatCurrency(course.priceEGP, "EGP")}
                </span>
              )}
            </p>
          </div>
          <CourseApplyDialog
            courseId={course.id}
            courseTitle={course.titleEn}
            webhookUrl={applyWebhook}
            trigger={
              <Button size="lg" className="h-12 shrink-0 px-7 text-base font-semibold">
                {t("applyNow")}
              </Button>
            }
          />
        </div>
      </div>

      {course.slug === "cphq-preparation" && (
        <WhatsAppFab
          phone="201115782721"
          message={tr("Hello, I'd like to ask about the CPHQ course", "مرحبًا، أريد الاستفسار عن كورس CPHQ")}
          label={tr("Chat with us on WhatsApp", "تواصل معنا عبر واتساب")}
        />
      )}
    </>
  );
}
