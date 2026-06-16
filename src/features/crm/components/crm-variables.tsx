"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { SlidersHorizontal, Plus, Search, Save, X, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { listCrmSettings, createCrmSetting, updateCrmSetting, deleteCrmSetting } from "@integration/services/crm-settings";
import type { CrmSetting } from "@integration/services/crm-settings/types";

export function CrmVariables() {
  const t = useTranslations("Admin");

  const [crmSettings, setCrmSettings] = React.useState<CrmSetting[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [selectedId, setSelectedId] = React.useState<string>("");
  const [nameAr, setNameAr] = React.useState("");
  const [nameEn, setNameEn] = React.useState("");
  const [options, setOptions] = React.useState<string[]>([]);
  const [isSaving, setIsSaving] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const [confirmDel, setConfirmDel] = React.useState<CrmSetting | null>(null);

  const isStagesSetting = selectedId === "6a25bd99f90982c9b47c4d22";

  const fetchSettings = React.useCallback(async () => {
    setLoading(true);
    const result = await listCrmSettings();
    if (result.ok) {
      setCrmSettings(result.data || []);
    }
    setLoading(false);
  }, []);

  React.useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const handleSelect = (id: string) => {
    setSelectedId(id);
    const setting = crmSettings.find(s => (s.id || s._id) === id);
    if (setting) {
      setNameAr(setting.nameAr);
      setNameEn(setting.nameEn);
      setOptions([...(setting.options || [])]);
    } else {
      setNameAr("");
      setNameEn("");
      setOptions([]);
    }
  };

  const handleCreateNew = () => {
    setSelectedId("new");
    setNameAr("");
    setNameEn("");
    setOptions([""]);
  };

  const handleSave = async () => {
    if (!nameAr.trim() || !nameEn.trim()) {
      toast.error("Both Arabic and English names are required");
      return;
    }
    const finalOptions = options.filter(o => o.trim());
    if (finalOptions.length === 0) {
      toast.error("At least one option is required");
      return;
    }

    setIsSaving(true);
    const payload = {
      nameAr: nameAr.trim(),
      nameEn: nameEn.trim(),
      options: finalOptions,
    };

    if (selectedId === "new") {
      const result = await createCrmSetting(payload);
      if (result.ok) {
        toast.success("Variable created successfully");
        await fetchSettings();
        handleCreateNew();
      } else {
        toast.error(result.error || "Failed to create variable");
      }
    } else {
      const result = await updateCrmSetting(selectedId, payload);
      if (result.ok) {
        toast.success("Variable updated successfully");
        await fetchSettings();
      } else {
        toast.error(result.error || "Failed to update variable");
      }
    }
    setIsSaving(false);
  };

  const doDelete = async () => {
    if (!confirmDel) return;
    const id = confirmDel.id || confirmDel._id;
    if (!id) return;

    setIsSaving(true);
    const result = await deleteCrmSetting(id);
    if (result.ok) {
      toast.success("Variable deleted successfully");
      if (selectedId === id) {
        setSelectedId("");
        setNameAr("");
        setNameEn("");
        setOptions([]);
      }
      await fetchSettings();
    } else {
      toast.error(result.error || "Failed to delete variable");
    }
    setIsSaving(false);
    setConfirmDel(null);
  };

  const filteredSettings = crmSettings.filter(s =>
    s.nameEn?.toLowerCase().includes(search.toLowerCase()) ||
    s.nameAr?.toLowerCase().includes(search.toLowerCase())
  );

  const selected = selectedId === "new" ? { id: "new", nameAr, nameEn, options } : crmSettings.find((v) => (v.id || v._id) === selectedId);

  return (
    <div className="space-y-4">
      <div className="inline-flex rounded-lg border p-0.5">
        <span className="inline-flex items-center gap-1.5 rounded-md bg-primary/10 px-3 py-1.5 text-sm font-medium text-primary">
          <SlidersHorizontal className="size-4" />{t("crmTabVariables")}
        </span>
      </div>

      <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
        {/* Variable list */}
        <div className="space-y-3 rounded-xl border bg-muted/20 p-4 flex flex-col min-h-[500px]">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t("crmVariables")}</p>
            <Badge variant="secondary" className="tabular-nums">{crmSettings.length}</Badge>
          </div>
          <Button className="w-full gap-1.5" onClick={handleCreateNew} variant={selectedId === "new" ? "secondary" : "default"}><Plus className="size-4" />{t("createVariable")}</Button>
          <div className="relative">
            <Search className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t("filterVariables")} className="ps-9" />
          </div>
          <ul className="space-y-1 flex-1 overflow-y-auto max-h-[400px]">
            {loading ? (
              <div className="flex flex-col items-center py-8 gap-2">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                <p className="text-xs text-muted-foreground">Loading...</p>
              </div>
            ) : filteredSettings.length === 0 ? (
              <p className="px-4 py-8 text-center text-sm text-muted-foreground">No variables found</p>
            ) : (
              filteredSettings.map((v) => {
                const id = v.id || v._id;
                return (
                  <li key={id} className="group relative flex items-center justify-between">
                    <button onClick={() => handleSelect(id!)}
                      className={cn("w-full rounded-lg px-3 py-2 text-start text-sm transition-colors",
                        id === selectedId ? "bg-primary text-primary-foreground" : "hover:bg-muted")}>
                      {v.nameEn}
                    </button>
                    {id && !["6a25bd99f90982c9b47c4d22", "6a08697bc6c81845408ae446", "6a0608f837c10d66e58b01da", "6a05eda937c10d66e58b0154", "6a05e1f537c10d66e58aff55"].includes(id) && (
                      <Button variant="ghost" size="icon" onClick={() => setConfirmDel(v)}
                        className="absolute right-2 opacity-0 group-hover:opacity-100 size-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-all"
                        aria-label="Delete variable">
                        <Trash2 className="size-4" />
                      </Button>
                    )}
                  </li>
                );
              })
            )}
          </ul>
        </div>

        {/* Editor */}
        <div className="space-y-5 rounded-xl border bg-card p-6">
          {selectedId && selected ? (
            <div className="space-y-5">
              <h2 className="font-heading text-lg font-bold">
                {selectedId === "new" ? "New CRM Variable" : t("editVariable")}
              </h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label>{t("variableNameAr")}</Label>
                  <Input dir="rtl" value={nameAr} onChange={(e) => setNameAr(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label>{t("variableNameEn")}</Label>
                  <Input value={nameEn} onChange={(e) => setNameEn(e.target.value)} />
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t("variableOptions")}</p>
                <p className="text-sm text-muted-foreground">{t("variableOptionsHelp")}</p>
                <div className="space-y-2">
                  {options.map((o, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <Input value={o} onChange={(e) => {
                        const next = [...options];
                        next[i] = e.target.value;
                        setOptions(next);
                      }} />
                      {!isStagesSetting && (
                        <Button variant="ghost" size="icon" className="size-9 shrink-0 text-muted-foreground"
                          onClick={() => setOptions(options.filter((_, idx) => idx !== i))}
                          aria-label={t("deleteOption")}>
                          <X className="size-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                  {!isStagesSetting && (
                    <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setOptions([...options, ""])}><Plus className="size-4" />{t("addOption")}</Button>
                  )}
                </div>
              </div>

              <div className="border-t pt-4">
                <Button className="gap-1.5" onClick={handleSave} disabled={isSaving}>
                  {isSaving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
                  {selectedId === "new" ? "Create Variable" : t("saveVariable")}
                </Button>
              </div>
            </div>
          ) : (
            <div className="py-12 px-6 text-center text-muted-foreground text-sm flex flex-col items-center justify-center min-h-[400px]">
              <p className="m-0 mb-2 text-base font-semibold text-foreground">No variable selected</p>
              <p className="max-w-xs mx-auto text-center text-muted-foreground">
                Create a new variable or select one from the list to configure its name and options.
              </p>
              <Button onClick={handleCreateNew} className="mt-6 gap-2">
                <Plus className="h-4 w-4" />
                New Variable
              </Button>
            </div>
          )}
        </div>
      </div>

      <Dialog open={!!confirmDel} onOpenChange={(o) => !o && setConfirmDel(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Variable</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete variable &quot;{confirmDel?.nameEn}&quot;? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDel(null)}>Cancel</Button>
            <Button variant="destructive" onClick={doDelete} disabled={isSaving}>
              {isSaving && <Loader2 className="size-4 animate-spin me-2" />}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
