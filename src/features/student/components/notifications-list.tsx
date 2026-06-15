"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Award, BellRing, FileText, GraduationCap, Megaphone, Wallet, CheckCheck } from "lucide-react";
import { toast } from "sonner";

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

export function NotificationsList({ items }: { items: Notification[] }) {
  const t = useTranslations("Student");
  const [list, setList] = React.useState(items);
  const unread = list.filter((n) => !n.read).length;

  const markAll = async () => {
    const res = await dal.student.markAllRead();
    if (res.ok) {
      setList((prev) => prev.map((n) => ({ ...n, read: true })));
      toast.success(t("markAllRead"));
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button variant="outline" size="sm" className="gap-1.5" onClick={markAll} disabled={!unread}>
          <CheckCheck className="size-4" /> {t("markAllRead")}
        </Button>
      </div>
      <ul className="space-y-2.5">
        {list.map((n) => {
          const cfg = ICON[n.type];
          return (
            <li key={n.id}
              className={cn(
                "flex items-start gap-3 rounded-xl border p-4 transition-colors",
                n.read ? "border-border/70 bg-card" : "border-primary/30 bg-primary/5",
              )}>
              <span className={cn("grid size-10 shrink-0 place-items-center rounded-lg", cfg.style)}>
                <cfg.icon className="size-5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-medium">{n.title}</p>
                <p className="text-sm text-muted-foreground">{n.description}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{n.createdAt}</p>
              </div>
              {!n.read && <span className="mt-2 size-2 shrink-0 rounded-full bg-primary" />}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
