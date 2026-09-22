"use client";

import * as React from "react";
import { Award, Banknote, Bell, ClipboardList, Loader2, Target, UserPlus } from "lucide-react";

import { Link } from "@/i18n/navigation";
import { dal } from "@/lib/dal";
import type { StaffActivityItem, StaffActivityKind, StaffActivityPage } from "@/lib/dal/staff-insights";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

const KIND_STYLE: Record<StaffActivityKind, { label: string; icon: typeof Bell; className: string }> = {
  lead: { label: "Lead actions", icon: Target, className: "bg-primary/10 text-primary" },
  assignment: { label: "Assignments", icon: UserPlus, className: "bg-info/10 text-info" },
  commission: { label: "Commission", icon: Banknote, className: "bg-success/10 text-success" },
  notification: { label: "System events", icon: Bell, className: "bg-muted text-muted-foreground" },
  training: { label: "Training", icon: Award, className: "bg-warning/10 text-warning" },
};

const dayLabel = (iso: string) => {
  const d = new Date(iso);
  const today = new Date();
  const diff = Math.floor((today.setHours(0, 0, 0, 0) - new Date(iso).setHours(0, 0, 0, 0)) / 86_400_000);
  if (diff === 0) return "Today";
  if (diff === 1) return "Yesterday";
  return d.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short", year: "numeric" });
};

const time = (iso: string) => new Date(iso).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });

/**
 * The Activity tab: everything the system recorded for this person, newest
 * first — lead actions they performed, leads assigned to them, commission
 * deals, system events they triggered, and their orientation milestones.
 * Filter by kind or date, and page through with "Load more".
 */
export function UserActivity({ userId, initial }: { userId: string; initial: StaffActivityPage | null }) {
  const [items, setItems] = React.useState<StaffActivityItem[]>(initial?.items ?? []);
  const [page, setPage] = React.useState(initial?.page ?? 1);
  const [total, setTotal] = React.useState(initial?.total ?? 0);
  const [kinds] = React.useState(initial?.kinds ?? []);
  const [kind, setKind] = React.useState<StaffActivityKind | "">("");
  const [from, setFrom] = React.useState("");
  const [to, setTo] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(initial ? null : "Couldn't load activity.");

  const limit = initial?.limit ?? 50;

  const load = async (opts: { page: number; kind?: StaffActivityKind | ""; from?: string; to?: string; append?: boolean }) => {
    setLoading(true);
    const res = await dal.staffInsights.fetchStaffActivity(userId, {
      page: opts.page,
      limit,
      kind: opts.kind || undefined,
      from: opts.from || undefined,
      to: opts.to || undefined,
    });
    setLoading(false);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    setError(null);
    setTotal(res.data.total);
    setPage(res.data.page);
    setItems((prev) => (opts.append ? [...prev, ...res.data.items] : res.data.items));
  };

  const applyFilter = (next: { kind?: StaffActivityKind | ""; from?: string; to?: string }) => {
    const k = next.kind ?? kind;
    const f = next.from ?? from;
    const t = next.to ?? to;
    setKind(k);
    setFrom(f);
    setTo(t);
    void load({ page: 1, kind: k, from: f, to: t });
  };

  // Group the visible page by day for a readable timeline.
  const groups = React.useMemo(() => {
    const map = new Map<string, StaffActivityItem[]>();
    for (const item of items) {
      const key = new Date(item.at).toISOString().slice(0, 10);
      map.set(key, [...(map.get(key) ?? []), item]);
    }
    return [...map.entries()];
  }, [items]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-3">
        <div className="flex flex-wrap gap-1.5">
          <FilterChip active={kind === ""} onClick={() => applyFilter({ kind: "" })}>
            All
          </FilterChip>
          {kinds.map((k) => (
            <FilterChip key={k.kind} active={kind === k.kind} onClick={() => applyFilter({ kind: k.kind })}>
              {KIND_STYLE[k.kind]?.label ?? k.kind} ({k.count})
            </FilterChip>
          ))}
        </div>
        <label className="ms-auto text-xs text-muted-foreground">
          From
          <Input type="date" value={from} onChange={(e) => applyFilter({ from: e.target.value })} className="mt-1 h-9 w-40" />
        </label>
        <label className="text-xs text-muted-foreground">
          To
          <Input type="date" value={to} onChange={(e) => applyFilter({ to: e.target.value })} className="mt-1 h-9 w-40" />
        </label>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Card>
        <CardContent className="py-4">
          {items.length === 0 && !loading ? (
            <p className="py-10 text-center text-sm text-muted-foreground">
              Nothing recorded for this person{kind || from || to ? " with these filters" : " yet"}.
            </p>
          ) : (
            <div className="space-y-6">
              {groups.map(([day, dayItems]) => (
                <section key={day}>
                  <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-muted-foreground">{dayLabel(day)}</h3>
                  <ol className="relative space-y-3 border-s border-border/70 ps-5">
                    {dayItems.map((item) => {
                      const style = KIND_STYLE[item.kind] ?? KIND_STYLE.notification;
                      const Icon = style.icon;
                      const href =
                        item.entityType === "Lead" && item.entityId
                          ? `/admin/crm/leads/${item.entityId}`
                          : item.entityType === "OrientationProgress"
                            ? `/admin/orientation/progress/${userId}`
                            : null;
                      return (
                        <li key={item.id} className="relative">
                          <span
                            className={cn(
                              "absolute -start-[1.85rem] grid size-6 place-items-center rounded-full ring-4 ring-card",
                              style.className,
                            )}
                          >
                            <Icon className="size-3.5" />
                          </span>
                          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5">
                            <p className="text-sm font-medium">
                              {href ? (
                                <Link href={href} className="hover:text-primary hover:underline">
                                  {item.title}
                                </Link>
                              ) : (
                                item.title
                              )}
                            </p>
                            <span className="text-xs text-muted-foreground tabular-nums">{time(item.at)}</span>
                          </div>
                          {item.detail && <p className="text-[13px] leading-relaxed text-muted-foreground" dir="auto">{item.detail}</p>}
                        </li>
                      );
                    })}
                  </ol>
                </section>
              ))}
            </div>
          )}

          <div className="mt-4 flex items-center justify-between gap-3 border-t border-border/50 pt-3 text-xs text-muted-foreground">
            <span className="tabular-nums">
              Showing {items.length} of {total}
            </span>
            {items.length < total && (
              <Button variant="outline" size="sm" className="gap-1.5" disabled={loading} onClick={() => load({ page: page + 1, kind, from, to, append: true })}>
                {loading && <Loader2 className="size-3.5 animate-spin" />}
                Load more
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <p className="flex items-start gap-2 text-xs text-muted-foreground">
        <ClipboardList className="mt-0.5 size-3.5 shrink-0" />
        Activity is built from records that name this user: lead actions they performed, leads assigned to them, commission deals,
        system events they triggered and their orientation milestones. Lead stage changes only carry a name from 17 Sep 2026 on, so
        older entries may be missing.
      </p>
    </div>
  );
}

function FilterChip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
        active ? "border-primary bg-primary/10 text-primary" : "border-border/70 hover:border-primary/40",
      )}
    >
      {children}
    </button>
  );
}
