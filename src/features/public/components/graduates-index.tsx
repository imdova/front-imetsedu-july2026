/* eslint-disable @next/next/no-img-element -- S3-hosted graduate portraits in the card avatar stacks */
import { ArrowRight, Award, CalendarDays, GraduationCap, PartyPopper, Sparkles, Users } from "lucide-react";

import { Link } from "@/i18n/navigation";
import type { GraduateCohort } from "@/lib/dal/graduates";

const fmtMonthYear = (iso: string) => {
  if (!iso) return "";
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? "" : d.toLocaleDateString("en-US", { month: "long", year: "numeric" });
};

/** /graduates — celebratory index of every published cohort gallery. */
export function GraduatesIndex({ cohorts }: { cohorts: GraduateCohort[] }) {
  const totalGraduates = cohorts.reduce((s, c) => s + c.graduatesCount, 0);
  const totalHours = cohorts.reduce((s, c) => s + (c.trainingHours || 0), 0);
  const latest = cohorts[0];

  return (
    <div className="bg-[#04091F] text-white" dir="ltr">
      {/* ── Hero ── */}
      <section className="relative overflow-hidden px-6 pb-20 pt-24 text-center sm:pt-28">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(60% 55% at 50% 0%, rgba(242,208,138,.20), rgba(0,0,0,0) 68%), radial-gradient(130% 100% at 50% -18%, #2A2FD6 0%, #141FA0 30%, #0B1B57 58%, #04091F 100%)",
          }}
        />
        {/* confetti */}
        <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
          {CONFETTI.map((c, i) => (
            <span
              key={i}
              className="absolute block rounded-[2px] opacity-80"
              style={{ left: `${c.x}%`, top: `${c.y}%`, width: c.w, height: c.h, background: c.color, transform: `rotate(${c.r}deg)` }}
            />
          ))}
        </div>
        <svg className="pointer-events-none absolute -left-40 -top-32 opacity-40" width="520" height="520" viewBox="0 0 400 400" aria-hidden="true" fill="none" stroke="#D9A441">
          <circle cx="200" cy="200" r="196" strokeWidth="1.2" /><circle cx="200" cy="200" r="166" strokeWidth="3" />
        </svg>
        <svg className="pointer-events-none absolute -bottom-56 -right-44 opacity-40" width="560" height="560" viewBox="0 0 400 400" aria-hidden="true" fill="none" stroke="#D9A441">
          <circle cx="200" cy="200" r="196" strokeWidth="1.2" /><circle cx="200" cy="200" r="158" strokeWidth="3" />
        </svg>

        <div className="relative mx-auto max-w-3xl">
          <span className="mx-auto grid size-16 place-items-center rounded-2xl border border-amber-300/30 bg-amber-300/10 text-amber-200 shadow-[0_0_60px_rgba(217,164,65,.25)]">
            <GraduationCap className="size-8" strokeWidth={1.6} />
          </span>
          <p className="mt-6 text-[11px] font-semibold uppercase tracking-[.46em] text-amber-200">IMETS Medical School</p>
          <h1 className="mt-4 font-heading text-4xl font-semibold leading-[1.05] text-balance sm:text-6xl" style={{ fontFamily: '"Cormorant Garamond", Georgia, serif' }}>
            The ones who <em className="not-italic text-amber-200">made it.</em>
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-[#AEB8DC] sm:text-lg">
            Every cohort below is a room full of healthcare professionals who chose to grow — late-night lectures, tough exams,
            and the day it all paid off. This is where we celebrate them. 🎓
          </p>
          <div className="mx-auto mt-8 flex items-center justify-center gap-4">
            <i className="h-px w-24 bg-gradient-to-r from-transparent to-amber-400 sm:w-40" />
            <span className="size-2 rotate-45 bg-amber-200" />
            <i className="h-px w-24 bg-gradient-to-l from-transparent to-amber-400 sm:w-40" />
          </div>

          {/* stats */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-x-12 gap-y-6">
            <Stat value={cohorts.length} label="Cohorts" />
            <Stat value={totalGraduates} label="Graduates" />
            {totalHours > 0 && <Stat value={totalHours} label="Training hours" />}
            {latest?.classYear && <Stat value={latest.classYear} label="Latest class" />}
          </div>
        </div>
      </section>

      {/* ── Cohort cards ── */}
      <section className="mx-auto max-w-6xl px-6 pb-24">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[.3em] text-amber-200"><Sparkles className="size-3.5" /> Graduation galleries</p>
            <h2 className="mt-2 text-2xl font-semibold sm:text-3xl">Pick a cohort, meet the class.</h2>
          </div>
          <p className="text-sm text-[#AEB8DC]">Tap any card to open its gallery.</p>
        </div>

        {cohorts.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-amber-300/25 p-16 text-center text-[#AEB8DC]">
            <PartyPopper className="mx-auto size-8 text-amber-200" />
            <p className="mt-3 font-medium text-white">The first gallery is on its way.</p>
            <p className="mt-1 text-sm">Check back soon — our next class is about to graduate.</p>
          </div>
        ) : (
          <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {cohorts.map((c, i) => (
              <li key={c.id}>
                <Link
                  href={`/graduates/${c.slug}`}
                  className="group relative flex h-full flex-col overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-[#0A1747] to-[#071033] p-6 shadow-[0_20px_60px_rgba(0,0,0,.45)] transition duration-300 hover:-translate-y-1.5 hover:border-amber-300/50 hover:shadow-[0_28px_70px_rgba(217,164,65,.22)]"
                >
                  {/* glow */}
                  <span aria-hidden className="pointer-events-none absolute -right-16 -top-16 size-48 rounded-full bg-amber-300/10 blur-3xl transition group-hover:bg-amber-300/20" />
                  {i === 0 && (
                    <span className="absolute right-5 top-5 inline-flex items-center gap-1 rounded-full border border-amber-300/40 bg-amber-300/15 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[.18em] text-amber-100">
                      <PartyPopper className="size-3" /> Newest
                    </span>
                  )}

                  {/* avatar stack */}
                  <div className="flex items-center">
                    {c.previewPhotos.slice(0, 4).map((src, j) => (
                      <span key={src + j} className="-ml-3 first:ml-0 size-14 overflow-hidden rounded-full p-[3px] shadow-lg" style={{ background: "linear-gradient(150deg,#F6E0B0,#D9A441 45%,#8F6516 78%,#F2D08A)", zIndex: 10 - j }}>
                        <img src={src} alt="" className="size-full rounded-full border-2 border-[#0A1747] object-cover" loading="lazy" />
                      </span>
                    ))}
                    {c.graduatesCount > 4 && (
                      <span className="-ml-3 grid size-14 place-items-center rounded-full border-2 border-[#0A1747] bg-white/10 text-sm font-bold text-amber-100 backdrop-blur">
                        +{c.graduatesCount - 4}
                      </span>
                    )}
                    {c.previewPhotos.length === 0 && (
                      <span className="grid size-14 place-items-center rounded-full border border-amber-300/30 bg-amber-300/10 text-amber-200"><Award className="size-6" /></span>
                    )}
                  </div>

                  <p className="mt-6 text-[10px] font-semibold uppercase tracking-[.3em] text-amber-200">
                    {[c.classLabel, c.classYear].filter(Boolean).join(" ") || "Graduation gallery"}
                  </p>
                  <h3 className="mt-2 text-xl font-semibold leading-snug text-white">{c.name}</h3>
                  {(c.programTitle || c.programTitleAccent) && (
                    <p className="mt-1 text-sm text-[#AEB8DC]">{c.programTitle} {c.programTitleAccent}</p>
                  )}

                  <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-xs text-[#AEB8DC]">
                    <span className="inline-flex items-center gap-1.5"><Users className="size-3.5 text-amber-200" />{c.graduatesCount} graduate{c.graduatesCount === 1 ? "" : "s"}</span>
                    {c.trainingHours > 0 && <span className="inline-flex items-center gap-1.5"><Award className="size-3.5 text-amber-200" />{c.trainingHours} hours</span>}
                    {fmtMonthYear(c.issuedAt) && <span className="inline-flex items-center gap-1.5"><CalendarDays className="size-3.5 text-amber-200" />{fmtMonthYear(c.issuedAt)}</span>}
                  </div>

                  <span className="mt-auto inline-flex items-center gap-2 pt-6 text-sm font-semibold text-amber-100 transition group-hover:gap-3">
                    View the gallery <ArrowRight className="size-4" />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* ── Closing ── */}
      <section className="border-t border-amber-200/15 bg-gradient-to-b from-[#141FA0]/20 to-transparent px-6 py-16 text-center">
        <GraduationCap className="mx-auto size-7 text-amber-200" strokeWidth={1.6} />
        <p className="mt-4 font-heading text-2xl text-amber-100 sm:text-3xl" style={{ fontFamily: '"Cormorant Garamond", Georgia, serif' }}>
          Your name could be on the next wall.
        </p>
        <p className="mx-auto mt-2 max-w-md text-sm text-[#AEB8DC]">Explore our programs and join the next class of healthcare leaders.</p>
        <Link href="/courses" className="mt-6 inline-flex items-center gap-2 rounded-full bg-amber-300 px-6 py-3 text-sm font-bold text-[#04091F] transition hover:bg-amber-200">
          Explore programs <ArrowRight className="size-4" />
        </Link>
      </section>
    </div>
  );
}

function Stat({ value, label }: { value: number | string; label: string }) {
  return (
    <div className="text-center">
      <p className="text-4xl font-extrabold leading-none tabular-nums sm:text-5xl">{typeof value === "number" ? value.toLocaleString() : value}</p>
      <p className="mt-2 text-[11px] uppercase tracking-[.24em] text-[#AEB8DC]">{label}</p>
    </div>
  );
}

/** Static, deterministic confetti so SSR and client markup match. */
const CONFETTI = [
  { x: 6, y: 18, w: 8, h: 14, r: 20, color: "#F2D08A" }, { x: 13, y: 62, w: 10, h: 10, r: -15, color: "#D9A441" },
  { x: 21, y: 34, w: 6, h: 16, r: 40, color: "#F6E0B0" }, { x: 29, y: 80, w: 9, h: 9, r: 10, color: "#2A2FD6" },
  { x: 37, y: 12, w: 7, h: 14, r: -30, color: "#F2D08A" }, { x: 44, y: 70, w: 8, h: 8, r: 25, color: "#D9A441" },
  { x: 57, y: 22, w: 6, h: 16, r: 55, color: "#F6E0B0" }, { x: 63, y: 76, w: 10, h: 10, r: -20, color: "#F2D08A" },
  { x: 71, y: 40, w: 7, h: 14, r: 15, color: "#2A2FD6" }, { x: 79, y: 14, w: 9, h: 9, r: -40, color: "#D9A441" },
  { x: 86, y: 58, w: 6, h: 16, r: 30, color: "#F2D08A" }, { x: 93, y: 30, w: 8, h: 12, r: -10, color: "#F6E0B0" },
];
