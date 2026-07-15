/**
 * Conversion + SEO sections for the course detail page.
 *
 * These are static server components (no client state) styled to match the
 * existing detail-page design language: `primary` blue, amber accents,
 * `card`/`border` surfaces, emerald "included" ticks. Each is self-contained and
 * driven entirely by props so the page can compose them for any course.
 */
import {
  Briefcase,
  Star,
  Check,
  ClipboardCheck,
  MessageSquare,
  Rocket,
  Compass,
  Video,
  PencilLine,
  FileCheck2,
  Award,
  Quote,
  ChevronDown,
  CheckCircle2,
  Users,
  ExternalLink,
  Download,
} from "lucide-react";

import { cn, getInitials } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import type { CourseRow } from "@/types";
import type { CareerRole, CourseReview, SeoSection } from "@/features/marketing/lib/course-content";

const tr = (locale: string, en: string, ar: string) => (locale === "ar" ? ar : en);

/* ------------------------------------------------------------------ */
/* Story — emotional hook right under the hero                          */
/* ------------------------------------------------------------------ */
export function CourseStory({
  locale,
  title,
  body,
}: {
  locale: string;
  title: string;
  body: string;
}) {
  return (
    <section
      dir={locale === "ar" ? "rtl" : "ltr"}
      className="relative overflow-hidden rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50 via-white to-amber-50/50 p-6 sm:p-8 dark:border-blue-900/40 dark:from-blue-950/40 dark:via-card dark:to-amber-950/10"
    >
      <Quote className="absolute -top-3 start-4 size-16 text-primary/10" aria-hidden />
      <div className="relative">
        <h2 className="font-heading text-2xl font-bold tracking-tight text-foreground text-balance sm:text-[1.75rem]">
          {title}
        </h2>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground">{body}</p>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Career outcomes — the roles ladder                                  */
/* ------------------------------------------------------------------ */
export function CourseCareerOutcomes({
  locale,
  roles,
  demandLine,
}: {
  locale: string;
  roles: CareerRole[];
  /** Specific demand statement — merged in so "Career Outcomes" and
   *  "Demand & Career Growth" don't read as two near-identical sections. */
  demandLine?: string;
}) {
  if (!roles.length) return null;
  const ar = locale === "ar";
  return (
    <section id="careers" className="scroll-mt-32">
      <h2 className="font-heading text-xl font-semibold">
        {tr(locale, "Career Roadmap", "المسار المهني")}
      </h2>
      <p className="mt-2 text-sm text-muted-foreground">
        {tr(
          locale,
          "Where this program can take you — one step at a time.",
          "إلى أين يمكن أن يأخذك هذا البرنامج — خطوة بخطوة.",
        )}
      </p>

      {demandLine && (
        <p className="mt-4 rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 text-sm leading-relaxed text-foreground/90">
          {demandLine}
        </p>
      )}

      <ol className="mt-5">
        {/* Entry point, so the ladder reads as a journey rather than a list. */}
        <li className="flex flex-col">
          <span className="inline-flex w-fit items-center gap-2 rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
            {tr(locale, "Entry level", "نقطة البداية")}
          </span>
          <span className="ms-[1.6rem] my-1 h-4 w-px bg-gradient-to-b from-border to-primary/40" aria-hidden />
        </li>
        {roles.map((r, i) => {
          const last = i === roles.length - 1;
          return (
            <li key={r.title} className="flex flex-col">
              <div
                className={cn(
                  "flex items-center gap-3 rounded-xl border px-4 py-3 shadow-sm transition-colors",
                  last
                    ? "border-primary/40 bg-primary/5 ring-1 ring-primary/10"
                    : "border-border/70 bg-card",
                )}
              >
                <span
                  className={cn(
                    "grid size-8 shrink-0 place-items-center rounded-full font-heading text-sm font-bold tabular-nums",
                    last ? "bg-primary text-primary-foreground" : "bg-primary/10 text-primary",
                  )}
                >
                  {i + 1}
                </span>
                <span className="font-medium text-foreground">{r.title}</span>
                {last ? (
                  <span className="ms-auto rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary">
                    {tr(locale, "Goal", "الهدف")}
                  </span>
                ) : (
                  <Briefcase className="ms-auto size-4 text-muted-foreground/60" />
                )}
              </div>
              {!last && (
                <span className="ms-[1.6rem] flex h-5 w-px items-center justify-center bg-gradient-to-b from-primary/50 to-primary/10" aria-hidden>
                  <ChevronDown className={cn("size-3 shrink-0 text-primary/50", ar && "scale-x-[-1]")} />
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Why professionals choose this program — sits right under the hero   */
/* ------------------------------------------------------------------ */
export function CourseWhyChoose({
  locale,
  reasons,
  courseTitle,
}: {
  locale: string;
  reasons: { title: string; body: string }[];
  courseTitle: string;
}) {
  if (!reasons.length) return null;
  return (
    <section id="why-choose" className="scroll-mt-32">
      <h2 className="font-heading text-xl font-semibold">
        {tr(
          locale,
          `Why Professionals Choose ${courseTitle}`,
          `لماذا يختار المتخصصون ${courseTitle}`,
        )}
      </h2>
      <p className="mt-2 text-sm text-muted-foreground">
        {tr(
          locale,
          "The honest answer to the question you're already asking.",
          "الإجابة الصريحة على السؤال الذي تفكّر فيه بالفعل.",
        )}
      </p>
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        {reasons.map((r, i) => (
          <div
            key={r.title}
            className={cn(
              "rounded-xl border border-border/70 bg-card p-4 shadow-sm transition-shadow hover:shadow-md",
              i === reasons.length - 1 && reasons.length % 2 === 1 && "sm:col-span-2",
            )}
          >
            <div className="flex items-start gap-3">
              <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                <CheckCircle2 className="size-5" />
              </span>
              <div className="min-w-0">
                <p className="font-semibold text-foreground">{r.title}</p>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{r.body}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Learning journey — "What Happens After Enrollment"                  */
/* ------------------------------------------------------------------ */
export function CourseLearningJourney({ locale }: { locale: string }) {
  const steps = [
    { icon: Rocket, label: tr(locale, "Enroll", "التسجيل") },
    { icon: Compass, label: tr(locale, "Orientation", "جلسة تعريفية") },
    { icon: Video, label: tr(locale, "Live Classes", "جلسات مباشرة") },
    { icon: PencilLine, label: tr(locale, "Assignments", "واجبات") },
    { icon: ClipboardCheck, label: tr(locale, "Practice Exams", "اختبارات تدريبية") },
    { icon: MessageSquare, label: tr(locale, "Instructor Feedback", "ملاحظات المدرّب") },
    { icon: FileCheck2, label: tr(locale, "Final Assessment", "التقييم النهائي") },
    { icon: Award, label: tr(locale, "Certificate", "الشهادة") },
  ];
  return (
    <section id="journey" className="scroll-mt-32">
      <h2 className="font-heading text-xl font-semibold">
        {tr(locale, "What Happens After Enrollment", "ماذا يحدث بعد التسجيل")}
      </h2>
      <p className="mt-2 text-sm text-muted-foreground">
        {tr(locale, "A clear, guided path from day one to your certificate.", "مسار واضح وموجَّه من اليوم الأول حتى شهادتك.")}
      </p>
      <ol className="mt-5 grid gap-3 sm:grid-cols-2">
        {steps.map((s, i) => (
          <li
            key={s.label}
            className="flex items-center gap-3 rounded-xl border border-border/70 bg-card px-4 py-3"
          >
            <span className="grid size-9 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground">
              <s.icon className="size-4.5" />
            </span>
            <span className="text-xs font-bold text-primary tabular-nums">
              {String(i + 1).padStart(2, "0")}
            </span>
            <span className="font-medium text-foreground">{s.label}</span>
          </li>
        ))}
      </ol>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Comparison — Why IMETS vs Others                                    */
/* ------------------------------------------------------------------ */
export function CourseComparison({ locale }: { locale: string }) {
  // Cards rather than a comparison table: reads far better on mobile, and each
  // line states the benefit instead of ticking an abstract "feature".
  const items: { icon: typeof Video; title: string; body: string }[] = [
    {
      icon: Video,
      title: tr(locale, "Live Interactive Classes", "جلسات مباشرة تفاعلية"),
      body: tr(
        locale,
        "Ask your questions in the moment, in live sessions led by healthcare experts — not a pre-recorded monologue.",
        "تسأل وتناقش مباشرةً في جلسات يقودها خبراء في الرعاية الصحية — وليس تسجيلًا صامتًا.",
      ),
    },
    {
      icon: ClipboardCheck,
      title: tr(locale, "Practice Exams", "اختبارات تدريبية"),
      body: tr(
        locale,
        "Build confidence with realistic practice exams before your final assessment, so nothing on the day is a surprise.",
        "تبني ثقتك عبر اختبارات تدريبية واقعية قبل التقييم النهائي، فلا تفاجئك أي مسألة يوم الامتحان.",
      ),
    },
    {
      icon: MessageSquare,
      title: tr(locale, "Arabic Support", "دعم باللغة العربية"),
      body: tr(
        locale,
        "Study international content while asking for help in your own language, over WhatsApp, from real people.",
        "تدرس محتوى دوليًا وتطلب المساعدة بلغتك عبر واتساب، من أشخاص حقيقيين.",
      ),
    },
    {
      icon: Award,
      title: tr(locale, "International Curriculum", "منهج دولي"),
      body: tr(
        locale,
        "Learn the frameworks and standards used by hospitals worldwide — the same language your employer speaks.",
        "تتعلّم الأطر والمعايير المستخدمة في المستشفيات حول العالم — نفس اللغة التي يتحدثها صاحب العمل.",
      ),
    },
    {
      icon: Compass,
      title: tr(locale, "Career Guidance", "توجيه مهني"),
      body: tr(
        locale,
        "Finish knowing your next step: which roles to target and how to present what you've just learned.",
        "تنهي البرنامج وأنت تعرف خطوتك التالية: أي الأدوار تستهدف، وكيف تعرض ما تعلّمته.",
      ),
    },
  ];
  return (
    <section className="scroll-mt-32">
      <h2 className="font-heading text-xl font-semibold">{tr(locale, "Why IMETS?", "لماذا IMETS؟")}</h2>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((it) => (
          <div key={it.title} className="rounded-xl border border-border/70 bg-card p-4 shadow-sm transition-shadow hover:shadow-md">
            <span className="grid size-11 place-items-center rounded-xl bg-gradient-to-br from-primary/15 to-primary/5 text-primary ring-1 ring-primary/15">
              <it.icon className="size-5.5" />
            </span>
            <p className="mt-3 flex items-center gap-1.5 font-semibold text-foreground">
              <Check className="size-4 shrink-0 text-emerald-600 dark:text-emerald-400" /> {it.title}
            </p>
            <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{it.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Final CTA — closes the page instead of trailing off after the FAQ   */
/* ------------------------------------------------------------------ */
export function CourseFinalCta({
  locale,
  children,
}: {
  locale: string;
  /** Enroll / apply action supplied by the page (keeps this a server component). */
  children?: React.ReactNode;
}) {
  return (
    <section className="marketing-gradient-bg overflow-hidden rounded-2xl px-6 py-10 text-center shadow-2xl shadow-blue-950/30 ring-1 ring-inset ring-white/10 sm:px-10 sm:py-12">
      <h2 className="font-heading text-2xl font-bold tracking-tight text-white text-balance sm:text-3xl">
        {tr(locale, "Ready To Advance Your Healthcare Career?", "جاهز للارتقاء بمسيرتك في الرعاية الصحية؟")}
      </h2>
      <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-white/80 sm:text-base">
        {tr(
          locale,
          "Join thousands of healthcare professionals preparing for leadership roles.",
          "انضم إلى آلاف المتخصصين في الرعاية الصحية الذين يستعدون لأدوار قيادية.",
        )}
      </p>
      {children && <div className="mx-auto mt-6 flex max-w-md flex-col justify-center gap-3 sm:flex-row">{children}</div>}
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
      <h2 className="font-heading text-xl font-semibold">{tr(locale, "Course Reviews", "تقييمات الدورة")}</h2>

      <div className="mt-4 grid gap-6 rounded-2xl border border-border/70 bg-card p-6 sm:grid-cols-[auto_1fr] sm:gap-8">
        {/* Score */}
        <div className="flex flex-col items-center justify-center text-center sm:border-e sm:border-border/60 sm:pe-8 rtl:sm:border-e-0 rtl:sm:border-s rtl:sm:pe-0 rtl:sm:ps-8">
          <span className="font-heading text-5xl font-bold text-foreground tabular-nums">{rating.toFixed(1)}</span>
          <span className="mt-1 flex text-amber-400">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className="size-4 fill-current" />
            ))}
          </span>
          <span className="mt-1 text-xs text-muted-foreground">
            {tr(locale, `${reviewCount.toLocaleString()} reviews`, `${reviewCount.toLocaleString()} تقييم`)}
          </span>
        </div>
        {/* Distribution */}
        <div className="space-y-2">
          {distribution.map((d) => (
            <div key={d.star} className="flex items-center gap-3 text-xs">
              <span className="inline-flex w-8 items-center gap-0.5 text-muted-foreground tabular-nums">
                {d.star} <Star className="size-3 fill-amber-400 text-amber-400" />
              </span>
              <span className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                <span className="block h-full rounded-full bg-amber-400" style={{ width: `${d.pct}%` }} />
              </span>
              <span className="w-9 text-end text-muted-foreground tabular-nums">{d.pct}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* Review wall */}
      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        {reviews.map((r) => (
          <figure key={r.name} className="rounded-xl border border-border/70 bg-card p-5">
            <div className="flex items-center gap-3">
              <Avatar className="size-10 border">
                <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
                  {getInitials(r.name)}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <figcaption className="truncate font-medium text-foreground">{r.name}</figcaption>
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
            <blockquote className="mt-3 text-sm leading-relaxed text-muted-foreground">“{r.text}”</blockquote>
          </figure>
        ))}
      </div>
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
    <section className="scroll-mt-32 space-y-8" dir={locale === "ar" ? "rtl" : "ltr"}>
      {sections.map((s) => (
        <div key={s.heading}>
          <h2 className="font-heading text-xl font-semibold">{s.heading}</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{s.body}</p>
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
      ? [tr(locale, `${profile.yearsExperience}+ Years Experience`, `${profile.yearsExperience}+ سنة خبرة`)]
      : []),
    ...(profile?.certifications ?? []),
  ];

  return (
    <section id="instructor" className="scroll-mt-32">
      <h2 className="font-heading text-xl font-semibold">{title}</h2>
      <div className="mt-4 rounded-2xl border border-border/70 bg-card p-5 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
          {profile?.image ? (
            <span className="relative size-20 shrink-0 overflow-hidden rounded-2xl bg-muted ring-1 ring-border">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={profile.image} alt={name} className="size-full object-cover" />
            </span>
          ) : (
            <Avatar className="size-20 shrink-0 rounded-2xl border">
              <AvatarFallback className="rounded-2xl bg-primary/10 text-xl font-semibold text-primary">
                {getInitials(name)}
              </AvatarFallback>
            </Avatar>
          )}

          <div className="min-w-0 flex-1">
            <p className="font-heading text-lg font-bold text-foreground">{name}</p>
            {profile?.title && <p className="text-sm font-medium text-primary">{profile.title}</p>}

            {chips.length > 0 && (
              <div className="mt-2.5 flex flex-wrap gap-1.5">
                {chips.map((c) => (
                  <span key={c} className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                    <Award className="size-3" /> {c}
                  </span>
                ))}
              </div>
            )}

            {profile?.bio && (
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{profile.bio}</p>
            )}

            {profile?.hospitals?.length ? (
              <p className="mt-3 text-sm text-muted-foreground">
                <span className="font-medium text-foreground">{tr(locale, "Experience at: ", "خبرة في: ")}</span>
                {profile.hospitals.join(" · ")}
              </p>
            ) : null}

            {(profile?.studentsTaught || profile?.rating || profile?.linkedIn) && (
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
                    <span className="font-semibold tabular-nums text-foreground">{profile.rating.toFixed(1)}</span>
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
    { url: brochureUrl, label: tr(locale, "Download Brochure", "تحميل البروشور") },
    { url: curriculumUrl, label: tr(locale, "Download Curriculum", "تحميل المنهج") },
    { url: programGuideUrl, label: tr(locale, "Program Guide", "دليل البرنامج") },
  ].filter((f) => !!f.url);
  if (!files.length) return null;

  return (
    <section className="scroll-mt-32">
      <h2 className="font-heading text-xl font-semibold">
        {tr(locale, "Take It With You", "خُذ التفاصيل معك")}
      </h2>
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
              <span className="block truncate text-sm font-semibold text-foreground">{f.label}</span>
              <span className="text-xs text-muted-foreground">PDF</span>
            </span>
            <Download className="ms-auto size-4 shrink-0 text-muted-foreground" />
          </a>
        ))}
      </div>
    </section>
  );
}
