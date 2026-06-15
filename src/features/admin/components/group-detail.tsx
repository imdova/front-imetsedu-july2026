"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Video, CalendarDays, Users, Wallet, Plus, Check, Trash2 } from "lucide-react";
import { toast } from "sonner";

import type { GroupDetail, GroupStudent } from "@/lib/db/admin";
import { cn, formatCurrency, getInitials } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { AdminStatusBadge } from "./admin-status-badge";

export function GroupDetailView({ group }: { group: GroupDetail }) {
  const t = useTranslations("Admin");
  const [roster, setRoster] = React.useState(group.roster);
  const collected = roster.reduce((s, r) => s + r.paid, 0);

  const remove = (s: GroupStudent) => {
    setRoster((p) => p.filter((r) => r.id !== s.id));
    toast.success(t("studentRemoved"));
  };

  const stats = [
    { label: t("colStudents"), value: t("ofCapacity", { n: roster.length, cap: group.capacity }), icon: Users, tone: "bg-primary/10 text-primary" },
    { label: t("collected"), value: formatCurrency(collected, "EGP"), icon: Wallet, tone: "bg-success/12 text-success" },
    { label: t("colRevenue"), value: formatCurrency(group.revenue, "EGP"), icon: Wallet, tone: "bg-chart-3/15 text-chart-3" },
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="font-heading text-xl font-bold tracking-tight">{group.title}</h1>
            <p className="text-sm text-muted-foreground">{group.category} · {group.startDate} → {group.endDate}</p>
          </div>
          <AdminStatusBadge value={group.status} />
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-3">
        {stats.map((s) => (
          <div key={s.label} className="rounded-xl border border-border/70 bg-card p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <p className="text-[0.7rem] font-semibold uppercase tracking-wide text-muted-foreground">{s.label}</p>
              <span className={cn("grid size-8 place-items-center rounded-lg", s.tone)}><s.icon className="size-4" /></span>
            </div>
            <p className="mt-3 font-heading text-2xl font-semibold tabular-nums">{s.value}</p>
          </div>
        ))}
      </div>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><CalendarDays className="size-4 text-muted-foreground" />{t("scheduleTitle")}</CardTitle></CardHeader>
        <CardContent className="space-y-2.5">
          {group.schedule.map((slot, i) => (
            <div key={i} className="flex items-center justify-between rounded-lg border bg-card p-3">
              <div>
                <p className="text-sm font-medium">{slot.day}</p>
                <p className="text-xs text-muted-foreground">{slot.startTime}–{slot.endTime}</p>
              </div>
              <Button variant="outline" size="sm" className="gap-1.5" asChild>
                <a href={slot.zoomLink} target="_blank" rel="noreferrer"><Video className="size-4" />{t("zoom")}</a>
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>{t("rosterTitle")}</CardTitle>
            <Button size="sm" className="gap-1.5" onClick={() => toast.success(t("studentAdded"))}><Plus className="size-4" />{t("addStudent")}</Button>
          </div>
        </CardHeader>
        <CardContent className="px-0">
          <Table>
            <TableHeader className="bg-muted/40">
              <TableRow>
                <TableHead className="ps-6">{t("colStudent")}</TableHead>
                <TableHead>{t("colFee")}</TableHead>
                <TableHead>{t("colPaid")}</TableHead>
                <TableHead>{t("colProgress")}</TableHead>
                <TableHead>{t("colCompleted")}</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {roster.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="ps-6">
                    <div className="flex items-center gap-2.5">
                      <Avatar className="size-8 border"><AvatarFallback className="bg-primary/10 text-[10px] text-primary">{getInitials(r.name)}</AvatarFallback></Avatar>
                      <span className="font-medium">{r.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="tabular-nums">{formatCurrency(r.fee, "EGP")}</TableCell>
                  <TableCell className="tabular-nums text-success">{formatCurrency(r.paid, "EGP")}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-20 overflow-hidden rounded-full bg-muted"><div className="h-full bg-primary" style={{ width: `${r.progress}%` }} /></div>
                      <span className="text-xs tabular-nums text-muted-foreground">{r.progress}%</span>
                    </div>
                  </TableCell>
                  <TableCell>{r.completed ? <Check className="size-4 text-success" /> : <span className="text-muted-foreground">—</span>}</TableCell>
                  <TableCell className="text-end">
                    <Button variant="ghost" size="icon" className="size-8 text-muted-foreground hover:text-destructive" onClick={() => remove(r)} aria-label={t("removeStudent")}>
                      <Trash2 className="size-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
