"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Plus, Pencil, Trash2, Check, X, FolderOpen } from "lucide-react";
import { toast } from "sonner";

import { dal } from "@/lib/dal";
import type { QuizCategoryOption } from "@/lib/dal/quizzes";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export function QuizCategoriesTab({
  initial, onChange,
}: {
  initial: QuizCategoryOption[];
  onChange: (cats: QuizCategoryOption[]) => void;
}) {
  const t = useTranslations("Admin");
  const [rows, setRows] = React.useState<QuizCategoryOption[]>(initial);
  const [newName, setNewName] = React.useState("");
  const [adding, setAdding] = React.useState(false);
  const [editId, setEditId] = React.useState<string | null>(null);
  const [editName, setEditName] = React.useState("");

  const sync = (next: QuizCategoryOption[]) => { setRows(next); onChange(next); };

  const add = async () => {
    const name = newName.trim();
    if (!name) return;
    setAdding(true);
    const res = await dal.quizzes.createQuizCategory(name);
    setAdding(false);
    if (res.ok) { sync([res.data, ...rows]); setNewName(""); toast.success(t("qzCatAdded")); }
    else toast.error(res.error);
  };

  const saveRename = async (id: string) => {
    const name = editName.trim();
    if (!name) return;
    const prev = rows;
    sync(rows.map((r) => (r.id === id ? { ...r, name } : r)));
    setEditId(null);
    const res = await dal.quizzes.renameQuizCategory(id, name);
    if (res.ok) toast.success(t("qzCatRenamed"));
    else { sync(prev); toast.error(res.error); }
  };

  const remove = async (id: string) => {
    if (!window.confirm(t("qzCatDeleteConfirm"))) return;
    const prev = rows;
    sync(rows.filter((r) => r.id !== id));
    const res = await dal.quizzes.deleteQuizCategory(id);
    if (res.ok) toast.success(t("qzCatDeleted"));
    else { sync(prev); toast.error(res.error); }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end gap-3 rounded-xl border bg-card p-5">
        <div className="min-w-0 flex-1 space-y-1.5">
          <label className="text-sm font-medium">{t("qzCatNewLabel")}</label>
          <Input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder={t("qzCatNewPh")}
            onKeyDown={(e) => { if (e.key === "Enter") add(); }} />
        </div>
        <Button className="gap-1.5" onClick={add} disabled={adding || !newName.trim()}><Plus className="size-4" />{t("qzCatAdd")}</Button>
      </div>

      <div className="overflow-hidden rounded-xl border bg-card">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/20 text-xs uppercase tracking-wide text-muted-foreground">
              <th className="px-5 py-3 text-start font-semibold">{t("qzCatColName")}</th>
              <th className="px-3 py-3 text-start font-semibold">{t("qzCatColQuizzes")}</th>
              <th className="px-5 py-3 text-end font-semibold">{t("qzColActions")}</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr><td colSpan={3} className="px-5 py-12 text-center text-muted-foreground">
                <FolderOpen className="mx-auto mb-2 size-7 opacity-50" />{t("qzCatEmpty")}
              </td></tr>
            ) : rows.map((c) => (
              <tr key={c.id} className="border-b last:border-0 hover:bg-muted/20">
                <td className="px-5 py-3">
                  {editId === c.id ? (
                    <div className="flex items-center gap-2">
                      <Input value={editName} onChange={(e) => setEditName(e.target.value)} className="h-8 max-w-xs"
                        onKeyDown={(e) => { if (e.key === "Enter") saveRename(c.id); if (e.key === "Escape") setEditId(null); }} autoFocus />
                      <Button variant="ghost" size="icon" className="size-8 text-success" onClick={() => saveRename(c.id)}><Check className="size-4" /></Button>
                      <Button variant="ghost" size="icon" className="size-8 text-muted-foreground" onClick={() => setEditId(null)}><X className="size-4" /></Button>
                    </div>
                  ) : (
                    <span className="font-medium">{c.name}</span>
                  )}
                </td>
                <td className="px-3 py-3"><Badge variant="secondary">{c.quizCount}</Badge></td>
                <td className="px-5 py-3">
                  <div className="flex items-center justify-end gap-1.5">
                    <Button variant="ghost" size="icon" className="size-8 text-muted-foreground hover:text-primary" onClick={() => { setEditId(c.id); setEditName(c.name); }}><Pencil className="size-4" /></Button>
                    <Button variant="ghost" size="icon" className="size-8 text-muted-foreground hover:text-destructive" onClick={() => remove(c.id)}><Trash2 className="size-4" /></Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
