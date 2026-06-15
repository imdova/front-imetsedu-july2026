"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { ListChecks, Plus, GripVertical, Trash2, ChevronUp, ChevronDown, Video, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { dal } from "@/lib/dal";
import type { CurriculumModule, CurriculumItem, VideoSource } from "@/lib/db/lms";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

/** Every structural edit persists immediately to the backend; text/url edits
 * persist on blur. No "Save" button needed — the curriculum is always synced. */
export function CurriculumBuilder({ initial, courseId }: { initial: CurriculumModule[]; courseId: string }) {
  const t = useTranslations("Admin");
  const [modules, setModules] = React.useState<CurriculumModule[]>(initial);
  const [collapsed, setCollapsed] = React.useState<Set<string>>(new Set());
  const [busy, setBusy] = React.useState(false);

  const run = async <T,>(p: Promise<{ ok: boolean; data?: T; error?: string }>): Promise<T | null> => {
    setBusy(true);
    const res = await p;
    setBusy(false);
    if (!res.ok) { toast.error(res.error); return null; }
    return res.data ?? (null as T);
  };

  const addModule = async () => {
    const title = t("cbModuleN", { n: modules.length + 1 });
    const m = await run(dal.lms.addLmsModule(courseId, title));
    if (m) setModules((p) => [...p, { id: m.id, title: m.title, items: [] }]);
  };
  const removeModule = async (id: string) => {
    const prev = modules;
    setModules((p) => p.filter((x) => x.id !== id));
    const res = await dal.lms.deleteLmsModule(courseId, id);
    if (!res.ok) { setModules(prev); toast.error(res.error); }
  };
  const renameModuleLocal = (id: string, title: string) =>
    setModules((p) => p.map((x) => (x.id === id ? { ...x, title } : x)));
  const persistModule = async (id: string, title: string) => {
    const res = await dal.lms.updateLmsModuleTitle(courseId, id, title);
    if (!res.ok) toast.error(res.error);
  };

  const addItem = async (modId: string, type: "lesson" | "quiz") => {
    const mod = modules.find((m) => m.id === modId);
    const n = (mod?.items.filter((i) => i.type === type).length ?? 0) + 1;
    const title = type === "lesson" ? t("cbLessonN", { n }) : t("cbQuizN", { n });
    const created = await run(dal.lms.addLmsLesson(courseId, modId, {
      title, type, ...(type === "lesson" ? { contentType: "youtube_url" as const, contentUrl: "" } : {}),
    }));
    if (!created) return;
    const item: CurriculumItem = type === "lesson"
      ? { id: created.id, type, title, videoSource: "youtube", videoUrl: "" }
      : { id: created.id, type, title };
    setModules((p) => p.map((mod) => (mod.id === modId ? { ...mod, items: [...mod.items, item] } : mod)));
  };
  const removeItem = async (modId: string, itemId: string) => {
    const prev = modules;
    setModules((p) => p.map((mod) => (mod.id === modId ? { ...mod, items: mod.items.filter((i) => i.id !== itemId) } : mod)));
    const res = await dal.lms.deleteLmsLesson(courseId, modId, itemId);
    if (!res.ok) { setModules(prev); toast.error(res.error); }
  };
  const setItemLocal = (modId: string, itemId: string, patch: Partial<CurriculumItem>) =>
    setModules((p) => p.map((mod) => (mod.id === modId ? { ...mod, items: mod.items.map((i) => (i.id === itemId ? { ...i, ...patch } : i)) } : mod)));
  const persistItem = async (modId: string, itemId: string, patch: Partial<CurriculumItem>) => {
    const body: { title?: string; contentUrl?: string; contentType?: "youtube_url" | "vdocipher_embed" } = {};
    if (patch.title !== undefined) body.title = patch.title;
    if (patch.videoUrl !== undefined) body.contentUrl = patch.videoUrl;
    if (patch.videoSource !== undefined) body.contentType = patch.videoSource === "youtube" ? "youtube_url" : "vdocipher_embed";
    const res = await dal.lms.updateLmsLesson(courseId, modId, itemId, body);
    if (!res.ok) toast.error(res.error);
  };

  const toggleCollapse = (id: string) =>
    setCollapsed((p) => { const n = new Set(p); n.has(id) ? n.delete(id) : n.add(id); return n; });

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="inline-flex items-center gap-2 font-heading text-xl font-bold tracking-tight"><ListChecks className="size-5 text-primary" />{t("cbTitle")}</h2>
          <p className="text-sm text-muted-foreground">{t("cbSubtitle")}</p>
        </div>
        <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
          {busy ? <><Loader2 className="size-3.5 animate-spin" />{t("cbSaving")}</> : t("cbAllSaved")}
        </span>
      </div>

      <div className="rounded-xl border bg-card p-5">
        <div className="mb-4 flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{t("cbModules")}</p>
          <Button variant="outline" size="sm" className="gap-1.5 text-primary" onClick={addModule}><Plus className="size-4" />{t("cbAddModule")}</Button>
        </div>

        <div className="space-y-4">
          {modules.map((mod) => {
            const isCollapsed = collapsed.has(mod.id);
            return (
              <div key={mod.id} className="rounded-xl border bg-muted/20">
                <div className="flex items-center gap-2 p-3">
                  <GripVertical className="size-4 cursor-grab text-muted-foreground" />
                  <Input value={mod.title} onChange={(e) => renameModuleLocal(mod.id, e.target.value)} onBlur={() => persistModule(mod.id, mod.title)} className="h-8 max-w-xs border-transparent bg-transparent px-1 font-heading font-bold focus-visible:border-border focus-visible:bg-background" />
                  <span className="ms-auto text-xs text-muted-foreground tabular-nums">{t("cbItemsN", { n: mod.items.length })}</span>
                  <Button variant="ghost" size="icon" className="size-8" onClick={() => toggleCollapse(mod.id)}>{isCollapsed ? <ChevronDown className="size-4" /> : <ChevronUp className="size-4" />}</Button>
                  <Button variant="ghost" size="icon" className="size-8 text-destructive" onClick={() => removeModule(mod.id)}><Trash2 className="size-4" /></Button>
                </div>

                {!isCollapsed && (
                  <div className="space-y-3 px-3 pb-3">
                    {mod.items.map((item) => (
                      <div key={item.id} className="rounded-lg border bg-card p-3">
                        <div className="flex items-center gap-2">
                          <GripVertical className="size-4 cursor-grab text-muted-foreground" />
                          <span className={cn("rounded px-1.5 py-0.5 text-xs font-semibold uppercase", item.type === "lesson" ? "bg-primary/12 text-primary" : "bg-chart-3/15 text-chart-3")}>{item.type === "lesson" ? t("cbLesson") : t("cbQuiz")}</span>
                          <Input value={item.title} onChange={(e) => setItemLocal(mod.id, item.id, { title: e.target.value })} onBlur={() => persistItem(mod.id, item.id, { title: item.title })} className="h-8 max-w-sm border-transparent bg-transparent px-1 font-medium focus-visible:border-border focus-visible:bg-background" />
                          <Button variant="ghost" size="icon" className="ms-auto size-8 text-destructive" onClick={() => removeItem(mod.id, item.id)}><Trash2 className="size-4" /></Button>
                        </div>
                        {item.type === "lesson" && (
                          <div className="mt-3 space-y-2.5 ps-6">
                            <div className="flex flex-wrap items-center gap-4 text-sm">
                              {(["youtube", "vdocipher"] as VideoSource[]).map((src) => (
                                <label key={src} className="inline-flex cursor-pointer items-center gap-1.5">
                                  <input type="radio" name={`src_${item.id}`} checked={item.videoSource === src} onChange={() => { setItemLocal(mod.id, item.id, { videoSource: src }); persistItem(mod.id, item.id, { videoSource: src }); }} className="accent-primary" />
                                  {src === "youtube" ? t("cbYoutube") : t("cbVdocipher")}
                                </label>
                              ))}
                            </div>
                            <div className="relative">
                              <Video className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-destructive" />
                              <Input dir="ltr" value={item.videoUrl ?? ""} onChange={(e) => setItemLocal(mod.id, item.id, { videoUrl: e.target.value })} onBlur={() => persistItem(mod.id, item.id, { videoUrl: item.videoUrl ?? "" })}
                                placeholder={item.videoSource === "youtube" ? t("cbYoutubePh") : t("cbVdoPh")} className="ps-9" />
                            </div>
                          </div>
                        )}
                      </div>
                    ))}

                    <div className="grid gap-3 sm:grid-cols-2">
                      <Button variant="outline" className="border-dashed text-primary" onClick={() => addItem(mod.id, "lesson")}><Plus className="size-4" />{t("cbAddLesson")}</Button>
                      <Button variant="outline" className="border-dashed text-primary" onClick={() => addItem(mod.id, "quiz")}><Plus className="size-4" />{t("cbAddQuiz")}</Button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
