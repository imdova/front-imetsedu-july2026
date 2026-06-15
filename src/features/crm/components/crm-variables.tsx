"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { SlidersHorizontal, Plus, Search, Save, X } from "lucide-react";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

interface CrmVariable {
  id: string;
  nameEn: string;
  nameAr: string;
  options: string[];
}

const SEED: CrmVariable[] = [
  { id: "stages", nameEn: "stages", nameAr: "المراحل", options: ["New Inquiries", "Contacted and Qualified", "Waiting Payment", "Enrolled", "Lost"] },
  { id: "status", nameEn: "status", nameAr: "الحالة", options: ["Cold", "Warm", "Hot"] },
  { id: "education", nameEn: "Current Education Level", nameAr: "المستوى التعليمي الحالي", options: ["Diploma", "Bachelor's", "Master's", "PhD"] },
  { id: "source", nameEn: "Lead source", nameAr: "مصدر العميل", options: ["Website", "Referral", "Facebook", "WhatsApp", "Walk-in"] },
  { id: "specialty", nameEn: "Specialty", nameAr: "التخصص", options: ["Dentist", "Nurse", "Pharmacist", "Physician", "Technician"] },
];

export function CrmVariables() {
  const t = useTranslations("Admin");
  const [vars, setVars] = React.useState<CrmVariable[]>(SEED);
  const [selectedId, setSelectedId] = React.useState<string>(SEED[0].id);
  const [filter, setFilter] = React.useState("");

  const selected = vars.find((v) => v.id === selectedId) ?? vars[0];
  const filtered = vars.filter((v) => v.nameEn.toLowerCase().includes(filter.toLowerCase()));

  const update = (patch: Partial<CrmVariable>) =>
    setVars((prev) => prev.map((v) => (v.id === selected.id ? { ...v, ...patch } : v)));

  const setOption = (i: number, value: string) =>
    update({ options: selected.options.map((o, idx) => (idx === i ? value : o)) });
  const removeOption = (i: number) => update({ options: selected.options.filter((_, idx) => idx !== i) });
  const addOption = () => update({ options: [...selected.options, ""] });

  const createVariable = () => {
    const id = `var_${vars.length + 1}`;
    const fresh: CrmVariable = { id, nameEn: "new_variable", nameAr: "متغير جديد", options: [""] };
    setVars((prev) => [...prev, fresh]);
    setSelectedId(id);
    toast.success(t("variableCreated"));
  };

  return (
    <div className="space-y-4">
      <div className="inline-flex rounded-lg border p-0.5">
        <span className="inline-flex items-center gap-1.5 rounded-md bg-primary/10 px-3 py-1.5 text-sm font-medium text-primary">
          <SlidersHorizontal className="size-4" />{t("crmTabVariables")}
        </span>
      </div>

      <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
        {/* Variable list */}
        <div className="space-y-3 rounded-xl border bg-muted/20 p-4">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t("crmVariables")}</p>
            <Badge variant="secondary" className="tabular-nums">{vars.length}</Badge>
          </div>
          <Button className="w-full gap-1.5" onClick={createVariable}><Plus className="size-4" />{t("createVariable")}</Button>
          <div className="relative">
            <Search className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={filter} onChange={(e) => setFilter(e.target.value)} placeholder={t("filterVariables")} className="ps-9" />
          </div>
          <ul className="space-y-1">
            {filtered.map((v) => (
              <li key={v.id}>
                <button onClick={() => setSelectedId(v.id)}
                  className={cn("w-full rounded-lg px-3 py-2 text-start text-sm transition-colors",
                    v.id === selected.id ? "bg-primary text-primary-foreground" : "hover:bg-muted")}>
                  {v.nameEn}
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Editor */}
        <div className="space-y-5 rounded-xl border bg-card p-6">
          <h2 className="font-heading text-lg font-bold">{t("editVariable")}</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>{t("variableNameAr")}</Label>
              <Input dir="rtl" value={selected.nameAr} onChange={(e) => update({ nameAr: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>{t("variableNameEn")}</Label>
              <Input value={selected.nameEn} onChange={(e) => update({ nameEn: e.target.value })} />
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t("variableOptions")}</p>
            <p className="text-sm text-muted-foreground">{t("variableOptionsHelp")}</p>
            <div className="space-y-2">
              {selected.options.map((o, i) => (
                <div key={i} className="flex items-center gap-2">
                  <Input value={o} onChange={(e) => setOption(i, e.target.value)} />
                  <Button variant="ghost" size="icon" className="size-9 shrink-0 text-muted-foreground" onClick={() => removeOption(i)} aria-label={t("deleteOption")}>
                    <X className="size-4" />
                  </Button>
                </div>
              ))}
              <Button variant="outline" size="sm" className="gap-1.5" onClick={addOption}><Plus className="size-4" />{t("addOption")}</Button>
            </div>
          </div>

          <div className="border-t pt-4">
            <Button className="gap-1.5" onClick={() => toast.success(t("variableSaved"))}><Save className="size-4" />{t("saveVariable")}</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
