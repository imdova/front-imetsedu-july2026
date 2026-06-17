"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Award, BellRing, FileText, GraduationCap, Megaphone, Wallet, CheckCheck, ArrowRight } from "lucide-react";
import { toast } from "sonner";

import { Link } from "@/i18n/navigation";
import type { Notification, NotificationType } from "@/lib/db/student";
import { dal } from "@/lib/dal";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const ICON: Record<NotificationType, { icon: React.ElementType; style: string }> = {
  grade: { icon: GraduationCap, style: "bg-success/15 text-success" },
  deadline: { icon: BellRing, style: "bg-destructive/12 text-destructive" },
  content: { icon: FileText, style: "bg-chart-3/15 text-chart-3" },
  announce: { icon: Megaphone, style: "bg-primary/12 text-primary" },
  cert: { icon: Award, style: "bg-warning/18 text-warning" },
  payment: { icon: Wallet, style: "bg-chart-2/15 text-chart-2" },
};

/** Where each notification type sends the student, with the link label key. */
const ACTION: Record<NotificationType, { href: string; key: string }> = {
  grade: { href: "/student/grades", key: "notifViewGrades" },
  deadline: { href: "/student/assignments", key: "notifViewInbox" },
  content: { href: "/student/courses", key: "notifViewCourse" },
  announce: { href: "/student/schedule", key: "notifViewSchedule" },
  cert: { href: "/student/certificates", key: "notifViewCertificate" },
  payment: { href: "/student/billing", key: "notifViewBilling" },
};

type TabKey = "all" | "deadlines" | "announcements" | "billing";
const TAB_TYPES: Record<TabKey, NotificationType[] | null> = {
  all: null,
  deadlines: ["deadline"],
  announcements: ["announce", "content", "grade", "cert"],
  billing: ["payment"],
};
const TABS: { key: TabKey; labelKey: string }[] = [
  { key: "all", labelKey: "notifTabAll" },
  { key: "deadlines", labelKey: "notifTabDeadlines" },
  { key: "announcements", labelKey: "notifTabAnnouncements" },
  { key: "billing", labelKey: "notifTabBilling" },
];

export function NotificationsList({ items }: { items: Notification[] }) {
  const t = useTranslations("Student");
  const [list, setList] = React.useState(items);
  const [tab, setTab] = React.useState<TabKey>("all");
  const unread = list.filter((n) => !n.read).length;

  const inTab = (n: Notification, k: TabKey) => {
    const types = TAB_TYPES[k];
    return types === null || types.includes(n.type);
  };
  const count = (k: TabKey) => list.filter((n) => inTab(n, k)).length;
  const visible = list.filter((n) => inTab(n, tab));

  const markAll = async () => {
    const res = await dal.student.markAllRead();
    if (res.ok) {
      setList((prev) => prev.map((n) => ({ ...n, read: true })));
      toast.success(t("markAllRead"));
    }
  };

  return (
    <div className="space-y-4">
      {/* Toolbar: filter tabs + mark all read */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {TABS.map((x) => {
            const c = count(x.key);
            if (x.key !== "all" && c === 0) return null;
            return (
              <button key={x.key} type="button" onClick={() => setTab(x.key)}
                className={cn("inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors",
                  tab === x.key ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-muted-foreground hover:text-foreground")}>
                {t(x.labelKey as never)}
                <span className={cn("grid min-w-5 place-items-center rounded-full px-1 text-[0.7rem] font-bold",
                  tab === x.key ? "bg-white/20 text-white" : "bg-muted text-muted-foreground")}>{c}</span>
              </button>
            );
          })}
        </div>
        <Button variant="outline" size="sm" className="gap-1.5" onClick={markAll} disabled={!unread}>
          <CheckCheck className="size-4" /> {t("markAllRead")}
        </Button>
      </div>

      <ul className="space-y-2.5">
        {visible.map((n) => {
          const cfg = ICON[n.type];
          const action = ACTION[n.type];
          return (
            <li key={n.id}
              className={cn(
                "flex items-start gap-3 rounded-xl border-s-4 border border-border/70 bg-card p-4 transition-colors",
                !n.read && "border-s-primary bg-primary/[0.03]",
              )}>
              <span className={cn("grid size-10 shrink-0 place-items-center rounded-lg", cfg.style)}>
                <cfg.icon className="size-5" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-3">
                  <p className="font-medium">{n.title}</p>
                  <span className="shrink-0 text-xs text-muted-foreground">{n.createdAt}</span>
                </div>
                <p className="text-sm text-muted-foreground">{n.description}</p>
                <Link href={action.href} className="mt-1.5 inline-flex items-center gap-1 text-sm font-medium text-primary no-underline hover:underline">
                  {t(action.key as never)} <ArrowRight className="size-3.5 rtl:rotate-180" />
                </Link>
              </div>
              {!n.read && <span className="mt-1 size-2 shrink-0 rounded-full bg-primary" />}
            </li>
          );
        })}
        {visible.length === 0 && (
          <li className="grid place-items-center rounded-xl border border-dashed border-border/70 bg-card py-16 text-center text-sm text-muted-foreground">
            {t("notifEmpty")}
          </li>
        )}
      </ul>
    </div>
  );
}
