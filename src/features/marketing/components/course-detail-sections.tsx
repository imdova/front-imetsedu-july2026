/**
 * Conversion + SEO sections for the course detail page.
 *
 * These are static server components (no client state) styled to match the
 * existing detail-page design language: `primary` blue, amber accents,
 * `card`/`border` surfaces, emerald "included" ticks. Each is self-contained and
 * driven entirely by props so the page can compose them for any course.
 */
import type { ReactNode } from "react";
import {
  Star,
  ClipboardCheck,
  MessageSquare,
  Rocket,
  Compass,
  Video,
  PencilLine,
  FileCheck2,
  Award,
  Quote,
  CheckCircle2,
  Users,
  ExternalLink,
  Download,
  ChevronRight,
  Check,
} from "lucide-react";

import { cn, getInitials } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import type { CourseRow } from "@/types";
import type {
  CareerOpportunity,
  CareerRole,
  CourseReview,
  FaqGroup,
  SeoSection,
} from "@/features/marketing/lib/course-content";
import { CareerRoadmapTimeline } from "@/features/marketing/components/career-roadmap-timeline";
import { CountUp } from "@/features/marketing/components/count-up";

const tr = (locale: string, en: string, ar: string) =>
  locale === "ar" ? ar : en;

/** Alternating page bands — white / muted / emphasis for visual rhythm. */
export function CourseSectionBand({
  tone = "white",
  spacing = "md",
  children,
  className,
}: {
  tone?: "white" | "muted" | "emphasis";
  spacing?: "sm" | "md" | "lg" | "xl";
  children: ReactNode;
  className?: string;
}) {
  const toneClass =
    tone === "muted"
      ? "bg-slate-50/90 dark:bg-muted/30"
      : tone === "emphasis"
        ? "bg-primary/[0.045] dark:bg-primary/10"
        : "bg-background";
  const spaceClass =
    spacing === "sm"
      ? "py-10 sm:py-12"
      : spacing === "lg"
        ? "py-16 sm:py-20"
        : spacing === "xl"
          ? "py-20 sm:py-24"
          : "py-12 sm:py-16";
  return (
    <div
      className={cn(
        "-mx-4 px-4 sm:-mx-6 sm:px-6 lg:mx-0 lg:rounded-3xl lg:px-8",
        toneClass,
        spaceClass,
        className,
      )}
    >
      {children}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Story — emotional hook right under the hero                          */
/* ------------------------------------------------------------------ */

/* ------------------------------------------------------------------ */
/* Career Growth — role cards + roadmap in one section                 */
/* ------------------------------------------------------------------ */
export function CourseCareerGrowth({
  locale,
  opportunities,
  roles,
  demandLine,
}: {
  locale: string;
  opportunities: CareerOpportunity[];
  roles: CareerRole[];
  demandLine?: string;
}) {
  if (!opportunities.length && !roles.length) return null;
  return (
    <section id="careers" className="scroll-mt-32">
      <h2 className="font-heading text-2xl font-bold tracking-tight">
        {tr(locale, "Career Outcomes", "المخرجات المهنية")}
      </h2>
      <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
        {tr(
          locale,
          "After completing this program, you may qualify for roles such as:",
          "بعد إتمام هذا البرنامج، قد تكون مؤهلًا لأدوار مثل:",
        )}
      </p>

      {demandLine && (
        <p className="mt-5 rounded-xl border border-primary/15 bg-primary/[0.04] px-4 py-3 text-sm leading-relaxed text-foreground/90">
          {demandLine}
        </p>
      )}

      {opportunities.length > 0 && (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {opportunities.map((r) => (
            <article
              key={r.title}
              className="group flex flex-col rounded-2xl border border-border/50 bg-gradient-to-b from-background to-slate-50/80 p-5 shadow-sm ring-1 ring-black/[0.03] transition-all hover:-translate-y-0.5 hover:border-primary/25 hover:shadow-md dark:to-muted/20 dark:ring-white/[0.04]"
            >
              <span
                className="grid size-12 place-items-center rounded-xl bg-primary/10 text-2xl ring-1 ring-primary/10 transition-colors group-hover:bg-primary/15"
                aria-hidden
              >
                {r.emoji}
              </span>
              <h3 className="mt-4 font-heading text-[0.95rem] font-bold leading-snug tracking-tight text-foreground">
                {r.title}
              </h3>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
                {r.description}
              </p>
              <p className="mt-4 border-t border-border/60 pt-3 text-[11px] font-medium tracking-wide text-muted-foreground">
                <span className="text-foreground/55">
                  {tr(
                    locale,
                    "Average career stage",
                    "المرحلة المهنية المتوسطة",
                  )}
                </span>
                <span className="mt-0.5 block font-semibold text-primary">
                  {r.level}
                </span>
              </p>
            </article>
          ))}
        </div>
      )}

      {roles.length > 0 && (
        <>
          <h3 className="mt-10 font-heading text-lg font-semibold text-foreground">
            {tr(locale, "Career Roadmap", "المسار المهني")}
          </h3>
          <CareerRoadmapTimeline locale={locale} roles={roles} />
          <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
            {tr(
              locale,
              "Titles and progression vary by country, employer and experience — a typical path, not a guarantee.",
              "تختلف المسميات ومسار التدرّج حسب الدولة وجهة العمل والخبرة — مسار نموذجي وليس ضمانًا.",
            )}
          </p>
        </>
      )}
    </section>
  );
}

/** @deprecated Prefer CourseCareerGrowth */
export function CourseCareerOpportunities(props: {
  locale: string;
  roles: CareerOpportunity[];
}) {
  return (
    <CourseCareerGrowth
      locale={props.locale}
      opportunities={props.roles}
      roles={[]}
    />
  );
}

/** @deprecated Prefer CourseCareerGrowth */
export function CourseCareerOutcomes({
  locale,
  roles,
  demandLine,
}: {
  locale: string;
  roles: CareerRole[];
  demandLine?: string;
}) {
  return (
    <CourseCareerGrowth
      locale={locale}
      opportunities={[]}
      roles={roles}
      demandLine={demandLine}
    />
  );
}

/* ------------------------------------------------------------------ */
/* Why This Diploma — six cards (Why Choose + Benefits + Why Study)  */
/* ------------------------------------------------------------------ */
export function CourseWhyThisDiploma({
  locale,
  cards,
}: {
  locale: string;
  cards: { title: string; body: string }[];
}) {
  if (!cards.length) return null;
  return (
    <section id="why-choose" className="scroll-mt-32">
      <h2 className="font-heading text-2xl font-bold tracking-tight">
        {tr(
          locale,
          "Why Healthcare Professionals Choose IMETS",
          "لماذا يختار متخصصو الرعاية الصحية IMETS",
        )}
      </h2>
      <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
        {tr(
          locale,
          "Six reasons professionals pick this program — without the repeated essays.",
          "ستة أسباب لاختيار هذا البرنامج — بدون مقالات متكررة.",
        )}
      </p>
      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((r) => (
          <div
            key={r.title}
            className="rounded-xl border border-border/60 bg-background/80 p-4 shadow-sm"
          >
            <div className="flex items-start gap-3">
              <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                <CheckCircle2 className="size-5" />
              </span>
              <div className="min-w-0">
                <p className="font-semibold text-foreground">{r.title}</p>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                  {r.body}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/** @deprecated Prefer CourseWhyThisDiploma */
export function CourseWhyChoose({
  locale,
  reasons,
}: {
  locale: string;
  reasons: { title: string; body: string }[];
  courseTitle: string;
}) {
  return <CourseWhyThisDiploma locale={locale} cards={reasons} />;
}

/* ------------------------------------------------------------------ */
/* Learning Experience — enrollment timeline + delivery benefits       */
/* ------------------------------------------------------------------ */
export function CourseLearningExperience({ locale }: { locale: string }) {
  const steps = [
    { icon: Rocket, label: tr(locale, "Enroll", "التسجيل") },
    { icon: Compass, label: tr(locale, "Orientation", "جلسة تعريفية") },
    { icon: Video, label: tr(locale, "Live Classes", "جلسات مباشرة") },
    { icon: PencilLine, label: tr(locale, "Assignments", "واجبات") },
    {
      icon: ClipboardCheck,
      label: tr(locale, "Practice Exams", "اختبارات تدريبية"),
    },
    {
      icon: MessageSquare,
      label: tr(locale, "Instructor Feedback", "ملاحظات المدرّب"),
    },
    {
      icon: FileCheck2,
      label: tr(locale, "Final Assessment", "التقييم النهائي"),
    },
    {
      icon: Award,
      label: tr(locale, "Receive Your Diploma", "احصل على دبلومتك"),
    },
  ];
  const doneLabel = tr(locale, "Graduate", "تخرّج");

  const benefits: { icon: typeof Video; title: string; body: string }[] = [
    {
      icon: Video,
      title: tr(locale, "Live Interactive Classes", "جلسات مباشرة تفاعلية"),
      body: tr(
        locale,
        "Ask questions in the moment with healthcare experts — not a pre-recorded monologue.",
        "تسأل مباشرةً خبراء الرعاية الصحية — وليس تسجيلًا صامتًا.",
      ),
    },
    {
      icon: ClipboardCheck,
      title: tr(locale, "Practice Exams", "اختبارات تدريبية"),
      body: tr(
        locale,
        "Build confidence with realistic practice before your final assessment.",
        "تبني ثقتك باختبارات واقعية قبل التقييم النهائي.",
      ),
    },
    {
      icon: MessageSquare,
      title: tr(locale, "Arabic Support", "دعم باللغة العربية"),
      body: tr(
        locale,
        "Get help in your language on WhatsApp from real people.",
        "احصل على مساعدة بلغتك عبر واتساب من أشخاص حقيقيين.",
      ),
    },
    {
      icon: Award,
      title: tr(locale, "International Curriculum", "منهج دولي"),
      body: tr(
        locale,
        "Learn frameworks hospitals use worldwide — the language employers speak.",
        "أطر عالمية تستخدمها المستشفيات — نفس لغة أصحاب العمل.",
      ),
    },
    {
      icon: Compass,
      title: tr(locale, "Career Guidance", "توجيه مهني"),
      body: tr(
        locale,
        "Finish knowing which roles to target and how to present what you learned.",
        "تنهي وأنت تعرف أدوارك التالية وكيف تعرض ما تعلّمته.",
      ),
    },
    {
      icon: Users,
      title: tr(locale, "Ongoing Mentorship", "إرشاد مستمر"),
      body: tr(
        locale,
        "Instructors and support stay with you through the program — not only at enrollment.",
        "المدرّبون والدعم معك طوال البرنامج — وليس عند التسجيل فقط.",
      ),
    },
  ];

  return (
    <section id="journey" className="scroll-mt-32">
      <div className="mx-auto max-w-2xl text-center">
        <p className="font-heading text-2xl font-bold tracking-tight sm:text-3xl">
          {tr(locale, "Learning Experience", "تجربة التعلّم")}
        </p>
        <p className="mt-2 text-sm text-muted-foreground sm:text-base">
          {tr(
            locale,
            "From day one to your diploma — one clear path.",
            "من اليوم الأول حتى دبلومتك — مسار واضح واحد.",
          )}
        </p>
      </div>

      {/* Centered horizontal timeline — not another card grid */}
      <div className="relative mx-auto mt-12 max-w-5xl">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-[4%] top-5 h-0.5 rounded-full bg-gradient-to-r from-primary/20 via-primary/55 to-amber-400/60 sm:top-[1.375rem]"
        />
        <ol className="grid grid-cols-4 gap-y-10 gap-x-1 sm:grid-cols-8 sm:gap-2">
          {steps.map((s, i) => {
            const last = i === steps.length - 1;
            return (
              <li
                key={s.label}
                className="relative z-10 flex min-w-0 flex-col items-center text-center"
              >
                <span
                  className={cn(
                    "grid size-9 place-items-center rounded-full shadow-md ring-[5px] ring-background sm:size-11",
                    last
                      ? "bg-gradient-to-br from-amber-400 to-amber-600 text-white"
                      : "bg-gradient-to-br from-primary to-[#0a2f7a] text-primary-foreground",
                  )}
                >
                  <s.icon className="size-3.5 sm:size-5" strokeWidth={2} />
                </span>
                <span
                  className={cn(
                    "mt-2.5 font-heading text-[10px] font-bold tabular-nums sm:text-sm",
                    last
                      ? "text-amber-600 dark:text-amber-400"
                      : "text-primary",
                  )}
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="mt-0.5 text-[10px] font-semibold leading-snug text-foreground sm:text-xs">
                  {s.label}
                </span>
                {last && (
                  <span className="mt-1.5 hidden rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-800 sm:inline-block dark:bg-amber-950/50 dark:text-amber-300">
                    {doneLabel}
                  </span>
                )}
              </li>
            );
          })}
        </ol>
      </div>

      {/* Compact icon row — deliberately not full cards */}
      <ul className="mx-auto mt-14 grid max-w-4xl gap-x-8 gap-y-6 sm:grid-cols-2 lg:grid-cols-3">
        {benefits.map((it) => (
          <li key={it.title} className="flex gap-3 text-start">
            <span className="mt-0.5 grid size-9 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
              <it.icon className="size-4" />
            </span>
            <div>
              <p className="text-sm font-semibold text-foreground">
                {it.title}
              </p>
              <p className="mt-0.5 text-sm leading-snug text-muted-foreground">
                {it.body}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

/** @deprecated Prefer CourseLearningExperience */
export function CourseLearningJourney({ locale }: { locale: string }) {
  return <CourseLearningExperience locale={locale} />;
}

/** @deprecated Prefer CourseLearningExperience */
export function CourseComparison({ locale }: { locale: string }) {
  return null;
}

/* ------------------------------------------------------------------ */
/* Final CTA — Apple-style: headline, one line, two actions            */
/* ------------------------------------------------------------------ */
export function CourseFinalCta({
  locale,
  children,
}: {
  locale: string;
  /** Apply + Download Brochure (or other secondary). Keep both for choice. */
  children?: ReactNode;
}) {
  return (
    <section className="marketing-gradient-bg overflow-hidden rounded-[2rem] px-6 py-14 text-center shadow-2xl shadow-blue-950/30 ring-1 ring-inset ring-white/10 sm:px-12 sm:py-16 lg:py-[4.5rem]">
      <p className="mx-auto max-w-3xl font-heading text-3xl font-bold tracking-tight text-white text-balance sm:text-4xl lg:text-[2.75rem] lg:leading-[1.15]">
        {tr(
          locale,
          "Ready to Take the Next Step in Your Healthcare Career?",
          "هل أنت مستعد لاتخاذ خطوتك التالية في مسيرتك الصحية؟",
        )}
      </p>
      <p className="mx-auto mt-4 max-w-lg text-base leading-relaxed text-white/75 sm:text-lg">
        {tr(
          locale,
          "Build leadership skills and prepare for management roles in hospitals.",
          "ابنِ مهارات القيادة واستعد لأدوار إدارية في المستشفيات.",
        )}
      </p>
      {children && (
        <div className="mx-auto mt-9 flex w-full max-w-lg flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
          {children}
        </div>
      )}
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Reviews — rating + distribution + review wall                       */
/* ------------------------------------------------------------------ */
export function CourseReviews({
  locale,
  rating,
  reviewCount,
  distribution,
  reviews,
}: {
  locale: string;
  rating: number;
  reviewCount: number;
  distribution: { star: number; pct: number }[];
  reviews: CourseReview[];
}) {
  return (
    <section id="reviews" className="scroll-mt-32">
      <h2 className="font-heading text-2xl font-bold tracking-tight">
        {tr(locale, "Success Stories", "قصص نجاح")}
      </h2>

      <div className="mt-4 grid gap-6 rounded-2xl border border-border/70 bg-card p-6 sm:grid-cols-[auto_1fr] sm:gap-8">
        {/* Score */}
        <div className="flex flex-col items-center justify-center text-center sm:border-e sm:border-border/60 sm:pe-8 rtl:sm:border-e-0 rtl:sm:border-s rtl:sm:pe-0 rtl:sm:ps-8">
          <span className="font-heading text-5xl font-bold text-foreground tabular-nums">
            {rating.toFixed(1)}
          </span>
          <span className="mt-1 flex text-amber-400">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className="size-4 fill-current" />
            ))}
          </span>
          <span className="mt-1 text-xs text-muted-foreground">
            {tr(
              locale,
              `${reviewCount.toLocaleString()} reviews`,
              `${reviewCount.toLocaleString()} تقييم`,
            )}
          </span>
        </div>
        {/* Distribution */}
        <div className="space-y-2">
          {distribution.map((d) => (
            <div key={d.star} className="flex items-center gap-3 text-xs">
              <span className="inline-flex w-8 items-center gap-0.5 text-muted-foreground tabular-nums">
                {d.star}{" "}
                <Star className="size-3 fill-amber-400 text-amber-400" />
              </span>
              <span className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                <span
                  className="block h-full rounded-full bg-amber-400"
                  style={{ width: `${d.pct}%` }}
                />
              </span>
              <span className="w-9 text-end text-muted-foreground tabular-nums">
                {d.pct}%
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Review wall */}
      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        {reviews.map((r) => (
          <figure
            key={r.name}
            className="rounded-xl border border-border/70 bg-card p-5"
          >
            <div className="flex items-center gap-3">
              <Avatar className="size-10 border">
                <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
                  {getInitials(r.name)}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <figcaption className="truncate font-medium text-foreground">
                  {r.name}
                </figcaption>
                <p className="truncate text-xs text-muted-foreground">
                  {r.role} · {r.country}
                </p>
              </div>
              <span className="ms-auto flex text-amber-400">
                {Array.from({ length: r.rating }).map((_, i) => (
                  <Star key={i} className="size-3.5 fill-current" />
                ))}
              </span>
            </div>
            <blockquote className="mt-3 text-sm leading-relaxed text-muted-foreground">
              “{r.text}”
            </blockquote>
          </figure>
        ))}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Pull quote — large editorial beat between sections                  */
/* ------------------------------------------------------------------ */
export function CoursePullQuote({
  locale,
  quote,
}: {
  locale: string;
  quote: string;
}) {
  if (!quote.trim()) return null;
  return (
    <section
      className="scroll-mt-32 py-4 text-center"
      dir={locale === "ar" ? "rtl" : "ltr"}
    >
      <Quote className="mx-auto size-10 text-primary/25" aria-hidden />
      <blockquote className="mx-auto mt-4 max-w-3xl font-heading text-2xl font-semibold leading-snug tracking-tight text-foreground text-balance sm:text-3xl sm:leading-snug">
        “{quote}”
      </blockquote>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* FAQ — grouped accordions for scanability                            */
/* ------------------------------------------------------------------ */
export function CourseFaq({
  locale,
  groups,
}: {
  locale: string;
  groups: FaqGroup[];
}) {
  if (!groups.length) return null;
  return (
    <section id="faq" className="scroll-mt-32">
      <h2 className="font-heading text-2xl font-bold tracking-tight">
        {tr(locale, "Admissions FAQ", "أسئلة القبول")}
      </h2>
      <p className="mt-2 text-sm text-muted-foreground">
        {tr(
          locale,
          "Browse by stage — before you enroll, while you learn, and certification.",
          "تصفّح حسب المرحلة — قبل التسجيل، أثناء التعلّم، والشهادة.",
        )}
      </p>
      <div className="mt-8 grid gap-8 lg:grid-cols-3 lg:gap-6">
        {groups.map((g) => (
          <div key={g.title} className="min-w-0">
            <h3 className="mb-3 font-heading text-sm font-bold uppercase tracking-[0.14em] text-primary">
              {g.title}
            </h3>
            <div className="space-y-2">
              {g.items.map((f) => (
                <details
                  key={f.q}
                  className="group rounded-xl border border-border/60 bg-background/80 px-4 py-3.5 open:shadow-sm"
                >
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-sm font-medium text-foreground">
                    {f.q}
                    <ChevronRight className="size-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-90 rtl:rotate-180 rtl:group-open:-rotate-90" />
                  </summary>
                  <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground">
                    {f.a}
                  </p>
                </details>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Trust bar — social proof strip before FAQ                           */
/* ------------------------------------------------------------------ */
export function CourseTrustBar({ locale }: { locale: string }) {
  const strengths = [
    tr(locale, "Live Weekly Learning", "تعلّم مباشر أسبوعيًا"),
    tr(locale, "Arabic + English", "عربي + إنجليزي"),
    tr(locale, "International Standards", "معايير دولية"),
  ];
  const stats = [
    { value: "3000+", label: tr(locale, "Graduates", "خريج") },
    { value: "20+", label: tr(locale, "Countries", "دولة") },
    { value: "4.9", label: tr(locale, "Average Rating", "متوسط التقييم") },
    { value: "95%", label: tr(locale, "Student Satisfaction", "رضا الطلاب") },
    { value: "50+", label: tr(locale, "Industry Experts", "خبير في المجال") },
  ];
  return (
    <section className="scroll-mt-32 overflow-hidden rounded-2xl border border-primary/15 bg-gradient-to-br from-primary/[0.07] via-card to-amber-50/40 px-5 py-8 sm:px-8 dark:via-card dark:to-amber-950/20">
      <div className="text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
          {tr(
            locale,
            "Results, not features",
            "نتائج وليست مزايا",
          )}
        </p>
        <p className="mt-2 font-heading text-xl font-bold tracking-tight text-foreground sm:text-2xl">
          {tr(
            locale,
            "Why Professionals Choose IMETS",
            "لماذا يختار المتخصصون IMETS",
          )}
        </p>
      </div>
      <div className="mt-8 grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-5 lg:gap-4">
        {stats.map((s) => (
          <div key={s.label} className="text-center">
            <CountUp
              value={s.value}
              className="font-heading text-3xl font-bold tabular-nums text-primary sm:text-4xl"
            />
            <p className="mt-1 text-xs font-medium text-muted-foreground sm:text-sm">
              {s.label}
            </p>
          </div>
        ))}
      </div>

      <ul className="mt-7 flex flex-wrap justify-center gap-2 border-t border-primary/10 pt-6">
        {strengths.map((x) => (
          <li
            key={x}
            className="inline-flex items-center gap-1.5 rounded-full bg-card px-3 py-1.5 text-xs font-semibold text-foreground/80 ring-1 ring-border/60"
          >
            <Check className="size-3.5 text-primary" aria-hidden />
            {x}
          </li>
        ))}
      </ul>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* SEO long-form content (What is X / Why become Y)                    */
/* ------------------------------------------------------------------ */
export function CourseSeoContent({
  locale,
  sections,
}: {
  locale: string;
  sections: SeoSection[];
}) {
  if (!sections.length) return null;
  return (
    <section
      className="scroll-mt-32 space-y-8"
      dir={locale === "ar" ? "rtl" : "ltr"}
    >
      {sections.map((s) => (
        <div key={s.heading}>
          {/* h2, not a styled <p>: these are the page's long-form answers to
              "what is X / why X", which is the whole reason they exist. */}
          <h2 className="font-heading text-xl font-semibold">{s.heading}</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            {s.body}
          </p>
        </div>
      ))}
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Instructor — real profile, renders only the fields that exist        */
/* ------------------------------------------------------------------ */
export function CourseInstructor({
  locale,
  title,
  profile,
  fallbackName,
}: {
  locale: string;
  title: string;
  profile?: CourseRow["instructorProfile"];
  /** The course's real instructor name, when no profile is filled in. */
  fallbackName?: string;
}) {
  const name = profile?.name || fallbackName;
  if (!name) return null;

  const chips = [
    ...(profile?.yearsExperience
      ? [
          tr(
            locale,
            `${profile.yearsExperience}+ Years Experience`,
            `${profile.yearsExperience}+ سنة خبرة`,
          ),
        ]
      : []),
    ...(profile?.certifications ?? []),
  ];

  return (
    <section id="instructor" className="scroll-mt-32">
      <p className="font-heading text-xl font-semibold">{title}</p>
      <div className="mt-4 rounded-2xl border border-border/70 bg-card p-5 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
          {profile?.image ? (
            <span className="relative size-20 shrink-0 overflow-hidden rounded-2xl bg-muted ring-1 ring-border">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              {/* Admin-pasted URL from an arbitrary host, so next/image would
                  throw unless the domain is in remotePatterns — plain <img>,
                  but lazy + sized so it can't shift layout. */}
              <img
                src={profile.image}
                alt={name}
                loading="lazy"
                decoding="async"
                width={80}
                height={80}
                className="size-full object-cover"
              />
            </span>
          ) : (
            <Avatar className="size-20 shrink-0 rounded-2xl border">
              <AvatarFallback className="rounded-2xl bg-primary/10 text-xl font-semibold text-primary">
                {getInitials(name)}
              </AvatarFallback>
            </Avatar>
          )}

          <div className="min-w-0 flex-1">
            <p className="font-heading text-lg font-bold text-foreground">
              {name}
            </p>
            {profile?.title && (
              <p className="text-sm font-medium text-primary">
                {profile.title}
              </p>
            )}

            {chips.length > 0 && (
              <div className="mt-2.5 flex flex-wrap gap-1.5">
                {chips.map((c) => (
                  <span
                    key={c}
                    className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground"
                  >
                    <Award className="size-3" /> {c}
                  </span>
                ))}
              </div>
            )}

            {profile?.bio && (
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                {profile.bio}
              </p>
            )}

            {profile?.hospitals?.length ? (
              <p className="mt-3 text-sm text-muted-foreground">
                <span className="font-medium text-foreground">
                  {tr(locale, "Experience at: ", "خبرة في: ")}
                </span>
                {profile.hospitals.join(" · ")}
              </p>
            ) : null}

            {(profile?.studentsTaught ||
              profile?.rating ||
              profile?.linkedIn) && (
              <div className="mt-4 flex flex-wrap items-center gap-4 border-t border-border/60 pt-3 text-sm">
                {profile?.studentsTaught ? (
                  <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                    <Users className="size-4 text-primary" />
                    <span className="font-semibold tabular-nums text-foreground">
                      {profile.studentsTaught.toLocaleString()}
                    </span>
                    {tr(locale, "students", "طالب")}
                  </span>
                ) : null}
                {profile?.rating ? (
                  <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                    <Star className="size-4 fill-amber-400 text-amber-400" />
                    <span className="font-semibold tabular-nums text-foreground">
                      {profile.rating.toFixed(1)}
                    </span>
                    {tr(locale, "instructor rating", "تقييم المحاضر")}
                  </span>
                ) : null}
                {profile?.linkedIn ? (
                  <a
                    href={profile.linkedIn}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 font-medium text-primary hover:underline"
                  >
                    <ExternalLink className="size-4" /> LinkedIn
                  </a>
                ) : null}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Downloads — only rendered for files that actually exist             */
/* ------------------------------------------------------------------ */
export function CourseDownloads({
  locale,
  brochureUrl,
  curriculumUrl,
  programGuideUrl,
}: {
  locale: string;
  brochureUrl?: string;
  curriculumUrl?: string;
  programGuideUrl?: string;
}) {
  const files = [
    {
      url: brochureUrl,
      label: tr(locale, "Download Brochure", "تحميل البروشور"),
    },
    {
      url: curriculumUrl,
      label: tr(locale, "Download Curriculum", "تحميل المنهج"),
    },
    {
      url: programGuideUrl,
      label: tr(locale, "Program Guide", "دليل البرنامج"),
    },
  ].filter((f) => !!f.url);
  if (!files.length) return null;

  return (
    <section className="scroll-mt-32">
      <p className="font-heading text-xl font-semibold">
        {tr(locale, "Take It With You", "خُذ التفاصيل معك")}
      </p>
      <p className="mt-2 text-sm text-muted-foreground">
        {tr(
          locale,
          "Prefer to read later, or share it with your manager? Download the details.",
          "تفضّل القراءة لاحقًا أو مشاركتها مع مديرك؟ حمّل التفاصيل.",
        )}
      </p>
      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        {files.map((f) => (
          <a
            key={f.label}
            href={f.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-3 rounded-xl border border-border/70 bg-card p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
          >
            <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
              <FileCheck2 className="size-5" />
            </span>
            <span className="min-w-0">
              <span className="block truncate text-sm font-semibold text-foreground">
                {f.label}
              </span>
              <span className="text-xs text-muted-foreground">PDF</span>
            </span>
            <Download className="ms-auto size-4 shrink-0 text-muted-foreground" />
          </a>
        ))}
      </div>
    </section>
  );
}
