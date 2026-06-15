"use client";

import { useTranslations } from "next-intl";
import { CalendarClock, Check } from "lucide-react";
import { toast } from "sonner";

import { Link } from "@/i18n/navigation";
import type { Lead, FollowUpStatus } from "@/lib/db/crm";
import { cn, getInitials } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface Item {
  leadId: string;
  leadName: string;
  note: string;
  date: string;
  status: FollowUpStatus;
}

const GROUPS: { status: FollowUpStatus; labelKey: string; style: string }[] = [
  { status: "overdue", labelKey: "overdue", style: "bg-destructive/12 text-destructive" },
  { status: "today", labelKey: "todayLabel", style: "bg-warning/18 text-warning" },
  { status: "upcoming", labelKey: "upcoming", style: "bg-chart-3/15 text-chart-3" },
];

export function FollowUpsList({ leads, basePath }: { leads: Lead[]; basePath: string }) {
  const t = useTranslations("Crm") as unknown as (k: string) => string;

  const items: Item[] = leads.flatMap((l) =>
    l.followUps.map((f) => ({
      leadId: l.id,
      leadName: l.fullName,
      note: f.note,
      date: f.date,
      status: f.status,
    })),
  );

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {GROUPS.map((g) => {
        const groupItems = items.filter((i) => i.status === g.status);
        return (
          <Card key={g.status}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <CalendarClock className="size-4 text-muted-foreground" />
                  {t(g.labelKey)}
                </CardTitle>
                <Badge className={cn("border-transparent", g.style)}>
                  {groupItems.length}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-2.5">
              {groupItems.length ? (
                groupItems.map((i, idx) => (
                  <div key={`${i.leadId}-${idx}`} className="rounded-lg border bg-card p-3">
                    <div className="flex items-center gap-2.5">
                      <Avatar className="size-7 border">
                        <AvatarFallback className="bg-primary/10 text-[10px] text-primary">
                          {getInitials(i.leadName)}
                        </AvatarFallback>
                      </Avatar>
                      <Link href={`${basePath}/leads/${i.leadId}`}
                        className="flex-1 truncate text-sm font-medium hover:text-primary">
                        {i.leadName}
                      </Link>
                      <Button variant="ghost" size="icon" className="size-7 text-muted-foreground hover:text-success"
                        onClick={() => toast.success(t("markDone"))} aria-label={t("markDone")}>
                        <Check className="size-4" />
                      </Button>
                    </div>
                    <p className="mt-1.5 text-sm text-muted-foreground">{i.note}</p>
                    <p className="text-xs text-muted-foreground">{i.date}</p>
                  </div>
                ))
              ) : (
                <p className="py-6 text-center text-sm text-muted-foreground">—</p>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
