"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import {
  Bell, BellRing, ListChecks, Inbox, AlertTriangle, Archive, CheckCheck, Search, Filter,
  UserPlus, GraduationCap, CreditCard, ReceiptText, Undo2, Settings2, ExternalLink, ChevronDown,
} from "lucide-react";
import { toast } from "sonner";

import type { AdminNotif, NotifStats, NotifCategory } from "@/lib/db/notifications-admin";
import { useRouter } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const CAT_DOT: Record<NotifCategory, string> = {
  leads: "bg-warning", enrollments: "bg-success", payments: "bg-primary",
  invoices: "bg-slate-400", refunds: "bg-destructive", system: "bg-slate-400",
};
const CAT_ICON_TONE: Record<AdminNotif["icon"], string> = {
  lead: "bg-warning/10 text-warning", group: "bg-success/10 text-success", bell: "bg-muted text-muted-foreground",
};

function rowIcon(icon: AdminNotif["icon"]) {
  if (icon === "lead") return <UserPlus className="size-4" />;
  if (icon === "group") return <GraduationCap className="size-4" />;
  return <Bell className="size-4" />;
}

export function NotificationsInbox({ notifications: initial, stats: initialStats }: { notifications: AdminNotif[]; stats: NotifStats }) {
  const t = useTranslations("Admin");
  const router = useRouter();
  const [items, setItems] = React.useState(initial);
  const [active, setActive] = React.useState<"all" | "unread" | NotifCategory | "archived" | "settings">("all");
  const [search, setSearch] = React.useState("");

  const stats: NotifStats = React.useMemo(() => ({
    total: items.filter((n) => !n.archived).length,
    unread: items.filter((n) => !n.read && !n.archived).length,
    urgent: items.filter((n) => n.urgent && !n.archived).length,
    archived: items.filter((n) => n.archived).length,
  }), [items]);

  const count = (pred: (n: AdminNotif) => boolean) => items.filter(pred).length;
  const cats: { key: typeof active; label: string; icon: React.ReactNode; count?: number }[] = [
    { key: "all", label: t("anCatAll"), icon: <ListChecks className="size-4" />, count: stats.total },
    { key: "unread", label: t("anCatUnread"), icon: <Inbox className="size-4" />, count: stats.unread },
    { key: "leads", label: t("anCatLeads"), icon: <UserPlus className="size-4" />, count: count((n) => n.category === "leads" && !n.archived) },
    { key: "enrollments", label: t("anCatEnrollments"), icon: <GraduationCap className="size-4" />, count: count((n) => n.category === "enrollments" && !n.archived) },
    { key: "payments", label: t("anCatPayments"), icon: <CreditCard className="size-4" /> },
    { key: "invoices", label: t("anCatInvoices"), icon: <ReceiptText className="size-4" /> },
    { key: "refunds", label: t("anCatRefunds"), icon: <Undo2 className="size-4" /> },
    { key: "archived", label: t("anCatArchived"), icon: <Archive className="size-4" /> },
    { key: "settings", label: t("anCatSettings"), icon: <Settings2 className="size-4" /> },
  ];

  const catLabel = (c: NotifCategory) =>
    c === "leads" ? t("anCatLeads") : c === "enrollments" ? t("anCatEnrollments") : c === "payments" ? t("anCatPayments")
      : c === "invoices" ? t("anCatInvoices") : c === "refunds" ? t("anCatRefunds") : t("anCatSystem");

  const visible = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    return items.filter((n) => {
      if (active === "archived") { if (!n.archived) return false; }
      else if (n.archived) return false;
      if (active === "unread" && n.read) return false;
      if (["leads", "enrollments", "payments", "invoices", "refunds"].includes(active) && n.category !== active) return false;
      if (q && ![n.title, n.body, n.tag].some((f) => f.toLowerCase().includes(q))) return false;
      return true;
    });
  }, [items, active, search]);

  const markAll = () => { setItems((p) => p.map((n) => ({ ...n, read: true }))); toast.success(t("anMarkedAll")); };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <span className="grid size-11 place-items-center rounded-xl bg-primary/10 text-primary"><BellRing className="size-5" /></span>
          <div className="max-w-2xl">
            <h1 className="text-2xl font-bold tracking-tight">{t("anTitle")}</h1>
            <p className="mt-1 text-sm text-muted-foreground">{t("anSubtitle")}</p>
          </div>
        </div>
        <Button variant="outline" className="gap-2 shrink-0" onClick={markAll}><CheckCheck className="size-4" />{t("anMarkAll")}</Button>
      </div>

      {/* KPIs */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label={t("anKpiTotal")} value={stats.total} icon={<ListChecks className="size-5" />} tone="border-border/70 bg-card" iconTone="bg-muted text-muted-foreground" />
        <KpiCard label={t("anKpiUnread")} value={stats.unread} icon={<Inbox className="size-5" />} tone="border-warning/30 bg-warning/5" iconTone="bg-warning/15 text-warning" />
        <KpiCard label={t("anKpiUrgent")} value={stats.urgent} icon={<AlertTriangle className="size-5" />} tone="border-destructive/30 bg-destructive/5" iconTone="bg-destructive/15 text-destructive" />
        <KpiCard label={t("anKpiArchived")} value={stats.archived} icon={<Archive className="size-5" />} tone="border-border/70 bg-card" iconTone="bg-muted text-muted-foreground" />
      </div>

      <div className="grid gap-5 lg:grid-cols-[260px_1fr]">
        {/* Sidebar */}
        <aside className="space-y-4">
          <nav className="overflow-hidden rounded-2xl border border-border/70 bg-card p-2 shadow-sm">
            {cats.map((c) => (
              <button key={c.key} type="button" onClick={() => setActive(c.key)}
                className={cn("flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  active === c.key ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted/50 hover:text-foreground")}>
                {c.icon}<span className="flex-1 text-start">{c.label}</span>
                {c.count != null && c.count > 0 && (
                  <span className={cn("grid min-w-5 place-items-center rounded-full px-1.5 text-[0.7rem] font-semibold",
                    active === c.key ? "bg-primary-foreground/20 text-primary-foreground" : "bg-muted text-muted-foreground")}>{c.count}</span>
                )}
              </button>
            ))}
          </nav>
          <div className="rounded-2xl border border-border/70 bg-muted/30 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t("anTipsTitle")}</p>
            <ul className="mt-3 space-y-3 text-sm text-muted-foreground">
              <li>{t("anTip1")}</li><li>{t("anTip2")}</li><li>{t("anTip3")}</li>
            </ul>
          </div>
        </aside>

        {/* Main */}
        <section className="rounded-2xl border border-border/70 bg-card p-5 shadow-sm">
          <div className="flex items-baseline justify-between">
            <div>
              <h2 className="text-lg font-semibold">{t("anAllNotifications")}</h2>
              <p className="text-sm text-muted-foreground">{t("anInboxSub")}</p>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <div className="relative min-w-[230px] flex-1">
              <Search className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t("anSearch")} className="ps-9" />
            </div>
            <button type="button" className="inline-flex items-center gap-2 rounded-lg border border-border/70 bg-background px-3 py-2 text-sm text-muted-foreground">
              <Filter className="size-4" />{t("anAllCategories")}<ChevronDown className="size-4" />
            </button>
          </div>

          <div className="mt-4 space-y-3">
            {visible.length === 0 ? (
              <div className="grid place-items-center py-16 text-center">
                <Bell className="size-10 text-muted-foreground/40" />
                <p className="mt-3 text-sm text-muted-foreground">{t("anEmpty")}</p>
              </div>
            ) : visible.map((n) => (
              <div key={n.id} className={cn("rounded-xl border border-s-[3px] p-4 transition-colors",
                n.read ? "border-border/60 border-s-border bg-background" : "border-border/70 border-s-primary bg-muted/20")}>
                <div className="flex items-start gap-3">
                  <span className={cn("grid size-9 shrink-0 place-items-center rounded-lg", CAT_ICON_TONE[n.icon])}>{rowIcon(n.icon)}</span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="font-semibold">{n.title}</p>
                        <p className="text-sm text-muted-foreground">{n.body}</p>
                      </div>
                      <div className="flex shrink-0 items-center gap-3">
                        <span className="text-xs text-muted-foreground">{n.at}</span>
                        {n.actionLabel && n.actionHref && (
                          <Button variant="outline" size="sm" className="h-7 gap-1.5" onClick={() => router.push(n.actionHref!)}>
                            <ExternalLink className="size-3.5" />{n.actionLabel}
                          </Button>
                        )}
                      </div>
                    </div>
                    <div className="mt-2.5 flex items-center gap-2">
                      <span className="inline-flex items-center gap-1.5 text-[0.7rem] font-semibold uppercase tracking-wide text-muted-foreground">
                        <span className={cn("size-1.5 rounded-full", CAT_DOT[n.category])} />{catLabel(n.category)}
                      </span>
                      <span className="rounded-md bg-muted px-1.5 py-0.5 text-[0.7rem] font-medium text-muted-foreground">{n.tag}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

function KpiCard({ label, value, icon, tone, iconTone }: { label: string; value: number; icon: React.ReactNode; tone: string; iconTone: string }) {
  return (
    <div className={cn("flex items-center justify-between rounded-2xl border p-5 shadow-sm", tone)}>
      <div>
        <p className="text-3xl font-bold tabular-nums">{value}</p>
        <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
      </div>
      <span className={cn("grid size-10 place-items-center rounded-xl", iconTone)}>{icon}</span>
    </div>
  );
}
