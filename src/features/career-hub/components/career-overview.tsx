import {
  AlertTriangle,
  ArrowRight,
  Briefcase,
  CalendarClock,
  Inbox,
  Plus,
  Share2,
  UsersRound,
} from "lucide-react";

import { Link } from "@/i18n/navigation";
import type { CareerOverview as Overview } from "@/lib/dal/career-hub";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  CAREER_COUNTRIES,
  CAREER_PROFESSIONS,
  CAREER_TRACKS,
  countryOf,
  formatDate,
} from "@/features/career-hub/lib/career-taxonomy";

const JOB_STATUS_STYLE: Record<string, string> = {
  draft: "bg-muted text-muted-foreground",
  published: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300",
  closed: "bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
  new: "bg-primary/10 text-primary",
  reviewing: "bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300",
  converted: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300",
  rejected: "bg-muted text-muted-foreground",
};

/**
 * Career Hub at a glance — what is listed against what graduates want.
 *
 * The two quantities are different units (people vs listings), so each column
 * is scaled to its own maximum and labelled with its number; they are never
 * drawn on a shared axis.
 */
export function CareerOverview({ data }: { data: Overview }) {
  const { jobs, profiles, vacancies } = data;
  const newVacancies = vacancies.byStatus.new ?? 0;
  const drafts = jobs.byStatus.draft ?? 0;

  const tiles = [
    {
      icon: Briefcase,
      label: "Open listings",
      value: jobs.open,
      sub: `${drafts} draft${drafts === 1 ? "" : "s"} · ${jobs.byStatus.closed ?? 0} closed`,
      href: "/admin/career-hub/jobs",
    },
    {
      icon: UsersRound,
      label: "Graduate profiles",
      value: profiles.total,
      sub: `${profiles.sharing} open to employer recommendations`,
      href: "/admin/career-hub/profiles",
    },
    {
      icon: Inbox,
      label: "New employer vacancies",
      value: newVacancies,
      sub: `${vacancies.total} submitted in total`,
      href: "/admin/career-hub/vacancies",
    },
    {
      icon: CalendarClock,
      label: "Past closing date",
      value: jobs.expired,
      sub: "Published but hidden from graduates",
      href: "/admin/career-hub/jobs",
    },
  ];

  const trackRows = CAREER_TRACKS.map((t) => ({
    key: t.value,
    label: t.en,
    demand: profiles.byTrack[t.value] ?? 0,
    supply: jobs.byTrack[t.value] ?? 0,
  }))
    .filter((r) => r.demand || r.supply)
    .sort((a, b) => b.demand - a.demand || b.supply - a.supply);

  const countryRows = CAREER_COUNTRIES.map((c) => ({
    key: c.value,
    label: `${c.flag} ${c.en}`,
    demand: profiles.byCountry[c.value] ?? 0,
    supply: jobs.byCountry[c.value] ?? 0,
  }));

  const professionRows = CAREER_PROFESSIONS.map((p) => ({
    key: p.value,
    label: p.en,
    demand: profiles.byProfession[p.value] ?? 0,
    supply: jobs.byProfession[p.value] ?? 0,
  }))
    .filter((r) => r.demand || r.supply)
    .sort((a, b) => b.demand - a.demand || b.supply - a.supply);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 font-heading text-2xl font-bold tracking-tight">
            <Briefcase className="size-6 text-primary" /> Career Hub
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            Openings in Egypt and the Gulf, the graduates looking for them, and employers asking to be listed.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" asChild>
            <Link href="/careers" target="_blank">
              View public board
            </Link>
          </Button>
          <Button className="gap-1.5" asChild>
            <Link href="/admin/career-hub/jobs">
              <Plus className="size-4" /> Add listing
            </Link>
          </Button>
        </div>
      </div>

      {(newVacancies > 0 || jobs.expired > 0) && (
        <div className="flex flex-wrap gap-2">
          {newVacancies > 0 && (
            <Link
              href="/admin/career-hub/vacancies"
              className="inline-flex items-center gap-2 rounded-xl bg-primary/10 px-3.5 py-2 text-sm font-medium text-primary ring-1 ring-primary/20 hover:bg-primary/15"
            >
              <Inbox className="size-4" />
              {newVacancies} new employer {newVacancies === 1 ? "vacancy" : "vacancies"} to review
              <ArrowRight className="size-3.5" />
            </Link>
          )}
          {jobs.expired > 0 && (
            <Link
              href="/admin/career-hub/jobs"
              className="inline-flex items-center gap-2 rounded-xl bg-amber-100 px-3.5 py-2 text-sm font-medium text-amber-800 ring-1 ring-amber-200 hover:bg-amber-200/60 dark:bg-amber-950/40 dark:text-amber-300 dark:ring-amber-900"
            >
              <AlertTriangle className="size-4" />
              {jobs.expired} published {jobs.expired === 1 ? "listing is" : "listings are"} past the closing date — close or extend
              <ArrowRight className="size-3.5" />
            </Link>
          )}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {tiles.map((t) => (
          <Link
            key={t.label}
            href={t.href}
            className="group rounded-2xl border border-border/70 bg-card p-5 shadow-sm transition-shadow hover:shadow-md"
          >
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">{t.label}</p>
              <t.icon className="size-4 text-muted-foreground group-hover:text-primary" />
            </div>
            <p className="mt-2 font-heading text-3xl font-bold tabular-nums">{t.value}</p>
            <p className="mt-1 text-xs text-muted-foreground">{t.sub}</p>
          </Link>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <SupplyDemand
          title="Areas: what graduates want vs what's listed"
          rows={trackRows}
          empty="Appears once graduates save interests or listings are tagged with areas."
        />
        <SupplyDemand
          title="Countries: where graduates want to work vs open roles"
          rows={countryRows}
          footnote={
            profiles.anywhere > 0
              ? `${profiles.anywhere} graduate${profiles.anywhere === 1 ? " is" : "s are"} open to any country and not counted above.`
              : undefined
          }
        />
        <SupplyDemand
          title="Professions: graduates vs listings naming them"
          rows={professionRows}
          footnote="Listings open to all professions aren't counted against a single profession."
          empty="Appears once graduates choose a profession or listings name one."
        />

        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-1">
          <RecentList
            title="Latest listings"
            href="/admin/career-hub/jobs"
            empty="No listings yet."
            items={data.recentJobs.map((j) => ({
              id: j._id,
              primary: j.title,
              secondary: `${j.employer} · ${countryOf(j.country)?.flag ?? ""} ${countryOf(j.country)?.en ?? j.country}`,
              status: j.status,
              date: j.createdAt,
            }))}
          />
          <RecentList
            title="Latest employer vacancies"
            href="/admin/career-hub/vacancies"
            empty="No submissions yet. Employers submit at /careers/post-a-job."
            items={data.recentVacancies.map((v) => ({
              id: v._id,
              primary: v.jobTitle,
              secondary: `${v.companyName} · ${countryOf(v.country)?.flag ?? ""} ${countryOf(v.country)?.en ?? v.country}`,
              status: v.status,
              date: v.createdAt,
            }))}
          />
        </div>
      </div>

      <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Share2 className="size-3.5" />
        Only graduates who opted in may be recommended to an employer — the Graduate profiles page shows who.
      </p>
    </div>
  );
}

function SupplyDemand({
  title,
  rows,
  footnote,
  empty,
}: {
  title: string;
  rows: { key: string; label: string; demand: number; supply: number }[];
  footnote?: string;
  empty?: string;
}) {
  const maxDemand = Math.max(0, ...rows.map((r) => r.demand));
  const maxSupply = Math.max(0, ...rows.map((r) => r.supply));
  const nothing = rows.every((r) => !r.demand && !r.supply);

  return (
    <section className="rounded-2xl border border-border/70 bg-card p-5 shadow-sm">
      <h2 className="font-heading text-sm font-bold">{title}</h2>
      {nothing ? (
        <p className="mt-6 rounded-xl border border-dashed border-border py-8 text-center text-xs text-muted-foreground">
          {empty ?? "No data yet."}
        </p>
      ) : (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[420px] text-sm">
            <thead>
              <tr className="text-[11px] uppercase tracking-wide text-muted-foreground">
                <th className="pb-2 text-start font-semibold" />
                <th className="w-[34%] pb-2 text-start font-semibold">Graduates</th>
                <th className="w-[34%] pb-2 text-start font-semibold">Open listings</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.key}>
                  <td className="py-1.5 pe-3 text-xs font-medium">{r.label}</td>
                  <td className="py-1.5 pe-3">
                    <Bar value={r.demand} max={maxDemand} tone="bg-primary" hint={`${r.demand} graduate${r.demand === 1 ? "" : "s"} · ${r.label}`} />
                  </td>
                  <td className="py-1.5">
                    <Bar value={r.supply} max={maxSupply} tone="bg-sky-500" hint={`${r.supply} open listing${r.supply === 1 ? "" : "s"} · ${r.label}`} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {footnote && !nothing && <p className="mt-3 text-[11px] text-muted-foreground">{footnote}</p>}
    </section>
  );
}

function Bar({ value, max, tone, hint }: { value: number; max: number; tone: string; hint: string }) {
  const pct = max > 0 ? (value / max) * 100 : 0;
  return (
    <div className="group flex items-center gap-2" title={hint}>
      <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
        {value > 0 && (
          <div className={cn("h-2 rounded-full transition-opacity group-hover:opacity-80", tone)} style={{ width: `max(${pct}%, 4px)` }} />
        )}
      </div>
      <span className={cn("w-7 text-end text-xs tabular-nums", value ? "font-semibold text-foreground" : "text-muted-foreground")}>
        {value}
      </span>
    </div>
  );
}

function RecentList({
  title,
  href,
  items,
  empty,
}: {
  title: string;
  href: string;
  items: { id: string; primary: string; secondary: string; status: string; date?: string }[];
  empty: string;
}) {
  return (
    <section className="rounded-2xl border border-border/70 bg-card p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="font-heading text-sm font-bold">{title}</h2>
        <Link href={href} className="text-xs font-medium text-primary hover:underline">
          View all
        </Link>
      </div>
      {items.length === 0 ? (
        <p className="mt-4 text-xs text-muted-foreground">{empty}</p>
      ) : (
        <ul className="mt-3 divide-y divide-border/60">
          {items.map((i) => (
            <li key={i.id} className="flex items-center gap-3 py-2.5">
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{i.primary}</p>
                <p className="truncate text-xs text-muted-foreground">{i.secondary}</p>
              </div>
              <span className={cn("shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold capitalize", JOB_STATUS_STYLE[i.status])}>
                {i.status}
              </span>
              <span className="hidden w-20 shrink-0 text-end text-[11px] text-muted-foreground sm:block">
                {formatDate(i.date, "en")}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
