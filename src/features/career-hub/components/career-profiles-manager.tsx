"use client";

import * as React from "react";
import { Download, Loader2, MessageCircle, Search, Share2, UsersRound } from "lucide-react";
import { toast } from "sonner";

import { dal } from "@/lib/dal";
import type { CareerProfileAdminRow } from "@/lib/dal/career-hub";
import { cn, getInitials } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CAREER_COUNTRIES,
  CAREER_PROFESSIONS,
  CAREER_TRACKS,
  countryOf,
  educationOf,
  formatDate,
  trackOf,
} from "@/features/career-hub/lib/career-taxonomy";

const ALL = "__all";

const csvCell = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;

/**
 * Graduates who set up a Career Hub profile.
 *
 * Contact details are here because this is the super-admin console. Whether a
 * graduate may be put forward to an employer is their call, shown per row —
 * the export defaults to only those who said yes.
 */
export function CareerProfilesManager({ courses }: { courses: { slug: string; title: string }[] }) {
  const [rows, setRows] = React.useState<CareerProfileAdminRow[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [profession, setProfession] = React.useState(ALL);
  const [country, setCountry] = React.useState(ALL);
  const [track, setTrack] = React.useState(ALL);
  const [sharingOnly, setSharingOnly] = React.useState(false);
  const [query, setQuery] = React.useState("");

  const courseTitle = React.useMemo(() => new Map(courses.map((c) => [c.slug, c.title])), [courses]);

  React.useEffect(() => {
    let alive = true;
    (async () => {
      const res = await dal.careerHub.fetchCareerProfiles({
        profession: profession === ALL ? undefined : profession,
        country: country === ALL ? undefined : country,
        track: track === ALL ? undefined : track,
        sharing: sharingOnly ? "true" : undefined,
      });
      if (!alive) return;
      if (res.ok) setRows(res.data);
      else toast.error(res.error);
      setLoading(false);
    })();
    return () => {
      alive = false;
    };
  }, [profession, country, track, sharingOnly]);

  const visible = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((r) => `${r.user?.name ?? ""} ${r.user?.email ?? ""} ${r.user?.number ?? ""}`.toLowerCase().includes(q));
  }, [rows, query]);

  const sharingCount = visible.filter((r) => r.shareWithEmployers).length;

  const exportCsv = (onlySharing: boolean) => {
    const list = onlySharing ? visible.filter((r) => r.shareWithEmployers) : visible;
    if (!list.length) {
      toast.error(onlySharing ? "No graduates in this view have opted in to sharing." : "Nothing to export.");
      return;
    }
    const header = [
      "Name", "Email", "Phone", "Nationality", "Profession", "Education", "Years of experience",
      "Wants to work in", "Interests", "Programmes", "Open matches", "Shares with employers", "Updated",
    ];
    const lines = list.map((r) =>
      [
        r.user?.name, r.user?.email, r.user?.number, r.user?.country, r.profession,
        educationOf(r.educationLevel)?.en ?? "", r.yearsOfExperience ?? "",
        r.countries.length ? r.countries.map((c) => countryOf(c)?.en ?? c).join("; ") : "Anywhere",
        r.tracks.map((t) => trackOf(t)?.en ?? t).join("; "),
        r.courseSlugs.map((s) => courseTitle.get(s) ?? s).join("; "),
        r.matchCount, r.shareWithEmployers ? "Yes" : "No", r.updatedAt?.slice(0, 10),
      ]
        .map(csvCell)
        .join(","),
    );
    // BOM so Excel opens Arabic names correctly.
    const blob = new Blob(["﻿" + [header.map(csvCell).join(","), ...lines].join("\n")], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `career-profiles-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const filterSelect = (
    value: string,
    onChange: (v: string) => void,
    allLabel: string,
    options: { value: string; label: string }[],
  ) => (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-full bg-card sm:w-48">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={ALL}>{allLabel}</SelectItem>
        {options.map((o) => (
          <SelectItem key={o.value} value={o.value}>
            {o.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 font-heading text-2xl font-bold tracking-tight">
            <UsersRound className="size-6 text-primary" /> Graduate profiles
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            Graduates who told the Career Hub what they do and where they want to work.{" "}
            <span className="font-medium text-foreground">Only recommend graduates marked “Shares” to employers.</span>
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" className="gap-1.5" onClick={() => exportCsv(true)}>
            <Share2 className="size-4" /> Export opted-in
          </Button>
          <Button variant="ghost" className="gap-1.5" onClick={() => exportCsv(false)}>
            <Download className="size-4" /> Export all (internal)
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative w-full sm:w-64">
          <Search className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Name, email or phone…" className="bg-card ps-9" />
        </div>
        {filterSelect(profession, setProfession, "All professions", CAREER_PROFESSIONS.map((p) => ({ value: p.value, label: p.en })))}
        {filterSelect(country, setCountry, "Any target country", CAREER_COUNTRIES.map((c) => ({ value: c.value, label: `${c.flag} ${c.en}` })))}
        {filterSelect(track, setTrack, "All interests", CAREER_TRACKS.map((t) => ({ value: t.value, label: t.en })))}
        <button
          type="button"
          aria-pressed={sharingOnly}
          onClick={() => setSharingOnly((s) => !s)}
          className={cn(
            "inline-flex h-9 items-center gap-1.5 rounded-full px-3.5 text-xs font-semibold ring-1 transition-colors",
            sharingOnly ? "bg-primary text-primary-foreground ring-primary" : "bg-card text-muted-foreground ring-border hover:text-foreground",
          )}
        >
          <Share2 className="size-3.5" /> Opted in only
        </button>
        <span className="ms-auto text-xs text-muted-foreground tabular-nums">
          {visible.length} profile{visible.length === 1 ? "" : "s"} · {sharingCount} opted in
        </span>
      </div>

      {loading ? (
        <div className="grid place-items-center rounded-2xl border border-border/70 bg-card py-20">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
      ) : visible.length === 0 ? (
        <div className="grid place-items-center rounded-2xl border border-dashed border-border/70 bg-card py-20 text-center">
          <UsersRound className="size-8 text-muted-foreground/60" />
          <p className="mt-3 text-sm font-medium">No profiles match</p>
          <p className="mt-1 max-w-sm text-xs text-muted-foreground">
            Graduates create a profile from Career Hub in their student portal.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-border/70 bg-card">
          <table className="w-full min-w-[1080px] text-sm">
            <thead className="border-b border-border/60 bg-muted/40 text-[11px] uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-3 text-start font-semibold">Graduate</th>
                <th className="px-4 py-3 text-start font-semibold">Profession</th>
                <th className="px-4 py-3 text-start font-semibold">Wants to work in</th>
                <th className="px-4 py-3 text-start font-semibold">Interests · programmes</th>
                <th className="px-4 py-3 text-center font-semibold">Open matches</th>
                <th className="px-4 py-3 text-start font-semibold">Employers</th>
                <th className="px-4 py-3 text-end font-semibold">Updated</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {visible.map((r) => {
                const phone = (r.user?.number ?? "").replace(/\D/g, "");
                return (
                  <tr key={r._id} className="align-top hover:bg-muted/20">
                    <td className="px-4 py-3">
                      <div className="flex items-start gap-2.5">
                        <span className="grid size-9 shrink-0 place-items-center rounded-full bg-gradient-to-br from-primary to-sky-500 text-xs font-bold text-white">
                          {getInitials(r.user?.name || "?")}
                        </span>
                        <div className="min-w-0">
                          <p className="font-semibold">{r.user?.name || "Deleted account"}</p>
                          {r.user?.email && (
                            <a href={`mailto:${r.user.email}`} className="block truncate text-xs text-muted-foreground hover:text-primary">
                              {r.user.email}
                            </a>
                          )}
                          {phone && (
                            <a
                              href={`https://wa.me/${phone}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="mt-0.5 inline-flex items-center gap-1 text-xs text-emerald-700 hover:underline dark:text-emerald-400"
                            >
                              <MessageCircle className="size-3" />
                              <span dir="ltr">{r.user?.number}</span>
                            </a>
                          )}
                          {r.user?.country && <p className="text-[11px] text-muted-foreground">{r.user.country}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs">
                      <p className="font-medium text-foreground">{r.profession || "—"}</p>
                      <p className="text-muted-foreground">
                        {[educationOf(r.educationLevel)?.en, r.yearsOfExperience != null ? `${r.yearsOfExperience} yrs` : null]
                          .filter(Boolean)
                          .join(" · ") || "—"}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-xs">
                      {r.countries.length ? (
                        <span className="flex flex-wrap gap-1">
                          {r.countries.map((c) => (
                            <span key={c} title={countryOf(c)?.en} className="rounded bg-muted px-1.5 py-0.5">
                              {countryOf(c)?.flag} {c}
                            </span>
                          ))}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">Anywhere</span>
                      )}
                    </td>
                    <td className="max-w-[280px] px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {r.tracks.map((t) => (
                          <span key={t} className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary">
                            {trackOf(t)?.en ?? t}
                          </span>
                        ))}
                      </div>
                      {r.courseSlugs.length > 0 && (
                        <p className="mt-1 text-[11px] text-muted-foreground">
                          {r.courseSlugs.map((s) => courseTitle.get(s) ?? s).join(" · ")}
                        </p>
                      )}
                      {!r.tracks.length && !r.courseSlugs.length && <span className="text-xs text-muted-foreground">—</span>}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={cn(
                          "inline-grid min-w-8 place-items-center rounded-full px-2 py-0.5 text-xs font-bold tabular-nums",
                          r.matchCount ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300" : "bg-muted text-muted-foreground",
                        )}
                      >
                        {r.matchCount}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {r.shareWithEmployers ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-semibold text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300">
                          <Share2 className="size-3" /> Shares
                        </span>
                      ) : (
                        <span className="text-[11px] text-muted-foreground">Private</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-end text-xs text-muted-foreground">{formatDate(r.updatedAt, "en")}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
