"use client";

import * as React from "react";
import { Check, ChevronDown, HelpCircle, X } from "lucide-react";

import { cn } from "@/lib/utils";
import type {
  AudienceProfile,
  ProgramDetail,
  ProgramDetailsContent,
  ProgrammeNumbers,
} from "@/features/orientation/lib/sales-orientation";
import { num, useOrientationT } from "@/features/orientation/lib/i18n";
import { CopyButton, type GateProps } from "./lesson-parts";

/**
 * CPHQ & CIC in depth — what each certification is, who can sit its exam, what
 * our preparation course contains, what to say and never say, and why each
 * profession looks at management programmes at all.
 *
 * The long lists (modules, outcomes, career paths…) sit behind "Full course
 * content", so the tab reads as a briefing first. Fees and lecture counts come
 * from the live course record. The gate is opening every tab.
 */
export function ProgramDetailsModule({
  details,
  programmes,
  seen,
  mark,
}: {
  details: ProgramDetailsContent;
  programmes: ProgrammeNumbers[];
} & GateProps) {
  const { t } = useOrientationT();
  const tabs = [
    ...details.programmes.map((p) => ({ key: `p:${p.slug}`, label: p.name, program: p as ProgramDetail | null })),
    ...(details.audiences.length ? [{ key: "audiences", label: t("details.whoTab"), program: null }] : []),
  ];
  const [tab, setTab] = React.useState(tabs[0]?.key ?? "");

  const firstKey = tabs[0]?.key;
  React.useEffect(() => {
    if (firstKey) mark(firstKey);
  }, [firstKey, mark]);

  const current = tabs.find((x) => x.key === tab) ?? tabs[0];
  if (!current) return null;

  return (
    <div className="space-y-4">
      {details.intro && <p className="max-w-[68ch] text-[15px] leading-relaxed text-muted-foreground">{details.intro}</p>}

      <div className="flex gap-1 overflow-x-auto border-b border-border/70" role="tablist">
        {tabs.map((x) => (
          <button
            key={x.key}
            type="button"
            role="tab"
            aria-selected={x.key === current.key}
            onClick={() => {
              setTab(x.key);
              mark(x.key);
            }}
            className={cn(
              "-mb-px flex shrink-0 items-center gap-1.5 border-b-2 px-3.5 py-2.5 text-sm font-semibold transition-colors",
              x.key === current.key ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground",
            )}
          >
            {x.label}
            {seen.has(x.key) && <span className="size-1.5 rounded-full bg-emerald-500" aria-hidden="true" />}
          </button>
        ))}
      </div>

      <div role="tabpanel">
        {current.program ? (
          <ProgramView
            key={current.key}
            program={current.program}
            numbers={programmes.find((n) => n.slug === current.program!.slug) ?? null}
          />
        ) : (
          <AudiencesView intro={details.audiencesIntro} audiences={details.audiences} />
        )}
      </div>
    </div>
  );
}

function ProgramView({ program, numbers }: { program: ProgramDetail; numbers: ProgrammeNumbers | null }) {
  const { t } = useOrientationT();
  const [full, setFull] = React.useState(false);
  const facts = program.facts ?? [];

  return (
    <div className="space-y-4">
      <div>
        {program.awardedBy && <p className="text-xs font-semibold text-primary">{program.awardedBy}</p>}
        <h3 className="mt-1 font-heading text-lg font-bold leading-snug">
          {program.name}
          {program.fullName && (
            <span className="ms-2 text-sm font-medium text-muted-foreground" dir="ltr">
              {program.fullName}
            </span>
          )}
        </h3>
        {program.tagline && <p className="mt-1.5 max-w-[68ch] text-[15px] leading-relaxed text-muted-foreground">{program.tagline}</p>}
      </div>

      {numbers && (
        <dl className="flex flex-wrap gap-2">
          <LiveStat label={t("details.liveFee")}>
            {t("programs.egp", { n: num(numbers.sale) })}
            {numbers.price > numbers.sale && <s className="ms-1.5 text-xs font-normal text-muted-foreground">{num(numbers.price)}</s>}
          </LiveStat>
          <LiveStat label={t("details.liveLectures")}>{num(numbers.lectures)}</LiveStat>
          {numbers.students > 0 && <LiveStat label={t("details.liveLearners")}>+{num(numbers.students)}</LiveStat>}
        </dl>
      )}

      {facts.length > 0 && (
        <dl className="grid overflow-hidden rounded-2xl border border-border/70 sm:grid-cols-2">
          {facts.map((f, i) => (
            <div
              key={`${i}-${f.label}`}
              className={cn("border-border/70 p-3.5", "border-b sm:[&:nth-last-child(-n+2)]:border-b-0 last:border-b-0", i % 2 === 0 && "sm:border-e")}
            >
              <dt className="text-xs text-muted-foreground">{f.label}</dt>
              <dd className="mt-0.5 text-sm leading-relaxed">{f.value}</dd>
            </div>
          ))}
        </dl>
      )}

      <div className="grid gap-3 md:grid-cols-2">
        {program.sayThis.length > 0 && (
          <section className="space-y-2.5 rounded-2xl bg-emerald-500/[0.08] p-4">
            <h4 className="flex items-center gap-1.5 text-sm font-bold text-emerald-700 dark:text-emerald-400">
              <Check className="size-4" />
              {t("details.say")}
            </h4>
            <ul className="space-y-2">
              {program.sayThis.map((s, i) => (
                <li key={i} className="flex items-start gap-2 text-sm leading-relaxed">
                  <span className="min-w-0 flex-1">«{s}»</span>
                  <CopyButton text={s} size="icon" className="shrink-0 border-transparent bg-transparent" />
                </li>
              ))}
            </ul>
          </section>
        )}
        {program.avoid.length > 0 && (
          <section className="space-y-2.5 rounded-2xl bg-destructive/[0.06] p-4">
            <h4 className="flex items-center gap-1.5 text-sm font-bold text-destructive">
              <X className="size-4" />
              {t("details.never")}
            </h4>
            <ul className="space-y-2 ps-4 text-sm leading-relaxed [list-style:disc]">
              {program.avoid.map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ul>
          </section>
        )}
      </div>

      <div className="rounded-2xl border border-border/70">
        <button
          type="button"
          aria-expanded={full}
          onClick={() => setFull((v) => !v)}
          className="flex w-full items-center gap-2 p-4 text-start text-sm font-semibold transition-colors hover:bg-muted/40"
        >
          <span className="flex-1">{t("details.full")}</span>
          <ChevronDown className={cn("size-4 text-muted-foreground transition-transform", full && "rotate-180")} />
        </button>
        {full && (
          <div className="space-y-4 border-t border-border/60 p-4">
            {program.whatItIs && <Block title={t("details.whatItIs")}><p>{program.whatItIs}</p></Block>}
            <ListBlock title={t("details.whyStudy")} items={program.whyStudy} />
            <div className="grid gap-4 md:grid-cols-2">
              <ListBlock title={t("details.whoFor")} items={program.whoFor} />
              <ListBlock title={t("details.eligibility")} items={program.eligibility} />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <ListBlock title={t("details.courseFacts")} items={program.courseFacts} />
              {program.curriculum.length > 0 && (
                <Block title={t("details.curriculum")}>
                  <ol className="space-y-1.5">
                    {program.curriculum.map((m, i) => (
                      <li key={i} className="flex gap-2">
                        <span className="grid size-5 shrink-0 place-items-center rounded-md bg-primary/10 text-[10px] font-bold text-primary">
                          {i + 1}
                        </span>
                        <span dir="auto">{m}</span>
                      </li>
                    ))}
                  </ol>
                </Block>
              )}
            </div>
            <ListBlock title={t("details.outcomes")} items={program.outcomes} />
            {program.careerPaths.length > 0 && (
              <Block title={t("details.careers")}>
                <div className="flex flex-wrap gap-1.5">
                  {program.careerPaths.map((c) => (
                    <span key={c} className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
                      {c}
                    </span>
                  ))}
                </div>
              </Block>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function AudiencesView({ intro, audiences }: { intro: string; audiences: AudienceProfile[] }) {
  return (
    <div className="space-y-4">
      {intro && <p className="rounded-xl bg-muted/60 p-3.5 text-sm leading-relaxed">{intro}</p>}
      <div className="grid gap-3 md:grid-cols-2">
        {audiences.map((a, i) => (
          <PersonaCard key={i} persona={a} />
        ))}
      </div>
    </div>
  );
}

function PersonaCard({ persona: a }: { persona: AudienceProfile }) {
  const { t } = useOrientationT();
  const [open, setOpen] = React.useState(false);
  return (
    <article className="flex flex-col gap-3 rounded-2xl border border-border/70 p-4">
      <h4 className="font-heading text-base font-bold">{a.title}</h4>

      {a.openingQuestion && (
        <div className="rounded-xl bg-emerald-500/[0.09] p-3">
          <p className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
            <HelpCircle className="size-3.5" />
            {t("details.openWith")}
          </p>
          <p className="mt-1 text-sm leading-relaxed">«{a.openingQuestion}»</p>
          <CopyButton text={a.openingQuestion} className="mt-2" />
        </div>
      )}

      {(a.motivations.length > 0 || a.worries.length > 0 || a.bestFit) && (
        <div>
          <button
            type="button"
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            className="flex w-full items-center gap-1.5 text-start text-sm font-semibold text-primary"
          >
            <span className="flex-1">{t("details.more")}</span>
            <ChevronDown className={cn("size-4 transition-transform", open && "rotate-180")} />
          </button>
          {open && (
            <div className="mt-3 space-y-3 text-sm leading-relaxed">
              <ListBlock title={t("details.motivations")} items={a.motivations} />
              <ListBlock title={t("details.worries")} items={a.worries} />
              {a.bestFit && (
                <Block title={t("details.bestFit")}>
                  <p>{a.bestFit}</p>
                </Block>
              )}
            </div>
          )}
        </div>
      )}
    </article>
  );
}

function LiveStat({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl bg-muted/60 px-3 py-2">
      <dt className="text-[11px] text-muted-foreground">{label}</dt>
      <dd className="text-sm font-bold tabular-nums">{children}</dd>
    </div>
  );
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-1.5 text-sm leading-relaxed">
      <h5 className="text-xs font-bold text-muted-foreground">{title}</h5>
      {children}
    </section>
  );
}

function ListBlock({ title, items }: { title: string; items: string[] }) {
  if (!items.length) return null;
  return (
    <Block title={title}>
      <ul className="space-y-1.5">
        {items.map((item, i) => (
          <li key={i} className="flex gap-2">
            <span className="mt-2 size-1.5 shrink-0 rounded-full bg-primary/60" />
            <span className="min-w-0">{item}</span>
          </li>
        ))}
      </ul>
    </Block>
  );
}
