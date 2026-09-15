"use client";

import * as React from "react";
import {
  Award,
  BookOpen,
  Briefcase,
  CheckCircle2,
  ClipboardCheck,
  Copy,
  GraduationCap,
  HelpCircle,
  Info,
  Target,
  TriangleAlert,
  Users,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import type {
  AudienceProfile,
  ProgramDetail,
  ProgramDetailsContent,
  ProgrammeNumbers,
} from "@/features/orientation/lib/sales-orientation";

const nf = new Intl.NumberFormat("ar-EG");

async function copy(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    toast.success("اتنسخ");
  } catch {
    toast.error("ما قدرناش ننسخ النص");
  }
}

/**
 * Program details — what CPHQ and CIC are, why healthcare staff study them,
 * what the IMETS preparation course contains, and why each profession looks at
 * management programmes at all.
 *
 * Fees, lecture counts and learner totals come from the live course record
 * (the same numbers as the Programme numbers lesson), never from this copy.
 * Completing the lesson means opening every tab.
 */
export function ProgramDetailsModule({
  details,
  programmes,
  onComplete,
}: {
  details: ProgramDetailsContent;
  programmes: ProgrammeNumbers[];
  onComplete: () => void;
}) {
  const tabs = [
    ...details.programmes.map((p) => ({ key: `p:${p.slug}:${p.name}`, label: p.name, program: p })),
    ...(details.audiences.length ? [{ key: "audiences", label: "مين بيدرس البرامج الإدارية وليه", program: null }] : []),
  ];
  const tabKeys = tabs.map((t) => t.key).join("|");
  const [tab, setTab] = React.useState(tabs[0]?.key ?? "");
  const [seen, setSeen] = React.useState<Set<string>>(() => new Set(tabs[0] ? [tabs[0].key] : []));

  React.useEffect(() => {
    const keys = tabKeys.split("|").filter(Boolean);
    if (keys.length > 0 && keys.every((k) => seen.has(k))) onComplete();
  }, [seen, tabKeys, onComplete]);

  const current = tabs.find((t) => t.key === tab) ?? tabs[0];
  if (!current) return null;

  return (
    <div>
      {details.intro && <p className="mb-4 text-sm leading-relaxed text-muted-foreground">{details.intro}</p>}

      <div className="mb-5 flex flex-wrap gap-1 rounded-xl bg-muted p-1" role="tablist">
        {tabs.map((t) => (
          <button
            key={t.key}
            type="button"
            role="tab"
            aria-selected={t.key === current.key}
            onClick={() => {
              setTab(t.key);
              setSeen((p) => new Set(p).add(t.key));
            }}
            className={cn(
              "flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-sm font-medium transition-colors",
              t.key === current.key ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground",
            )}
          >
            {seen.has(t.key) && t.key !== current.key && <CheckCircle2 className="size-3.5 text-emerald-600" />}
            {t.label}
          </button>
        ))}
      </div>

      {current.program ? (
        <ProgramView
          key={current.key}
          program={current.program}
          numbers={programmes.find((n) => n.slug === current.program!.slug) ?? null}
        />
      ) : (
        <AudiencesView intro={details.audiencesIntro} audiences={details.audiences} />
      )}

      {seen.size < tabs.length && (
        <p className="mt-5 text-center text-xs text-muted-foreground">
          افتح كل التبويبات عشان تكمّل الدرس ({seen.size} من {tabs.length})
        </p>
      )}
    </div>
  );
}

function ProgramView({ program, numbers }: { program: ProgramDetail; numbers: ProgrammeNumbers | null }) {
  return (
    <div className="space-y-4">
      <div className="rounded-2xl bg-gradient-to-br from-primary/[0.08] to-sky-500/[0.05] p-4 ring-1 ring-primary/15 sm:p-5">
        {program.awardedBy && <p className="text-xs font-semibold text-primary">{program.awardedBy}</p>}
        <h3 className="mt-1 font-heading text-xl font-bold leading-snug">
          {program.name}
          {program.fullName && (
            <span className="ms-2 text-sm font-medium text-muted-foreground" dir="ltr">
              {program.fullName}
            </span>
          )}
        </h3>
        {program.tagline && <p className="mt-2 text-sm leading-relaxed">{program.tagline}</p>}

        {numbers && (
          <dl className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
            <Stat label="الرسوم الحالية">
              {nf.format(numbers.sale)} ج.م
              {numbers.price > numbers.sale && (
                <span className="ms-1.5 text-xs font-normal text-muted-foreground line-through">{nf.format(numbers.price)}</span>
              )}
            </Stat>
            <Stat label="عدد المحاضرات">{nf.format(numbers.lectures)}</Stat>
            {numbers.students > 0 && <Stat label="متدرب (منشور على الموقع)">+{nf.format(numbers.students)}</Stat>}
          </dl>
        )}
      </div>

      {program.whatItIs && (
        <Section icon={Info} title="يعني إيه الشهادة دي؟">
          <p className="text-sm leading-relaxed">{program.whatItIs}</p>
        </Section>
      )}

      <Section icon={Target} title="ليه الكوادر الصحية بتدرسها؟" tone="primary" items={program.whyStudy} />

      <div className="grid gap-4 md:grid-cols-2">
        <Section icon={Users} title="مناسبة لمين" items={program.whoFor} />
        <Section icon={ClipboardCheck} title="شروط دخول الامتحان" items={program.eligibility} />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Section icon={BookOpen} title="تفاصيل الكورس عندنا" items={program.courseFacts} />
        {program.curriculum.length > 0 && (
          <Section icon={GraduationCap} title="محتوى الكورس">
            <ol className="space-y-1.5 text-sm">
              {program.curriculum.map((m, i) => (
                <li key={i} className="flex gap-2">
                  <span className="grid size-5 shrink-0 place-items-center rounded-md bg-primary/10 text-[10px] font-bold text-primary">
                    {nf.format(i + 1)}
                  </span>
                  <span dir="auto" className="leading-relaxed">
                    {m}
                  </span>
                </li>
              ))}
            </ol>
          </Section>
        )}
      </div>

      <Section icon={Award} title="هيتعلّم إيه" items={program.outcomes} />

      {program.careerPaths.length > 0 && (
        <Section icon={Briefcase} title="مسارات وظيفية بتفتحها">
          <div className="flex flex-wrap gap-1.5">
            {program.careerPaths.map((c) => (
              <span key={c} className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
                {c}
              </span>
            ))}
          </div>
        </Section>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {program.sayThis.length > 0 && (
          <Section icon={CheckCircle2} title="قولها كده" tone="good">
            <ul className="space-y-2">
              {program.sayThis.map((s, i) => (
                <li key={i} className="flex items-start gap-2 text-sm leading-relaxed">
                  <span className="min-w-0 flex-1">«{s}»</span>
                  <button
                    type="button"
                    onClick={() => copy(s)}
                    className="shrink-0 rounded-md p-1 text-muted-foreground hover:bg-emerald-500/10 hover:text-emerald-700"
                    title="نسخ"
                  >
                    <Copy className="size-3.5" />
                  </button>
                </li>
              ))}
            </ul>
          </Section>
        )}
        <Section icon={XCircle} title="ما تقولش" tone="bad" items={program.avoid} />
      </div>
    </div>
  );
}

function AudiencesView({ intro, audiences }: { intro: string; audiences: AudienceProfile[] }) {
  return (
    <div className="space-y-4">
      {intro && <p className="rounded-xl bg-muted/50 p-3.5 text-sm leading-relaxed">{intro}</p>}
      <div className="grid gap-3 md:grid-cols-2">
        {audiences.map((a, i) => (
          <article key={i} className="flex flex-col rounded-2xl border border-border/70 bg-card p-4">
            <h3 className="font-heading text-base font-bold">{a.title}</h3>

            {a.motivations.length > 0 && (
              <div className="mt-3">
                <p className="text-xs font-semibold text-primary">ليه بيفكر يدرس برامج إدارية؟</p>
                <ul className="mt-1.5 space-y-1 text-sm leading-relaxed">
                  {a.motivations.map((m, j) => (
                    <li key={j} className="flex gap-1.5">
                      <span className="mt-2 size-1.5 shrink-0 rounded-full bg-primary" />
                      {m}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {a.worries.length > 0 && (
              <div className="mt-3">
                <p className="flex items-center gap-1 text-xs font-semibold text-amber-700 dark:text-amber-400">
                  <TriangleAlert className="size-3.5" />
                  اللي غالبًا مقلقه
                </p>
                <ul className="mt-1.5 space-y-1 text-sm leading-relaxed text-muted-foreground">
                  {a.worries.map((w, j) => (
                    <li key={j} className="flex gap-1.5">
                      <span className="mt-2 size-1.5 shrink-0 rounded-full bg-amber-500" />
                      {w}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {a.bestFit && (
              <p className="mt-3 rounded-lg bg-emerald-500/[0.07] p-2.5 text-sm leading-relaxed ring-1 ring-emerald-500/20">
                <b className="font-semibold">الأنسب له: </b>
                {a.bestFit}
              </p>
            )}

            {a.openingQuestion && (
              <div className="mt-auto pt-3">
                <div className="flex items-start gap-2 rounded-lg bg-primary/[0.06] p-2.5 text-sm">
                  <HelpCircle className="mt-0.5 size-4 shrink-0 text-primary" />
                  <span className="min-w-0 flex-1 leading-relaxed">
                    <b className="font-semibold">افتح بالسؤال ده: </b>«{a.openingQuestion}»
                  </span>
                  <button
                    type="button"
                    onClick={() => copy(a.openingQuestion)}
                    className="shrink-0 rounded-md p-1 text-muted-foreground hover:bg-primary/10 hover:text-primary"
                    title="نسخ"
                  >
                    <Copy className="size-3.5" />
                  </button>
                </div>
              </div>
            )}
          </article>
        ))}
      </div>
    </div>
  );
}

function Stat({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl bg-card/80 p-2.5 ring-1 ring-border/60">
      <dt className="text-[11px] text-muted-foreground">{label}</dt>
      <dd className="mt-0.5 text-sm font-bold tabular-nums">{children}</dd>
    </div>
  );
}

function Section({
  icon: Icon,
  title,
  items,
  tone,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  items?: string[];
  tone?: "primary" | "good" | "bad";
  children?: React.ReactNode;
}) {
  if (!children && (!items || items.length === 0)) return null;
  return (
    <section
      className={cn(
        "rounded-2xl border p-4",
        tone === "primary" && "border-primary/25 bg-primary/[0.03]",
        tone === "good" && "border-emerald-500/25 bg-emerald-500/[0.04]",
        tone === "bad" && "border-destructive/25 bg-destructive/[0.03]",
        !tone && "border-border/70 bg-card",
      )}
    >
      <h4
        className={cn(
          "mb-2.5 flex items-center gap-1.5 text-sm font-bold",
          tone === "good" && "text-emerald-700 dark:text-emerald-400",
          tone === "bad" && "text-destructive",
          tone === "primary" && "text-primary",
        )}
      >
        <Icon className="size-4" />
        {title}
      </h4>
      {children ?? (
        <ul className="space-y-1.5 text-sm leading-relaxed">
          {items!.map((item, i) => (
            <li key={i} className="flex gap-2">
              <span
                className={cn(
                  "mt-2 size-1.5 shrink-0 rounded-full",
                  tone === "bad" ? "bg-destructive" : tone === "good" ? "bg-emerald-500" : "bg-primary",
                )}
              />
              <span className="min-w-0">{item}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
