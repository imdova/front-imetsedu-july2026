"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Mail, Phone, Award, CalendarDays, Wallet, Receipt } from "lucide-react";

import type { AdminStudentDetail } from "@/lib/db/admin";
import type { PaymentPlanSummary, PlanInstallmentStatus } from "@/lib/db/crm";
import { dal } from "@/lib/dal";
import { cn, formatCurrency, getInitials } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AdminStatusBadge } from "./admin-status-badge";

const INSTALLMENT_STYLE: Record<PlanInstallmentStatus, string> = {
  PAID: "bg-success/15 text-success",
  UPCOMING: "bg-muted text-muted-foreground",
  DUE: "bg-warning/18 text-warning",
};

export function StudentDetail({ student }: { student: AdminStudentDetail }) {
  const t = useTranslations("Admin");
  // The real installment plan lives on the student's CRM lead. Look it up by
  // email after mount so the server render never blocks on an auth-gated fetch;
  // on any failure the plan stays null and we fall back to the payment list.
  const [plan, setPlan] = React.useState<PaymentPlanSummary | undefined>(undefined);
  React.useEffect(() => {
    const email = student.email?.trim().toLowerCase();
    if (!email) return;
    let active = true;
    dal.crm.fetchLeads({ search: email }).then((res) => {
      if (!active || !res.ok) return;
      setPlan(res.data.find((l) => l.email?.trim().toLowerCase() === email)?.paymentPlan);
    }).catch(() => {});
    return () => { active = false; };
  }, [student.email]);

  return (
    <div className="grid gap-6 lg:grid-cols-[340px_1fr]">
      <Card className="h-fit">
        <CardContent className="space-y-4 pt-6">
          <div className="flex items-center gap-3">
            <Avatar className="size-14">
              <AvatarFallback>{getInitials(student.name)}</AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="truncate font-heading text-lg font-semibold">{student.name}</p>
              <AdminStatusBadge value={student.status} />
            </div>
          </div>
          <dl className="space-y-2.5 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground"><Mail className="size-4" />{student.email}</div>
            <div className="flex items-center gap-2 text-muted-foreground"><Phone className="size-4" />{student.phone}</div>
            <div className="flex items-center gap-2 text-muted-foreground"><CalendarDays className="size-4" />{student.joinedAt}</div>
            <div className="flex items-center gap-2 text-muted-foreground"><Wallet className="size-4" />{formatCurrency(student.totalSpent, "EGP")}</div>
          </dl>
        </CardContent>
      </Card>

      <div className="space-y-6">
        <Card>
          <CardHeader><CardTitle className="text-base">{t("sectionEnrolment")}</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {student.courses.map((c) => (
              <div key={c.title} className="space-y-1.5">
                <div className="flex items-center justify-between gap-3 text-sm">
                  <span className="truncate font-medium">{c.title}</span>
                  <AdminStatusBadge value={c.status} />
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                    <div className={cn("h-full rounded-full", c.status === "completed" ? "bg-success" : "bg-primary")} style={{ width: `${c.progress}%` }} />
                  </div>
                  <span className="shrink-0 text-xs text-muted-foreground tabular-nums">{c.progress}%</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between gap-2 text-base">
              {t("sectionPayments")}
              {plan && <AdminStatusBadge value={plan.status === "PAID" ? "paid" : plan.status === "PARTIAL" ? "partial" : "pending"} />}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {plan ? (
              <>
                <div className="grid grid-cols-3 gap-2 rounded-lg border bg-muted/20 p-3 text-center text-sm">
                  <div><p className="text-xs text-muted-foreground">{t("spdTotal")}</p><p className="font-semibold tabular-nums">{formatCurrency(plan.totalAmount, plan.currency)}</p></div>
                  <div><p className="text-xs text-muted-foreground">{t("spdPaid")}</p><p className="font-semibold tabular-nums text-success">{formatCurrency(plan.paid, plan.currency)}</p></div>
                  <div><p className="text-xs text-muted-foreground">{t("spdOutstanding")}</p><p className="font-semibold tabular-nums text-destructive">{formatCurrency(plan.totalAmount - plan.paid, plan.currency)}</p></div>
                </div>
                <ul className="space-y-2">
                  {plan.installments.map((ins) => (
                    <li key={ins.index} className="flex items-center gap-3 rounded-lg border p-2.5 text-sm">
                      <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-muted/60 text-xs font-medium tabular-nums text-muted-foreground">{ins.index}/{plan.installments.length}</span>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium tabular-nums">{formatCurrency(ins.amount, plan.currency)}</p>
                        <p className="truncate text-xs text-muted-foreground">{ins.label} · {ins.dueDate}</p>
                      </div>
                      {ins.receiptUrl && <span className="grid size-7 shrink-0 place-items-center rounded-md border bg-muted/60 text-muted-foreground"><Receipt className="size-3.5" /></span>}
                      <Badge className={cn("shrink-0 border-transparent text-[0.65rem] font-semibold uppercase", INSTALLMENT_STYLE[ins.status])}>{ins.status}</Badge>
                    </li>
                  ))}
                </ul>
              </>
            ) : student.payments.length ? (
              <div className="space-y-2">
                {student.payments.map((p) => (
                  <div key={p.id} className="flex items-center justify-between border-b border-border/50 py-2 text-sm last:border-0">
                    <span className="text-muted-foreground tabular-nums">{p.date}</span>
                    <span className="font-medium tabular-nums">{formatCurrency(p.amount, "EGP")}</span>
                    <AdminStatusBadge value={p.status} />
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">{t("noData")}</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">{t("sectionCertificates")}</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {student.certificates.length === 0 && <p className="text-sm text-muted-foreground">{t("noData")}</p>}
            {student.certificates.map((c) => (
              <div key={c.code} className="flex items-center gap-3 text-sm">
                <span className="grid size-9 place-items-center rounded-lg bg-warning/18 text-warning"><Award className="size-4" /></span>
                <div className="min-w-0">
                  <p className="truncate font-medium">{c.course}</p>
                  <p className="text-xs text-muted-foreground tabular-nums">{c.code} · {c.issuedAt}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
