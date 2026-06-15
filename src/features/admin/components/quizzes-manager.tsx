"use client";

import * as React from "react";
import { useTranslations, useLocale } from "next-intl";
import {
  Plus, Search, LayoutGrid, List, Eye, PlusCircle, Clock, Pencil, Trash2,
} from "lucide-react";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import { dal } from "@/lib/dal";
import { Link, useRouter } from "@/i18n/navigation";
import type { QuizRow, QuizCategoryOption, QuizStatus } from "@/lib/dal/quizzes";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { QuizFormModal } from "./quiz-form-modal";
import { QuizCategoriesTab } from "./quiz-categories-tab";

type ViewMode = "table" | "grid";

function fmtDate(iso: string) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

export function QuizzesManager({
  initialQuizzes, initialCategories,
}: {
  initialQuizzes: QuizRow[];
  initialCategories: QuizCategoryOption[];
}) {
  const t = useTranslations("Admin");
  const locale = useLocale();
  const router = useRouter();

  const [quizzes, setQuizzes] = React.useState<QuizRow[]>(initialQuizzes);
  const [categories, setCategories] = React.useState<QuizCategoryOption[]>(initialCategories);
  const [search, setSearch] = React.useState("");
  const [categoryFilter, setCategoryFilter] = React.useState("all");
  const [statusFilter, setStatusFilter] = React.useState("all");
  const [view, setView] = React.useState<ViewMode>("table");
  const [modalOpen, setModalOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<QuizRow | null>(null);

  const titleOf = (q: QuizRow) => (locale === "ar" ? q.titleAr || q.titleEn : q.titleEn || q.titleAr);
  const descOf = (q: QuizRow) => (locale === "ar" ? q.descriptionAr || q.descriptionEn : q.descriptionEn || q.descriptionAr);

  const filtered = React.useMemo(() => {
    const term = search.trim().toLowerCase();
    return quizzes.filter((q) => {
      const matchesSearch = !term || titleOf(q).toLowerCase().includes(term) || descOf(q).toLowerCase().includes(term);
      const matchesCategory = categoryFilter === "all" || q.categoryId === categoryFilter;
      const matchesStatus = statusFilter === "all" || q.status === statusFilter;
      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [quizzes, search, categoryFilter, statusFilter, locale]); // eslint-disable-line react-hooks/exhaustive-deps

  const openCreate = () => { setEditing(null); setModalOpen(true); };
  const openEdit = (q: QuizRow) => { setEditing(q); setModalOpen(true); };

  const onSaved = (quiz: QuizRow, isNew: boolean) => {
    setQuizzes((p) => (isNew ? [quiz, ...p] : p.map((x) => (x.id === quiz.id ? { ...x, ...quiz } : x))));
    if (isNew) router.push(`/admin/quizzes/${quiz.id}`);
  };

  const changeStatus = async (q: QuizRow, status: QuizStatus) => {
    const prev = quizzes;
    setQuizzes((p) => p.map((x) => (x.id === q.id ? { ...x, status } : x)));
    const res = await dal.quizzes.updateQuiz(q.id, { status });
    if (!res.ok) { setQuizzes(prev); toast.error(res.error); }
  };

  const remove = async (q: QuizRow) => {
    if (!window.confirm(t("qzDeleteConfirm", { title: titleOf(q) }))) return;
    const prev = quizzes;
    setQuizzes((p) => p.filter((x) => x.id !== q.id));
    const res = await dal.quizzes.deleteQuiz(q.id);
    if (res.ok) toast.success(t("qzDeleted"));
    else { setQuizzes(prev); toast.error(res.error); }
  };

  const StatusPicker = ({ q }: { q: QuizRow }) => (
    <Select value={q.status} onValueChange={(v) => changeStatus(q, v as QuizStatus)}>
      <SelectTrigger
        className={cn("h-7 w-auto gap-1 rounded-full border-0 px-3 text-xs font-semibold",
          q.status === "published" ? "bg-success/15 text-success" : "bg-muted text-muted-foreground")}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="published">{t("qzPublished")}</SelectItem>
        <SelectItem value="not_published">{t("qzNotPublished")}</SelectItem>
      </SelectContent>
    </Select>
  );

  return (
    <Tabs defaultValue="quizzes" className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <TabsList>
          <TabsTrigger value="quizzes">{t("qzTabQuizzes")}</TabsTrigger>
          <TabsTrigger value="categories">{t("qzTabCategories")}</TabsTrigger>
        </TabsList>
      </div>

      <TabsContent value="quizzes" className="space-y-5">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative min-w-0 flex-1 sm:max-w-xs">
            <Search className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t("qzSearchPh")} className="ps-9" />
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-auto min-w-[150px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("qzAllCategories")}</SelectItem>
              {categories.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-auto min-w-[140px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("qzAllStatuses")}</SelectItem>
              <SelectItem value="published">{t("qzPublished")}</SelectItem>
              <SelectItem value="not_published">{t("qzNotPublished")}</SelectItem>
            </SelectContent>
          </Select>
          <div className="ms-auto flex items-center gap-2">
            <div className="flex items-center gap-1 rounded-lg border p-0.5">
              <Button variant={view === "grid" ? "secondary" : "ghost"} size="icon" className="size-8" onClick={() => setView("grid")} aria-label={t("qzGridView")}><LayoutGrid className="size-4" /></Button>
              <Button variant={view === "table" ? "secondary" : "ghost"} size="icon" className="size-8" onClick={() => setView("table")} aria-label={t("qzListView")}><List className="size-4" /></Button>
            </div>
            <Button className="gap-1.5" onClick={openCreate}><Plus className="size-4" />{t("qzAddNew")}</Button>
          </div>
        </div>

        {/* Table view */}
        {view === "table" && (
          <div className="overflow-hidden rounded-xl border bg-card">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/20 text-xs uppercase tracking-wide text-muted-foreground">
                  <th className="px-5 py-3 text-start font-semibold">{t("qzColTitle")}</th>
                  <th className="px-3 py-3 text-start font-semibold">{t("qzColCategory")}</th>
                  <th className="px-3 py-3 text-start font-semibold">{t("qzColQuestions")}</th>
                  <th className="px-3 py-3 text-start font-semibold">{t("qzColDuration")}</th>
                  <th className="px-3 py-3 text-start font-semibold">{t("qzColPassing")}</th>
                  <th className="px-3 py-3 text-start font-semibold">{t("qzColCreated")}</th>
                  <th className="px-3 py-3 text-start font-semibold">{t("qzColStatus")}</th>
                  <th className="px-5 py-3 text-end font-semibold">{t("qzColActions")}</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={8} className="px-5 py-12 text-center text-muted-foreground">{t("qzEmpty")}</td></tr>
                ) : filtered.map((q) => (
                  <tr key={q.id} className="border-b last:border-0 hover:bg-muted/20">
                    <td className="px-5 py-3">
                      <button type="button" onClick={() => router.push(`/admin/quizzes/${q.id}`)} className="block text-start font-medium hover:text-primary">{titleOf(q)}</button>
                      {descOf(q) && <p className="line-clamp-1 text-xs text-muted-foreground">{descOf(q)}</p>}
                    </td>
                    <td className="px-3 py-3">{q.categoryName ? <Badge variant="secondary">{q.categoryName}</Badge> : <span className="text-muted-foreground">—</span>}</td>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-2">
                        <span className="tabular-nums font-medium">{q.questionsCount}</span>
                        <Link href={`/admin/quizzes/${q.id}`} className="inline-flex size-7 items-center justify-center rounded-md bg-primary/10 text-primary hover:bg-primary/20" title={t("qzBuildQuestions")}><PlusCircle className="size-4" /></Link>
                      </div>
                    </td>
                    <td className="px-3 py-3"><span className="inline-flex items-center gap-1.5 text-muted-foreground"><Clock className="size-4 text-warning" />{q.timeLimitMinutes ? `${q.timeLimitMinutes} ${t("qzMins")}` : "—"}</span></td>
                    <td className="px-3 py-3 font-medium">{q.passingScore}%</td>
                    <td className="px-3 py-3 text-muted-foreground">{fmtDate(q.createdAt)}</td>
                    <td className="px-3 py-3"><StatusPicker q={q} /></td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button variant="ghost" size="icon" className="size-8 text-muted-foreground hover:text-primary" onClick={() => router.push(`/admin/quizzes/${q.id}`)} title={t("qzViewQuestions")}><Eye className="size-4" /></Button>
                        <Button variant="ghost" size="icon" className="size-8 text-muted-foreground hover:text-primary" onClick={() => openEdit(q)} title={t("qzEdit")}><Pencil className="size-4" /></Button>
                        <Button variant="ghost" size="icon" className="size-8 text-muted-foreground hover:text-destructive" onClick={() => remove(q)} title={t("qzDelete")}><Trash2 className="size-4" /></Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Grid view */}
        {view === "grid" && (
          filtered.length === 0 ? (
            <div className="rounded-xl border bg-card py-12 text-center text-muted-foreground">{t("qzEmpty")}</div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filtered.map((q) => (
                <div key={q.id} className="flex flex-col rounded-xl border bg-card p-5 transition-shadow hover:shadow-md">
                  <button type="button" onClick={() => router.push(`/admin/quizzes/${q.id}`)} className="line-clamp-1 text-start font-semibold hover:text-primary">{titleOf(q)}</button>
                  <p className="mt-1 line-clamp-2 h-9 text-xs text-muted-foreground">{descOf(q) || "—"}</p>
                  <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                    <span className="font-medium text-foreground">{q.questionsCount} {t("qzColQuestions").toLowerCase()}</span>
                    <span>•</span><span>{q.timeLimitMinutes || 0} {t("qzMins")}</span>
                    <span>•</span><span>{q.passingScore}%</span>
                  </div>
                  <div className="mt-4 flex items-center justify-between gap-2">
                    <StatusPicker q={q} />
                    <div className="flex items-center gap-1.5">
                      <Button variant="ghost" size="icon" className="size-8 text-muted-foreground hover:text-primary" onClick={() => openEdit(q)}><Pencil className="size-4" /></Button>
                      <Button variant="ghost" size="icon" className="size-8 text-muted-foreground hover:text-destructive" onClick={() => remove(q)}><Trash2 className="size-4" /></Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
        )}
        <p className="text-sm text-muted-foreground">{t("qzShowing", { n: filtered.length })}</p>
      </TabsContent>

      <TabsContent value="categories">
        <QuizCategoriesTab initial={categories} onChange={setCategories} />
      </TabsContent>

      <QuizFormModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        categories={categories}
        editing={editing}
        onSaved={onSaved}
      />
    </Tabs>
  );
}
