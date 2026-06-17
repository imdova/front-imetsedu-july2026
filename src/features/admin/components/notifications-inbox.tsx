"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import {
  Bell, BellRing, ListChecks, Inbox, AlertTriangle, Archive, CheckCheck, Search,
  UserPlus, GraduationCap, ReceiptText, Undo2, ExternalLink, X,
  ChevronLeft, ChevronRight, Loader2, Trash2,
} from "lucide-react";
import { toast } from "sonner";

import type { AdminNotif, NotifCategory } from "@/lib/db/notifications-admin";
import type { NotifPage } from "@/lib/dal/notifications-admin";
import { dal } from "@/lib/dal";
import { useRouter } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// ─── Constants ────────────────────────────────────────────────────────────────

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

// ─── Component ────────────────────────────────────────────────────────────────

type ActiveFilter = "all" | "unread" | NotifCategory | "archived";

export function NotificationsInbox({ initialPage }: { initialPage: NotifPage }) {
  const t = useTranslations("Admin");
  const router = useRouter();

  // All loaded items across pages
  const [items, setItems] = React.useState<AdminNotif[]>(initialPage.items);
  const [unreadCount, setUnreadCount] = React.useState(initialPage.unreadCount);
  const [meta, setMeta] = React.useState(initialPage.meta);

  const [active, setActive] = React.useState<ActiveFilter>("all");
  const [search, setSearch] = React.useState("");
  const [loadingMore, setLoadingMore] = React.useState(false);
  const [markingAll, setMarkingAll] = React.useState(false);
  const [clearingAll, setClearingAll] = React.useState(false);

  // ─── Derived stats ──────────────────────────────────────────────────────────

  const stats = {
    total: meta.total,
    unread: unreadCount,
    urgent: items.filter((n) => n.urgent && !n.archived).length,
    archived: items.filter((n) => n.archived).length,
  };

  // ─── Sidebar categories ─────────────────────────────────────────────────────

  const count = (pred: (n: AdminNotif) => boolean) => items.filter(pred).length;
  const cats: { key: ActiveFilter; label: string; icon: React.ReactNode; count?: number }[] = [
    { key: "all", label: t("anCatAll"), icon: <ListChecks className="size-4" />, count: stats.total },
    { key: "unread", label: t("anCatUnread"), icon: <Inbox className="size-4" />, count: stats.unread },
    { key: "leads", label: t("anCatLeads"), icon: <UserPlus className="size-4" />, count: count((n) => n.category === "leads" && !n.archived) },
    { key: "enrollments", label: t("anCatEnrollments"), icon: <GraduationCap className="size-4" />, count: count((n) => n.category === "enrollments" && !n.archived) },
    { key: "invoices", label: t("anCatInvoices"), icon: <ReceiptText className="size-4" />, count: count((n) => n.category === "invoices" && !n.archived) },
    { key: "refunds", label: t("anCatRefunds"), icon: <Undo2 className="size-4" />, count: count((n) => n.category === "refunds" && !n.archived) },
    { key: "archived", label: t("anCatArchived"), icon: <Archive className="size-4" />, count: stats.archived },
  ];

  const catLabel = (c: NotifCategory) =>
    c === "leads" ? t("anCatLeads") : c === "enrollments" ? t("anCatEnrollments") : c === "payments" ? t("anCatPayments")
      : c === "invoices" ? t("anCatInvoices") : c === "refunds" ? t("anCatRefunds") : t("anCatSystem");

  // ─── Visible items ──────────────────────────────────────────────────────────

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

  // ─── Pagination ─────────────────────────────────────────────────────────────

  const hasMore = meta.page < meta.totalPages;

  const loadMore = async () => {
    setLoadingMore(true);
    const res = await dal.notificationsAdmin.fetchAdminNotifications(meta.page + 1, meta.limit);
    setLoadingMore(false);
    if (!res.ok) { toast.error(t("anLoadError")); return; }
    setItems((prev) => {
      const existingIds = new Set(prev.map((n) => n.id));
      const fresh = res.data.items.filter((n) => !existingIds.has(n.id));
      return [...prev, ...fresh];
    });
    setMeta(res.data.meta);
    setUnreadCount(res.data.unreadCount);
  };

  // ─── Mutations ───────────────────────────────────────────────────────────────

  const markAll = async () => {
    setMarkingAll(true);
    const res = await dal.notificationsAdmin.markAllRead();
    setMarkingAll(false);
    if (!res.ok) { toast.error(t("anMarkAllError")); return; }
    setItems((p) => p.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
    toast.success(t("anMarkedAll"));
  };

  const markOne = async (id: string) => {
    const notif = items.find((n) => n.id === id);
    if (!notif || notif.read) return;
    await dal.notificationsAdmin.markOneRead(id);
    setItems((p) => p.map((n) => n.id === id ? { ...n, read: true } : n));
    setUnreadCount((prev) => Math.max(0, prev - 1));
  };

  const deleteOne = async (id: string) => {
    const wasUnread = !items.find((n) => n.id === id)?.read;
    await dal.notificationsAdmin.deleteNotif(id);
    setItems((p) => p.filter((n) => n.id !== id));
    setMeta((m) => ({ ...m, total: Math.max(0, m.total - 1) }));
    if (wasUnread) setUnreadCount((prev) => Math.max(0, prev - 1));
  };

  const clearAllNotifs = async () => {
    if (!confirm(t("anClearConfirm"))) return;
    setClearingAll(true);
    const res = await dal.notificationsAdmin.clearAll();
    setClearingAll(false);
    if (!res.ok) { toast.error(t("anClearError")); return; }
    setItems([]);
    setUnreadCount(0);
    setMeta((m) => ({ ...m, total: 0, totalPages: 0 }));
    toast.success(t("anCleared"));
  };

  // ─── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <span className="grid size-11 place-items-center rounded-xl bg-primary/10 text-primary">
            <BellRing className="size-5" />
          </span>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{t("anTitle")}</h1>
            <p className="mt-1 text-sm text-muted-foreground">{t("anSubtitle")}</p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Button variant="outline" size="sm" className="gap-2" onClick={markAll} disabled={unreadCount === 0 || markingAll}>
            {markingAll ? <Loader2 className="size-4 animate-spin" /> : <CheckCheck className="size-4" />}
            {t("anMarkAll")}
          </Button>
          <Button variant="outline" size="sm" className="gap-2 text-destructive hover:text-destructive" onClick={clearAllNotifs} disabled={clearingAll || items.length === 0}>
            {clearingAll ? <Loader2 className="size-4 animate-spin" /> : <Trash2 className="size-4" />}
            {t("anClearAll")}
          </Button>
        </div>
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
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative min-w-[220px] flex-1">
              <Search className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t("anSearch")} className="ps-9" />
            </div>
            <p className="text-sm text-muted-foreground">
              {t("anShowing", { shown: items.length, total: meta.total })}
            </p>
          </div>

          <div className="mt-4 space-y-2">
            {visible.length === 0 ? (
              <div className="grid place-items-center py-16 text-center">
                <Bell className="size-10 text-muted-foreground/40" />
                <p className="mt-3 text-sm text-muted-foreground">{t("anEmpty")}</p>
              </div>
            ) : visible.map((n) => (
              <NotifRow
                key={n.id}
                notif={n}
                catLabel={catLabel}
                onMarkRead={markOne}
                onDelete={deleteOne}
                onNavigate={(href) => router.push(href)}
              />
            ))}
          </div>

          {/* Pagination */}
          {(hasMore || meta.totalPages > 1) && (
            <div className="mt-6 flex items-center justify-center gap-3">
              <span className="text-xs text-muted-foreground">
                {t("anPage", { page: meta.page, total: meta.totalPages })}
              </span>
              {hasMore && (
                <Button variant="outline" size="sm" className="gap-1.5" onClick={loadMore} disabled={loadingMore}>
                  {loadingMore ? <Loader2 className="size-4 animate-spin" /> : <ChevronRight className="size-4" />}
                  {t("anLoadMore")}
                </Button>
              )}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

// ─── Notification row ─────────────────────────────────────────────────────────

function NotifRow({
  notif: n,
  catLabel,
  onMarkRead,
  onDelete,
  onNavigate,
}: {
  notif: AdminNotif;
  catLabel: (c: NotifCategory) => string;
  onMarkRead: (id: string) => void;
  onDelete: (id: string) => void;
  onNavigate: (href: string) => void;
}) {
  return (
    <div
      className={cn(
        "group rounded-xl border border-s-[3px] p-4 transition-colors",
        n.read
          ? "border-border/60 border-s-border bg-background"
          : "border-border/70 border-s-primary bg-muted/20",
      )}
    >
      <div className="flex items-start gap-3">
        <span className={cn("grid size-9 shrink-0 place-items-center rounded-lg", CAT_ICON_TONE[n.icon])}>
          {rowIcon(n.icon)}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div className="min-w-0">
              <p className={cn("font-semibold", n.read && "font-medium text-foreground/80")}>{n.title}</p>
              <p className="text-sm text-muted-foreground">{n.body}</p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <span className="text-xs text-muted-foreground">{n.at}</span>
              {!n.read && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 gap-1 px-2 text-xs opacity-0 transition-opacity group-hover:opacity-100"
                  onClick={() => onMarkRead(n.id)}
                >
                  <CheckCheck className="size-3.5" />
                </Button>
              )}
              {n.actionLabel && n.actionHref && (
                <Button variant="outline" size="sm" className="h-7 gap-1.5" onClick={() => onNavigate(n.actionHref!)}>
                  <ExternalLink className="size-3.5" />{n.actionLabel}
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                className="size-7 opacity-0 transition-opacity hover:text-destructive group-hover:opacity-100"
                onClick={() => onDelete(n.id)}
              >
                <X className="size-3.5" />
              </Button>
            </div>
          </div>
          <div className="mt-2.5 flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 text-[0.7rem] font-semibold uppercase tracking-wide text-muted-foreground">
              <span className={cn("size-1.5 rounded-full", CAT_DOT[n.category])} />
              {catLabel(n.category)}
            </span>
            <span className="rounded-md bg-muted px-1.5 py-0.5 text-[0.7rem] font-medium text-muted-foreground">{n.tag}</span>
            {!n.read && (
              <span className="ms-auto size-2 rounded-full bg-primary" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── KPI card ─────────────────────────────────────────────────────────────────

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
