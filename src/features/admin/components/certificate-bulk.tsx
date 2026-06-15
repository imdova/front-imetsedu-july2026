"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Award } from "lucide-react";
import { toast } from "sonner";

import type { AdminStudent } from "@/lib/db/admin";
import { getInitials } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const COHORTS = [
  "Financial Modeling Masterclass — June",
  "Corporate Finance Foundations — May",
  "Investment Analysis & Valuation — June",
];

export function CertificateBulk({ roster }: { roster: AdminStudent[] }) {
  const t = useTranslations("Admin");
  const [cohort, setCohort] = React.useState(COHORTS[0]);
  const [selected, setSelected] = React.useState<Set<string>>(() => new Set(roster.map((r) => r.id)));

  const allSelected = selected.size === roster.length && roster.length > 0;
  const toggle = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  const toggleAll = () => setSelected(allSelected ? new Set() : new Set(roster.map((r) => r.id)));

  const issue = () => {
    toast.success(t("bulkIssued", { count: selected.size }));
    setSelected(new Set());
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{t("selectCohort")}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Select value={cohort} onValueChange={setCohort}>
          <SelectTrigger className="w-full sm:w-96"><SelectValue /></SelectTrigger>
          <SelectContent>
            {COHORTS.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>

        <div className="rounded-xl border border-border/70">
          <label className="flex cursor-pointer items-center gap-3 border-b border-border/60 px-4 py-2.5 text-sm font-medium">
            <Checkbox checked={allSelected} onCheckedChange={toggleAll} />
            {t("selectAll")}
          </label>
          <ul className="divide-y divide-border/50">
            {roster.map((s) => (
              <li key={s.id}>
                <label className="flex cursor-pointer items-center gap-3 px-4 py-2.5">
                  <Checkbox checked={selected.has(s.id)} onCheckedChange={() => toggle(s.id)} />
                  <Avatar className="size-8"><AvatarFallback className="text-xs">{getInitials(s.name)}</AvatarFallback></Avatar>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{s.name}</p>
                    <p className="truncate text-xs text-muted-foreground">{s.email}</p>
                  </div>
                </label>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex justify-end">
          <Button className="gap-1.5" disabled={selected.size === 0} onClick={issue}>
            <Award className="size-4" />
            {t("issueSelected", { count: selected.size })}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
