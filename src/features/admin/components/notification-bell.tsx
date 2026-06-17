"use client";

import * as React from "react";
import { Bell, CheckCheck, X, UserPlus, GraduationCap, ExternalLink, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

import { Link } from "@/i18n/navigation";
import { dal } from "@/lib/dal";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import type { AdminNotif } from "@/lib/db/notifications-admin";

function NotifIcon({ icon }: { icon: AdminNotif["icon"] }) {
  if (icon === "lead") return <UserPlus className="size-3.5" />;
  if (icon === "group") return <GraduationCap className="size-3.5" />;
  return <Bell className="size-3.5" />;
}

const ICON_TONE: Record<AdminNotif["icon"], string> = {
  lead: "bg-warning/10 text-warning",
  group: "bg-success/10 text-success",
  bell: "bg-muted text-muted-foreground",
};

export function NotificationBell() {
  const t = useTranslations();
  const [unread, setUnread] = React.useState(0);
  const [items, setItems] = React.useState<AdminNotif[]>([]);
  const [open, setOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [markingAll, setMarkingAll] = React.useState(false);

  // Fetch unread count on mount and refresh every 60 s
  React.useEffect(() => {
    dal.notificationsAdmin.fetchUnreadCount().then((r) => { if (r.ok) setUnread(r.data); });
    const id = setInterval(() => {
      dal.notificationsAdmin.fetchUnreadCount().then((r) => { if (r.ok) setUnread(r.data); });
    }, 60_000);
    return () => clearInterval(id);
  }, []);

  // Load recent notifications when popover opens
  React.useEffect(() => {
    if (!open) return;
    setLoading(true);
    dal.notificationsAdmin.fetchAdminNotifications(1, 10).then((r) => {
      if (r.ok) {
        setItems(r.data.items);
        setUnread(r.data.unreadCount);
      }
      setLoading(false);
    });
  }, [open]);

  const markAll = async () => {
    setMarkingAll(true);
    const res = await dal.notificationsAdmin.markAllRead();
    setMarkingAll(false);
    if (!res.ok) { toast.error("Failed to mark all as read"); return; }
    setItems((p) => p.map((n) => ({ ...n, read: true })));
    setUnread(0);
    toast.success(t("Admin.anMarkedAll"));
  };

  const markOne = async (id: string) => {
    const notif = items.find((n) => n.id === id);
    if (!notif || notif.read) return;
    await dal.notificationsAdmin.markOneRead(id);
    setItems((p) => p.map((n) => n.id === id ? { ...n, read: true } : n));
    setUnread((prev) => Math.max(0, prev - 1));
  };

  const dismiss = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    await dal.notificationsAdmin.deleteNotif(id);
    const wasUnread = !items.find((n) => n.id === id)?.read;
    setItems((p) => p.filter((n) => n.id !== id));
    if (wasUnread) setUnread((prev) => Math.max(0, prev - 1));
  };

  const hasUnread = unread > 0;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative" aria-label={t("Header.notifications")}>
          <Bell className={cn("size-5 transition-colors", hasUnread && "text-primary")} />
          {hasUnread && (
            <Badge className="absolute -end-0.5 -top-0.5 min-w-4 justify-center rounded-full p-0 px-1 text-[10px]">
              {unread > 99 ? "99+" : unread}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent
        align="end"
        sideOffset={8}
        className="flex max-h-[min(480px,80vh)] w-[380px] flex-col gap-0 overflow-hidden border p-0 shadow-2xl"
      >
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between border-b px-4 py-3">
          <div className="flex items-center gap-2">
            <Bell className="size-4 text-primary" />
            <span className="text-sm font-semibold">{t("Header.notifications")}</span>
            {unread > 0 && (
              <Badge variant="secondary" className="h-5 rounded-full px-1.5 text-[10px]">
                {unread > 99 ? "99+" : unread}
              </Badge>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 gap-1.5 px-2 text-xs text-muted-foreground"
            disabled={unread === 0 || markingAll}
            onClick={markAll}
          >
            {markingAll ? <Loader2 className="size-3.5 animate-spin" /> : <CheckCheck className="size-3.5" />}
            {t("Admin.anMarkAll")}
          </Button>
        </div>

        {/* Body */}
        {loading ? (
          <div className="grid h-40 shrink-0 place-items-center">
            <Loader2 className="size-6 animate-spin text-muted-foreground" />
          </div>
        ) : items.length === 0 ? (
          <div className="grid h-40 shrink-0 place-items-center text-center">
            <div>
              <Bell className="mx-auto size-8 text-muted-foreground/30" />
              <p className="mt-2 text-sm text-muted-foreground">{t("Admin.anEmpty")}</p>
            </div>
          </div>
        ) : (
          <div className="min-h-0 flex-1 overflow-y-auto">
            <div className="divide-y">
              {items.map((n) => (
                <div
                  key={n.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => markOne(n.id)}
                  onKeyDown={(e) => e.key === "Enter" && markOne(n.id)}
                  className={cn(
                    "relative flex cursor-default items-start gap-3 px-4 py-3 text-start transition-colors hover:bg-muted/40",
                    !n.read && "bg-primary/[0.03]",
                  )}
                >
                  {/* Unread dot */}
                  {!n.read && (
                    <span className="absolute start-1.5 top-4 size-1.5 rounded-full bg-primary" />
                  )}

                  {/* Icon */}
                  <span className={cn("mt-0.5 grid size-7 shrink-0 place-items-center rounded-lg", ICON_TONE[n.icon])}>
                    <NotifIcon icon={n.icon} />
                  </span>

                  {/* Content */}
                  <div className="min-w-0 flex-1">
                    <p className={cn("text-xs leading-snug", !n.read ? "font-semibold" : "font-medium text-muted-foreground")}>
                      {n.title}
                    </p>
                    <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">{n.body}</p>
                    <p className="mt-1 text-[10px] text-muted-foreground/70">{n.at}</p>
                  </div>

                  {/* Actions */}
                  <div className="flex shrink-0 flex-col items-end gap-1.5">
                    {n.actionHref && (
                      <a
                        href={n.actionHref}
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center gap-0.5 text-[10px] text-primary hover:underline"
                      >
                        <ExternalLink className="size-3" />
                        {t("Admin.anView")}
                      </a>
                    )}
                    <button
                      type="button"
                      onClick={(e) => dismiss(e, n.id)}
                      className="rounded p-0.5 text-muted-foreground/50 transition-colors hover:bg-destructive/10 hover:text-destructive"
                      title={t("Admin.anDismiss")}
                    >
                      <X className="size-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="shrink-0 border-t px-4 py-2.5">
          <Link
            href="/admin/notifications"
            onClick={() => setOpen(false)}
            className="flex w-full items-center justify-center gap-1.5 text-xs font-medium text-primary hover:underline"
          >
            {t("Admin.anViewAll")}
            <ExternalLink className="size-3" />
          </Link>
        </div>
      </PopoverContent>
    </Popover>
  );
}
