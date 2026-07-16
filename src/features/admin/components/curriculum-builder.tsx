"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { ListChecks, Plus, GripVertical, Trash2, ChevronUp, ChevronDown, Video, Loader2, Save, FileText, ExternalLink } from "lucide-react";
import { toast } from "sonner";

import { dal } from "@/lib/dal";
import type { CurriculumModule, CurriculumItem, VideoSource } from "@/lib/db/lms";
import type { QuizRow, QuizCategoryOption } from "@/lib/dal/quizzes";
import { cn, createId } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useConfirm } from "@/hooks/use-confirm";
import { useResetOnChange } from "@/hooks/use-reset-on-change";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";

function cloneModules(mods: CurriculumModule[]): CurriculumModule[] {
  return mods.map((m) => ({ ...m, items: m.items.map((i) => ({ ...i })) }));
}

export function CurriculumBuilder({
  initial,
  courseId,
  onUpdate,
}: {
  initial: CurriculumModule[];
  courseId: string;
  onUpdate?: () => void;
}) {
  const t = useTranslations("Admin");
  const [modules, setModules] = React.useState<CurriculumModule[]>(() => cloneModules(initial));
  const [collapsed, setCollapsed] = React.useState<Set<string>>(new Set());
  const [availableQuizzes, setAvailableQuizzes] = React.useState<QuizRow[]>([]);
  const [quizCategories, setQuizCategories] = React.useState<QuizCategoryOption[]>([]);
  const { confirm, Confirmation } = useConfirm();
  const [loading, setLoading] = React.useState(false);
  const [hasChanges, setHasChanges] = React.useState(false);

  // Quiz modal states
  const [quizModalOpen, setQuizModalOpen] = React.useState(false);
  const [quizModIdx, setQuizModIdx] = React.useState<number>(-1);
  const [selectedCategoryId, setSelectedCategoryId] = React.useState("");
  const [selectedQuizId, setSelectedQuizId] = React.useState("");

  // HTML5 Drag and Drop refs
  const dragItem = React.useRef<{ modIdx: number; itemIdx: number } | null>(null);
  const dragOver = React.useRef<{ modIdx: number; itemIdx: number } | null>(null);
  const dragMod = React.useRef<number | null>(null);
  const dragModOver = React.useRef<number | null>(null);

  // Re-seed from the prop when it changes; adjusting during render avoids
  // committing the previous course's modules first.
  useResetOnChange([initial], () => {
    setModules(cloneModules(initial));
    setHasChanges(false);
  });

  React.useEffect(() => {
    (async () => {
      const [qRes, catRes] = await Promise.all([
        dal.quizzes.fetchQuizzes(),
        dal.quizzes.fetchQuizCategories(),
      ]);
      if (qRes.ok && qRes.data) setAvailableQuizzes(qRes.data);
      if (catRes.ok && catRes.data) setQuizCategories(catRes.data);
    })();
  }, []);

  const mark = () => setHasChanges(true);

  // Module actions
  const addModule = () => {
    const title = t("cbModuleN", { n: modules.length + 1 });
    const tempId = createId("temp_mod");
    setModules((p) => [...p, { id: tempId, title, items: [] }]);
    mark();
  };

  const removeModule = async (idx: number) => {
    const ok = await confirm({
      title: t("cbDeleteModule"),
      description: t("cbDeleteModuleConfirm"),
      confirmText: t("cbDelete"),
      cancelText: t("cbCancel"),
      variant: "destructive",
    });
    if (!ok) return;
    setModules((p) => p.filter((_, i) => i !== idx));
    mark();
  };

  const updateModTitle = (idx: number, title: string) => {
    setModules((p) => p.map((m, i) => (i === idx ? { ...m, title } : m)));
    mark();
  };

  // Item actions
  const addLesson = (modIdx: number) => {
    const mod = modules[modIdx];
    const n = mod.items.filter((i) => i.type === "lesson").length + 1;
    const title = t("cbLessonN", { n });
    const tempId = createId("temp_les");
    setModules((p) =>
      p.map((m, i) =>
        i === modIdx
          ? {
              ...m,
              items: [
                ...m.items,
                { id: tempId, type: "lesson", title, videoSource: "youtube", videoUrl: "" },
              ],
            }
          : m
      )
    );
    mark();
  };

  const openQuizModal = (modIdx: number) => {
    setQuizModIdx(modIdx);
    setSelectedCategoryId("");
    setSelectedQuizId("");
    setQuizModalOpen(true);
  };

  const confirmAddQuiz = () => {
    if (quizModIdx < 0 || !selectedQuizId) return;
    const quiz = availableQuizzes.find((q) => q.id === selectedQuizId);
    if (!quiz) return;
    const tempId = createId("temp_quiz");
    setModules((p) =>
      p.map((m, i) =>
        i === quizModIdx
          ? {
              ...m,
              items: [
                ...m.items,
                { id: tempId, title: quiz.titleEn || quiz.titleAr, type: "quiz", quiz: selectedQuizId },
              ],
            }
          : m
      )
    );
    setQuizModalOpen(false);
    mark();
  };

  const updateItem = (modIdx: number, itemIdx: number, updates: Partial<CurriculumItem>) => {
    setModules((p) =>
      p.map((m, mi) =>
        mi === modIdx
          ? {
              ...m,
              items: m.items.map((it, ii) => (ii === itemIdx ? { ...it, ...updates } : it)),
            }
          : m
      )
    );
    mark();
  };

  const deleteItem = (modIdx: number, itemIdx: number) => {
    setModules((p) =>
      p.map((m, mi) =>
        mi === modIdx
          ? { ...m, items: m.items.filter((_, ii) => ii !== itemIdx) }
          : m
      )
    );
    mark();
  };

  const moveItem = (modIdx: number, from: number, to: number) => {
    if (from === to) return;
    setModules((p) =>
      p.map((m, mi) => {
        if (mi !== modIdx) return m;
        const items = [...m.items];
        const [moved] = items.splice(from, 1);
        items.splice(to, 0, moved);
        return { ...m, items };
      })
    );
    mark();
  };

  // Drag and Drop handlers
  const onDragStart = (modIdx: number, itemIdx: number) => {
    dragItem.current = { modIdx, itemIdx };
  };
  const onDragEnter = (modIdx: number, itemIdx: number) => {
    dragOver.current = { modIdx, itemIdx };
  };
  const onDragEnd = () => {
    if (dragItem.current && dragOver.current && dragItem.current.modIdx === dragOver.current.modIdx) {
      moveItem(dragItem.current.modIdx, dragItem.current.itemIdx, dragOver.current.itemIdx);
    }
    dragItem.current = null;
    dragOver.current = null;
  };

  const onModDragStart = (idx: number) => { dragMod.current = idx; };
  const onModDragEnter = (idx: number) => { dragModOver.current = idx; };
  const onModDragEnd = () => {
    if (dragMod.current !== null && dragModOver.current !== null && dragMod.current !== dragModOver.current) {
      setModules((p) => {
        const arr = [...p];
        const [moved] = arr.splice(dragMod.current!, 1);
        arr.splice(dragModOver.current!, 0, moved);
        return arr;
      });
      mark();
    }
    dragMod.current = null;
    dragModOver.current = null;
  };

  const toggleCollapse = (id: string) =>
    setCollapsed((p) => {
      const n = new Set(p);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });

  const handleSave = async () => {
    setLoading(true);
    const cleaned = modules.map(({ id, items, ...m }) => {
      return {
        title: m.title,
        items: items.map(({ id: itId, ...it }) => {
          const body: any = {
            title: it.title,
            type: it.type,
          };
          if (it.type === "lesson") {
            body.contentType = it.videoSource === "youtube" ? "youtube_url" : "vdocipher_embed";
            body.contentUrl = it.videoUrl || "";
          } else if (it.type === "quiz") {
            body.quiz = typeof it.quiz === "object" && it.quiz ? (it.quiz as any).id ?? (it.quiz as any)._id : it.quiz;
          }
          return body;
        }),
      };
    });

    const res = await dal.lms.updateLmsCourse(courseId, { modules: cleaned });
    if (res.ok) {
      toast.success(t("cbSaved"));
      setHasChanges(false);
      if (onUpdate) onUpdate();
    } else {
      toast.error(res.error || "Failed to save");
    }
    setLoading(false);
  };

  const filteredQuizzes = availableQuizzes.filter((q) => {
    if (!selectedCategoryId) return true;
    return q.categoryId === selectedCategoryId;
  });

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="inline-flex items-center gap-2 font-heading text-xl font-bold tracking-tight">
            <ListChecks className="size-5 text-primary" />
            {t("cbTitle")}
          </h2>
          <p className="text-sm text-muted-foreground">{t("cbSubtitle")}</p>
        </div>
        <div className="flex items-center gap-3">
          {hasChanges && (
            <span className="text-xs font-semibold uppercase tracking-wide text-amber-600 bg-amber-50 px-2.5 py-1 rounded border border-amber-100">
              {t("cbUnsaved")}
            </span>
          )}
          <Button
            onClick={handleSave}
            disabled={loading || !hasChanges}
            className="gap-2"
          >
            {loading ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Save className="size-4" />
            )}
            {t("cbSave")}
          </Button>
        </div>
      </div>

      <div className="rounded-xl border bg-card p-5">
        <div className="mb-4 flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {t("cbModules")}
          </p>
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 text-primary"
            onClick={addModule}
          >
            <Plus className="size-4" />
            {t("cbAddModule")}
          </Button>
        </div>

        <div className="space-y-4">
          {modules.map((mod, mi) => {
            const isCollapsed = collapsed.has(mod.id);
            return (
              <div
                key={mod.id}
                className="rounded-xl border bg-muted/20"
                onDragOver={(e) => e.preventDefault()}
              >
                <div className="flex items-center gap-2 p-3">
                  <div
                    className="text-muted-foreground cursor-grab shrink-0"
                    draggable
                    onDragStart={() => onModDragStart(mi)}
                    onDragEnter={() => onModDragEnter(mi)}
                    onDragEnd={onModDragEnd}
                    onDragOver={(e) => e.preventDefault()}
                  >
                    <GripVertical className="size-4" />
                  </div>
                  <Input
                    value={mod.title}
                    onChange={(e) => updateModTitle(mi, e.target.value)}
                    className="h-8 max-w-xs border-transparent bg-transparent px-1 font-heading font-bold focus-visible:border-border focus-visible:bg-background"
                  />
                  <span className="ms-auto text-xs text-muted-foreground tabular-nums">
                    {t("cbItemsN", { n: mod.items.length })}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-8"
                    onClick={() => toggleCollapse(mod.id)}
                  >
                    {isCollapsed ? (
                      <ChevronDown className="size-4" />
                    ) : (
                      <ChevronUp className="size-4" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-8 text-destructive"
                    onClick={() => removeModule(mi)}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>

                {!isCollapsed && (
                  <div className="space-y-3 px-3 pb-3">
                    {mod.items.map((item, ii) => {
                      const isLesson = item.type === "lesson";
                      return (
                        <div
                          key={item.id}
                          className="rounded-lg border bg-card p-3"
                          draggable
                          onDragStart={(e) => {
                            e.stopPropagation();
                            onDragStart(mi, ii);
                          }}
                          onDragEnter={() => onDragEnter(mi, ii)}
                          onDragEnd={onDragEnd}
                          onDragOver={(e) => e.preventDefault()}
                        >
                          <div className="flex items-center gap-2">
                            <div className="text-muted-foreground cursor-grab shrink-0">
                              <GripVertical className="size-4" />
                            </div>
                            <span
                              className={cn(
                                "rounded px-1.5 py-0.5 text-xs font-semibold uppercase",
                                isLesson
                                  ? "bg-primary/12 text-primary"
                                  : "bg-chart-3/15 text-chart-3"
                              )}
                            >
                              {isLesson ? t("cbLesson") : t("cbQuiz")}
                            </span>
                            <Input
                              value={item.title}
                              onChange={(e) =>
                                updateItem(mi, ii, { title: e.target.value })
                              }
                              className="h-8 max-w-sm border-transparent bg-transparent px-1 font-medium focus-visible:border-border focus-visible:bg-background"
                            />
                            <Button
                              variant="ghost"
                              size="icon"
                              className="ms-auto size-8 text-destructive"
                              onClick={() => deleteItem(mi, ii)}
                            >
                              <Trash2 className="size-4" />
                            </Button>
                          </div>

                          {isLesson ? (
                            <div className="mt-3 space-y-2.5 ps-6">
                              <div className="flex flex-wrap items-center gap-4 text-sm">
                                {(["youtube", "vdocipher"] as VideoSource[]).map((src) => (
                                  <label
                                    key={src}
                                    className="inline-flex cursor-pointer items-center gap-1.5"
                                  >
                                    <input
                                      type="radio"
                                      name={`src_${item.id}`}
                                      checked={item.videoSource === src}
                                      onChange={() =>
                                        updateItem(mi, ii, { videoSource: src })
                                      }
                                      className="accent-primary"
                                    />
                                    {src === "youtube"
                                      ? t("cbYoutube")
                                      : t("cbVdocipher")}
                                  </label>
                                ))}
                              </div>
                              <div className="relative">
                                {item.videoSource === "youtube" ? (
                                  <Video className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-destructive" />
                                ) : (
                                  <ExternalLink className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-primary" />
                                )}
                                <Input
                                  dir="ltr"
                                  value={item.videoUrl ?? ""}
                                  onChange={(e) =>
                                    updateItem(mi, ii, { videoUrl: e.target.value })
                                  }
                                  placeholder={
                                    item.videoSource === "youtube"
                                      ? t("cbYoutubePh")
                                      : t("cbVdoPh")
                                  }
                                  className="ps-9"
                                />
                              </div>
                            </div>
                          ) : (
                            <div className="mt-3 space-y-2.5 ps-6">
                              <div className="flex items-center gap-2 px-3 py-2 bg-amber-50/50 dark:bg-amber-950/20 rounded-lg border border-amber-100 dark:border-amber-900/50 text-amber-700 dark:text-amber-400">
                                <FileText className="size-4 shrink-0" />
                                <span className="text-xs font-medium truncate">
                                  {typeof item.quiz === "object"
                                    ? item.quiz.titleEn || item.quiz.titleAr
                                    : availableQuizzes.find((q) => q.id === item.quiz)
                                        ?.titleEn ||
                                      availableQuizzes.find((q) => q.id === item.quiz)
                                        ?.titleAr ||
                                      "Linked Quiz"}
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}

                    <div className="grid gap-3 sm:grid-cols-2">
                      <Button
                        variant="outline"
                        className="border-dashed text-primary"
                        onClick={() => addLesson(mi)}
                      >
                        <Plus className="size-4" />
                        {t("cbAddLesson")}
                      </Button>
                      <Button
                        variant="outline"
                        className="border-dashed text-primary"
                        onClick={() => openQuizModal(mi)}
                      >
                        <Plus className="size-4" />
                        {t("cbAddQuiz")}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {Confirmation}

      {/* Quiz Selection Modal */}
      <Dialog open={quizModalOpen} onOpenChange={setQuizModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t("cbSelectQuiz")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-muted-foreground">
                {t("cbCategory")}
              </label>
              <select
                className="w-full px-3 py-2 bg-background border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                value={selectedCategoryId}
                onChange={(e) => {
                  setSelectedCategoryId(e.target.value);
                  setSelectedQuizId("");
                }}
              >
                <option value="">{t("cbAllCategories")}</option>
                {quizCategories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-muted-foreground">
                {t("cbQuiz")}
              </label>
              <select
                className="w-full px-3 py-2 bg-background border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                value={selectedQuizId}
                onChange={(e) => setSelectedQuizId(e.target.value)}
                disabled={!filteredQuizzes.length}
              >
                <option value="">{t("cbSelectQuizPh")}</option>
                {filteredQuizzes.map((q) => (
                  <option key={q.id} value={q.id}>
                    {q.titleEn || q.titleAr}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setQuizModalOpen(false)}
            >
              {t("cbCancel")}
            </Button>
            <Button
              onClick={confirmAddQuiz}
              disabled={!selectedQuizId}
            >
              {t("cbAddToModule")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
