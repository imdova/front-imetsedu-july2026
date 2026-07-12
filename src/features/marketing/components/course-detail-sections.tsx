/**
 * Conversion + SEO sections for the course detail page.
 *
 * These are static server components (no client state) styled to match the
 * existing detail-page design language: `primary` blue, amber accents,
 * `card`/`border` surfaces, emerald "included" ticks. Each is self-contained and
 * driven entirely by props so the page can compose them for any course.
 */
import {
  TrendingUp,
  Users,
  Briefcase,
  MapPin,
  Star,
  Check,
  X,
  ClipboardCheck,
  MessageSquare,
  GraduationCap,
  Rocket,
  Compass,
  Video,
  PencilLine,
  FileCheck2,
  Award,
  Quote,
} from "lucide-react";

import { getInitials } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
}: {
  locale: string;
  roles: CareerRole[];
}) {
  if (!roles.length) return null;
  return (
    <section id="careers" className="scroll-mt-32">
      <h2 className="font-heading text-xl font-semibold">
        {tr(locale, "Career Outcomes", "المسارات المهنية")}
      </h2>
      <p className="mt-2 text-sm text-muted-foreground">
        {tr(
          locale,
          "After completing this program you may qualify for roles such as:",
          "بعد إتمام هذا البرنامج قد تكون مؤهلاً لأدوار مثل:",
        )}
      </p>
      <ol className="mt-5 space-y-2.5">
        {roles.map((r, i) => (
          <li key={r.title} className="flex flex-col">
            <div className="flex items-center gap-3 rounded-xl border border-border/70 bg-card px-4 py-3 shadow-sm">
              <span className="grid size-8 shrink-0 place-items-center rounded-full bg-primary/10 font-heading text-sm font-bold text-primary tabular-nums">
                {i + 1}
              </span>
              <span className="font-medium text-foreground">{r.title}</span>
              <Briefcase className="ms-auto size-4 text-muted-foreground/60" />
            </div>
            {i < roles.length - 1 && (
              <span className="ms-[1.6rem] my-0.5 h-4 w-px bg-gradient-to-b from-primary/50 to-primary/10" aria-hidden />
            )}
          </li>
        ))}
      </ol>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Demand — "Growing Demand / Career Opportunities" (no salaries)      */
/* ------------------------------------------------------------------ */
export function CourseDemand({ locale }: { locale: string }) {
  const cards = [
    {
      icon: TrendingUp,
      title: tr(locale, "Growing Demand", "طلب متزايد"),
      body: tr(
        locale,
        "Healthcare quality professionals are in high demand across GCC countries and the wider Middle East.",
        "المتخصصون في جودة الرعاية الصحية مطلوبون بشدة في دول الخليج والشرق الأوسط.",
      ),
    },
    {
      icon: Briefcase,
      title: tr(locale, "Career Opportunities", "فرص وظيفية"),
      body: tr(
        locale,
        "Hospitals, clinics and accreditation bodies are actively hiring certified specialists to lead improvement.",
        "المستشفيات والعيادات وهيئات الاعتماد توظّف باستمرار متخصصين معتمدين لقيادة التحسين.",
      ),
    },
    {
      icon: MapPin,
      title: tr(locale, "In-Demand Across the GCC", "مطلوب في كل الخليج"),
      body: tr(
        locale,
        "From Saudi Arabia to the UAE and Qatar, employers value internationally recognized credentials.",
        "من السعودية إلى الإمارات وقطر، يقدّر أصحاب العمل الشهادات المعترف بها دوليًا.",
      ),
    },
  ];
  return (
    <section className="scroll-mt-32">
      <h2 className="font-heading text-xl font-semibold">
        {tr(locale, "Demand & Career Growth", "الطلب والنمو المهني")}
      </h2>
      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        {cards.map((c) => (
          <div key={c.title} className="rounded-xl border border-border/70 bg-card p-5">
            <span className="inline-flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <c.icon className="size-5" />
            </span>
            <p className="mt-3 font-semibold text-foreground">{c.title}</p>
            <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{c.body}</p>
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
  const rows: { label: string; imets: boolean; others: boolean }[] = [
    { label: tr(locale, "Live Classes", "جلسات مباشرة"), imets: true, others: false },
    { label: tr(locale, "Recordings", "التسجيلات"), imets: true, others: true },
    { label: tr(locale, "Practice Exams", "اختبارات تدريبية"), imets: true, others: false },
    { label: tr(locale, "Expert Faculty", "نخبة من المدرّبين"), imets: true, others: false },
    { label: tr(locale, "Arabic Support", "دعم باللغة العربية"), imets: true, others: false },
    { label: tr(locale, "WhatsApp Support", "دعم عبر واتساب"), imets: true, others: false },
  ];
  return (
    <section className="scroll-mt-32">
      <h2 className="font-heading text-xl font-semibold">{tr(locale, "Why IMETS?", "لماذا IMETS؟")}</h2>
      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[22rem] border-collapse overflow-hidden rounded-xl border border-border/70 text-sm">
          <thead>
            <tr className="bg-muted/50">
              <th className="px-4 py-3 text-start font-semibold text-muted-foreground">
                {tr(locale, "Feature", "الميزة")}
              </th>
              <th className="px-4 py-3 text-center font-heading font-bold text-primary">IMETS</th>
              <th className="px-4 py-3 text-center font-semibold text-muted-foreground">
                {tr(locale, "Others", "أخرى")}
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={r.label} className={i % 2 ? "bg-card" : "bg-background"}>
                <td className="border-t border-border/60 px-4 py-3 font-medium text-foreground">{r.label}</td>
                <td className="border-t border-border/60 px-4 py-3 text-center">
                  <Cell ok={r.imets} />
                </td>
                <td className="border-t border-border/60 px-4 py-3 text-center">
                  <Cell ok={r.others} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function Cell({ ok }: { ok: boolean }) {
  return ok ? (
    <span className="inline-flex size-6 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
      <Check className="size-4" />
    </span>
  ) : (
    <span className="inline-flex size-6 items-center justify-center rounded-full bg-rose-100 text-rose-500 dark:bg-rose-950/40 dark:text-rose-400">
      <X className="size-4" />
    </span>
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
