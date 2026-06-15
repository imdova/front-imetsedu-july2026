"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Plus, Save, X, Trash2 } from "lucide-react";
import { toast } from "sonner";

import type { CourseVariable, VariableOption } from "@/lib/db/course-taxonomy";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

export function CourseVariablesManager({ initial }: { initial: CourseVariable[] }) {
  const t = useTranslations("Admin");
  const [vars, setVars] = React.useState<CourseVariable[]>(initial);
  const [selectedId, setSelectedId] = React.useState<string | null>(null);

  const selected = vars.find((v) => v.id === selectedId) ?? null;
  const update = (patch: Partial<CourseVariable>) =>
    setVars((p) => p.map((v) => (v.id === selectedId ? { ...v, ...patch } : v)));

  const setOption = (i: number, patch: Partial<VariableOption>) =>
    update({ options: selected!.options.map((o, idx) => (idx === i ? { ...o, ...patch } : o)) });
  const addOption = () => update({ options: [...selected!.options, { ar: "", en: "" }] });
  const removeOption = (i: number) => update({ options: selected!.options.filter((_, idx) => idx !== i) });

  const createVariable = () => {
    const id = `var_${vars.length + 1}`;
    setVars((p) => [...p, { id, nameEn: "new_variable", nameAr: "متغير جديد", options: [{ ar: "", en: "" }] }]);
    setSelectedId(id);
    toast.success(t("variableCreated"));
  };

  const deleteVariable = () => {
    if (!selected) return;
    setVars((p) => p.filter((v) => v.id !== selected.id));
    setSelectedId(null);
    toast.success(t("csVariableDeleted"));
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
      <div className="space-y-3 rounded-xl border bg-card p-4">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t("crmVariables")}</p>
          <Badge className="border-transparent bg-primary text-primary-foreground">{t("csVarsActive", { n: vars.length })}</Badge>
        </div>
        <Button className="w-full gap-1.5" onClick={createVariable}><Plus className="size-4" />{t("csCreateVariable")}</Button>
        <ul className="space-y-1 pt-1">
          {vars.map((v) => (
            <li key={v.id}>
              <button onClick={() => setSelectedId(v.id)}
                className={cn("w-full rounded-lg border-s-2 px-3 py-2.5 text-start text-sm transition-colors",
                  v.id === selectedId ? "border-s-primary bg-primary/5 font-medium text-foreground" : "border-s-transparent hover:bg-muted")}>
                {v.nameEn}
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="rounded-xl border bg-card p-6">
        {selected ? (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h3 className="font-heading text-xl font-bold">{t("csEditVariable")}</h3>
              <Button variant="ghost" size="sm" className="gap-1.5 text-destructive" onClick={deleteVariable}>
                <Trash2 className="size-4" />{t("csDeleteVariable")}
              </Button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5"><Label className="text-xs uppercase tracking-wide">{t("variableNameAr")}</Label><Input dir="rtl" value={selected.nameAr} onChange={(e) => update({ nameAr: e.target.value })} /></div>
              <div className="space-y-1.5"><Label className="text-xs uppercase tracking-wide">{t("variableNameEn")}</Label><Input value={selected.nameEn} onChange={(e) => update({ nameEn: e.target.value })} /></div>
            </div>

            <div className="space-y-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t("csRelatedOptions")}</p>
                <p className="text-sm text-muted-foreground">{t("csOptionsBilingual")}</p>
              </div>
              {selected.options.map((o, i) => (
                <div key={i} className="flex items-center gap-2">
                  <Input dir="rtl" value={o.ar} placeholder={t("csOptionAr")} onChange={(e) => setOption(i, { ar: e.target.value })} />
                  <Input value={o.en} placeholder={t("csOptionEn")} onChange={(e) => setOption(i, { en: e.target.value })} />
                  <Button variant="outline" size="icon" className="size-9 shrink-0 text-muted-foreground" onClick={() => removeOption(i)}><X className="size-4" /></Button>
                </div>
              ))}
              <Button variant="outline" size="sm" className="gap-1.5 border-dashed text-primary" onClick={addOption}><Plus className="size-4" />{t("addOption")}</Button>
            </div>

            <div className="border-t pt-4">
              <Button className="gap-1.5" onClick={() => toast.success(t("variableSaved"))}><Save className="size-4" />{t("csSaveChanges")}</Button>
            </div>
          </div>
        ) : (
          <div className="grid min-h-[280px] place-items-center text-center">
            <div className="space-y-3">
              <p className="font-heading text-lg font-bold">{t("csNoVarTitle")}</p>
              <p className="mx-auto max-w-sm text-sm text-muted-foreground">{t("csNoVarHint")}</p>
              <Button className="gap-1.5" onClick={createVariable}><Plus className="size-4" />{t("csNewVariable")}</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
