"use client";

import * as React from "react";
import { Info } from "lucide-react";

import { cn } from "@/lib/utils";
import { youTubeId, type ProgrammeNumbers } from "@/features/orientation/lib/sales-orientation";
import { num, useOrientationT } from "@/features/orientation/lib/i18n";
import { CopyButton, type GateProps } from "./lesson-parts";
import { LessonVideos } from "./lesson-videos";

/**
 * Our programs in numbers — the figures to have ready before price comes up,
 * plus any YouTube videos the admin attached to the programme.
 *
 * Every number is read from the live course record rather than a copy kept
 * alongside the training text: change a price in Admin → Courses and this
 * lesson changes with it. The payment split is the published policy (50% to
 * confirm the seat, the rest within a month of the start).
 */
export function ProgramsModule({ programmes, seen, mark }: { programmes: ProgrammeNumbers[] } & GateProps) {
  const { t } = useOrientationT();
  const [active, setActive] = React.useState<number | null>(null);

  if (programmes.length === 0) {
    return <p className="rounded-xl bg-muted/60 p-4 text-center text-sm text-muted-foreground">{t("programs.loadFailed")}</p>;
  }

  const p = active === null ? null : programmes[active];
  const first = p ? Math.round(p.sale * 0.5) : 0;
  const off = p && p.price > p.sale ? Math.round((1 - p.sale / p.price) * 100) : 0;
  const videos = (p?.videos ?? [])
    .filter((v) => v && typeof v.url === "string" && youTubeId(v.url))
    .map((v) => ({ id: v.id, url: v.url, title: v.title, duration: v.duration ?? "" }));
  const pitch = p
    ? t("programs.pitch", { name: p.name, lectures: num(p.lectures), fee: num(p.sale), first: num(first) })
    : "";

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {programmes.map((prog, i) => (
          <button
            key={prog.slug}
            type="button"
            aria-pressed={active === i}
            onClick={() => {
              setActive(i);
              mark(prog.slug);
            }}
            className={cn(
              "inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-start text-sm transition-colors",
              active === i ? "border-primary bg-primary/[0.07] font-semibold text-primary" : "border-border/70 hover:border-primary/40",
            )}
          >
            {seen.has(prog.slug) && <span className="size-1.5 shrink-0 rounded-full bg-emerald-500" aria-hidden="true" />}
            {prog.name}
          </button>
        ))}
      </div>

      {!p ? (
        <p className="rounded-2xl border border-border/70 p-4 text-sm text-muted-foreground">{t("programs.pick")}</p>
      ) : (
        <div className="space-y-4 rounded-2xl border border-border/70 p-4" aria-live="polite">
          <div>
            <h3 className="font-heading text-base font-bold">{p.name}</h3>
            {p.subtitle && <p className="text-sm text-muted-foreground">{p.subtitle}</p>}
          </div>

          <dl className="grid grid-cols-2 gap-2.5 lg:grid-cols-4">
            <Stat label={t("programs.fee")} hint={off > 0 ? t("programs.discount", { n: off }) : undefined} highlight>
              {t("programs.egp", { n: num(p.sale) })}
              {p.price > p.sale && (
                <s className="ms-1.5 text-[13px] font-normal text-muted-foreground">{num(p.price)}</s>
              )}
            </Stat>
            <Stat label={t("programs.lectures")} hint={t("programs.lecturesSub")}>
              {num(p.lectures)}
            </Stat>
            <Stat label={t("programs.first")} hint={t("programs.firstSub")}>
              {t("programs.egp", { n: num(first) })}
            </Stat>
            <Stat label={t("programs.rest")} hint={t("programs.restSub")}>
              {t("programs.egp", { n: num(p.sale - first) })}
            </Stat>
          </dl>

          <LessonVideos key={p.slug} videos={videos} label={{ one: t("programs.videoOne"), many: t("programs.videoMany") }} />

          <div className="space-y-2.5 rounded-xl bg-primary/[0.06] p-3.5">
            <p className="text-xs font-bold text-muted-foreground">{t("programs.ready")}</p>
            <p className="text-sm leading-relaxed">«{pitch}»</p>
            <div className="flex flex-wrap items-center gap-3">
              <CopyButton text={pitch} />
              {p.students > 0 && (
                <span className="flex items-start gap-1.5 text-xs text-muted-foreground">
                  <Info className="mt-0.5 size-3.5 shrink-0" />
                  {t("programs.students", { n: num(p.students) })}
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Stat({
  label,
  hint,
  highlight,
  children,
}: {
  label: string;
  hint?: string;
  highlight?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("rounded-xl p-3", highlight ? "bg-primary/[0.08]" : "bg-muted/60")}>
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className={cn("mt-0.5 font-heading text-lg font-bold tabular-nums", highlight && "text-primary")}>{children}</dd>
      {hint && <dd className="text-[11px] text-muted-foreground">{hint}</dd>}
    </div>
  );
}
