"use client";

import * as React from "react";
import {
  Plus, Pencil, Trash2, Loader2, ExternalLink, Copy, Check, Table2, Search, SearchX,
  ClipboardList, ShieldCheck, ShieldPlus, Stethoscope, HeartPulse, Briefcase,
  TrendingUp, Users, GraduationCap, Award, Building2, Globe, FileSpreadsheet,
  Calendar, DollarSign, type LucideIcon,
} from "lucide-react";
import { toast } from "sonner";

import { dal } from "@/lib/dal";
import type { RegColumn, RegCard } from "@/lib/dal/registration-sheets";
import { useAuth } from "@/store";
import { useConfirm } from "@/hooks/use-confirm";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const ICONS: Record<string, LucideIcon> = {
  ClipboardList, ShieldCheck, ShieldPlus, Stethoscope, HeartPulse, Briefcase,
  TrendingUp, Users, GraduationCap, Award, Building2, Globe, FileSpreadsheet,
  Calendar, DollarSign,
};
const ICON_KEYS = Object.keys(ICONS);
const iconFor = (key: string): LucideIcon => ICONS[key] ?? ClipboardList;

/** Distinct background + icon tint per column (cycles if there are more columns). */
const PALETTE = [
  { container: "border-blue-200 bg-blue-50/70 dark:border-blue-900/50 dark:bg-blue-950/30", chip: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300" },
  { container: "border-emerald-200 bg-emerald-50/70 dark:border-emerald-900/50 dark:bg-emerald-950/30", chip: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300" },
  { container: "border-amber-200 bg-amber-50/80 dark:border-amber-900/50 dark:bg-amber-950/30", chip: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300" },
  { container: "border-violet-200 bg-violet-50/70 dark:border-violet-900/50 dark:bg-violet-950/30", chip: "bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300" },
  { container: "border-rose-200 bg-rose-50/70 dark:border-rose-900/50 dark:bg-rose-950/30", chip: "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300" },
  { container: "border-cyan-200 bg-cyan-50/70 dark:border-cyan-900/50 dark:bg-cyan-950/30", chip: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-300" },
];

export function RegistrationSheetsTab() {
  const { user } = useAuth();
  const canManage = !user?.staffRole; // super-admin only
  const { confirm, Confirmation } = useConfirm();

  const [columns, setColumns] = React.useState<RegColumn[]>([]);
  const [cards, setCards] = React.useState<RegCard[]>([]);
  const [query, setQuery] = React.useState("");
  const [loading, setLoading] = React.useState(true);
  const [copiedId, setCopiedId] = React.useState<string | null>(null);

  // column dialog
  const [colOpen, setColOpen] = React.useState(false);
  const [editingCol, setEditingCol] = React.useState<RegColumn | null>(null);
  const [colForm, setColForm] = React.useState({ title: "", icon: "ClipboardList" });
  // card dialog
  const [cardOpen, setCardOpen] = React.useState(false);
  const [editingCard, setEditingCard] = React.useState<RegCard | null>(null);
  const [cardColumnId, setCardColumnId] = React.useState("");
  const [cardForm, setCardForm] = React.useState({ title: "", link: "" });
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      const res = await dal.registrationSheets.fetchBoard();
      if (cancelled) return;
      if (res.ok) { setColumns(res.data.columns); setCards(res.data.cards); }
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, []);

  const q = query.trim().toLowerCase();
  const cardsIn = (colId: string) => cards.filter((c) => c.columnId === colId && (!q || c.title.toLowerCase().includes(q)));
  const totalMatches = q ? cards.filter((c) => c.title.toLowerCase().includes(q)).length : cards.length;

  // ── columns ──────────────────────────────
  const openCreateCol = () => { setEditingCol(null); setColForm({ title: "", icon: "ClipboardList" }); setColOpen(true); };
  const openEditCol = (c: RegColumn) => { setEditingCol(c); setColForm({ title: c.title, icon: c.icon }); setColOpen(true); };
  const saveCol = async () => {
    if (!colForm.title.trim()) { toast.error("Column title is required"); return; }
    setSaving(true);
    const payload = { ...colForm, order: editingCol ? editingCol.order : columns.length };
    const res = editingCol
      ? await dal.registrationSheets.updateColumn(editingCol.id, payload)
      : await dal.registrationSheets.createColumn(payload);
    setSaving(false);
    if (!res.ok) { toast.error(res.error); return; }
    setColumns((p) => (editingCol ? p.map((x) => (x.id === res.data.id ? res.data : x)) : [...p, res.data]));
    toast.success(editingCol ? "Column updated" : "Column added");
    setColOpen(false);
  };
  const removeCol = async (c: RegColumn) => {
    if (!(await confirm({ title: "Delete column", description: `Delete “${c.title}” and all its cards?`, confirmText: "Delete", variant: "destructive" }))) return;
    const res = await dal.registrationSheets.deleteColumn(c.id);
    if (res.ok) { setColumns((p) => p.filter((x) => x.id !== c.id)); setCards((p) => p.filter((x) => x.columnId !== c.id)); toast.success("Deleted"); }
    else toast.error(res.error);
  };

  // ── cards ────────────────────────────────
  const openCreateCard = (colId: string) => { setEditingCard(null); setCardColumnId(colId); setCardForm({ title: "", link: "" }); setCardOpen(true); };
  const openEditCard = (c: RegCard) => { setEditingCard(c); setCardColumnId(c.columnId); setCardForm({ title: c.title, link: c.link }); setCardOpen(true); };
  const saveCard = async () => {
    if (!cardForm.title.trim()) { toast.error("Card title is required"); return; }
    setSaving(true);
    const res = editingCard
      ? await dal.registrationSheets.updateCard(editingCard.id, cardForm)
      : await dal.registrationSheets.createCard({ columnId: cardColumnId, ...cardForm, order: cardsIn(cardColumnId).length });
    setSaving(false);
    if (!res.ok) { toast.error(res.error); return; }
    setCards((p) => (editingCard ? p.map((x) => (x.id === res.data.id ? res.data : x)) : [...p, res.data]));
    toast.success(editingCard ? "Card updated" : "Card added");
    setCardOpen(false);
  };
  const removeCard = async (c: RegCard) => {
    if (!(await confirm({ title: "Delete card", description: `“${c.title}”?`, confirmText: "Delete", variant: "destructive" }))) return;
    const res = await dal.registrationSheets.deleteCard(c.id);
    if (res.ok) { setCards((p) => p.filter((x) => x.id !== c.id)); toast.success("Deleted"); }
    else toast.error(res.error);
  };
  const copyLink = async (c: RegCard) => {
    try {
      await navigator.clipboard.writeText(c.link);
      setCopiedId(c.id);
      toast.success("Link copied");
      window.setTimeout(() => setCopiedId((x) => (x === c.id ? null : x)), 1500);
    } catch { toast.error("Couldn't copy the link"); }
  };

  if (loading) {
    return <div className="flex min-h-[240px] items-center justify-center rounded-2xl border bg-card"><Loader2 className="size-6 animate-spin text-muted-foreground" /></div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold tracking-tight">Registration sheets <span className="ms-1 text-sm font-normal text-muted-foreground">· {cards.length} sheets</span></h3>
          <p className="text-sm text-muted-foreground">Google Sheets links grouped by category — one click to open or copy.</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:w-52 sm:flex-none">
            <Search className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search sheets…" className="ps-9" />
          </div>
          {canManage && <Button variant="outline" className="shrink-0 gap-1.5" onClick={openCreateCol}><Plus className="size-4" /> <span className="hidden sm:inline">Add column</span></Button>}
        </div>
      </div>

      {q && totalMatches === 0 && (
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border/70 py-14 text-center">
          <span className="grid size-12 place-items-center rounded-xl bg-muted text-muted-foreground"><SearchX className="size-6" /></span>
          <p className="text-sm text-muted-foreground">No sheet matches “{query}”.</p>
          <Button variant="ghost" size="sm" onClick={() => setQuery("")}>Clear search</Button>
        </div>
      )}

      {columns.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border/70 bg-card py-16 text-center">
          <span className="grid size-12 place-items-center rounded-xl bg-primary/10 text-primary"><ClipboardList className="size-6" /></span>
          <p className="text-sm text-muted-foreground">No columns yet.{canManage ? " Add the first one." : ""}</p>
          {canManage && <Button variant="outline" className="gap-1.5" onClick={openCreateCol}><Plus className="size-4" /> Add column</Button>}
        </div>
      ) : q && totalMatches === 0 ? null : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {columns.map((col, idx) => ({ col, idx, pal: PALETTE[idx % PALETTE.length] }))
            .filter(({ col }) => !q || cardsIn(col.id).length > 0)
            .map(({ col, idx, pal }) => {
            const Icon = iconFor(col.icon);
            const list = cardsIn(col.id);
            return (
              <div key={col.id} className={cn("flex flex-col rounded-2xl border p-3", pal.container)}>
                <div className="mb-3 flex items-start justify-between gap-2">
                  <div className="inline-flex min-w-0 items-center gap-2">
                    <span className={cn("grid size-9 shrink-0 place-items-center rounded-xl", pal.chip)}><Icon className="size-5" /></span>
                    <div className="min-w-0">
                      <p className="truncate font-semibold leading-tight text-foreground">{col.title}</p>
                      <p className="text-xs text-muted-foreground">{list.length} sheet{list.length === 1 ? "" : "s"}</p>
                    </div>
                  </div>
                  {canManage && (
                    <div className="flex shrink-0 items-center">
                      <Button variant="ghost" size="icon" className="size-7" title="Edit column" onClick={() => openEditCol(col)}><Pencil className="size-3.5" /></Button>
                      <Button variant="ghost" size="icon" className="size-7" title="Delete column" onClick={() => removeCol(col)}><Trash2 className="size-3.5 text-destructive" /></Button>
                    </div>
                  )}
                </div>

                <div className="flex-1 space-y-2">
                  {list.length === 0 && <p className="rounded-lg border border-dashed border-border/60 px-3 py-4 text-center text-xs text-muted-foreground">No sheets yet</p>}
                  {list.map((c) => (
                    <div key={c.id} className="group rounded-xl border border-border/70 bg-card p-3 shadow-sm">
                      <div className="flex items-start justify-between gap-2">
                        <div className="inline-flex min-w-0 items-center gap-1.5">
                          <Table2 className="size-4 shrink-0 text-emerald-600" />
                          <p className="truncate text-sm font-medium text-foreground">{c.title}</p>
                        </div>
                        {canManage && (
                          <div className="flex shrink-0 items-center opacity-60 transition-opacity group-hover:opacity-100">
                            <Button variant="ghost" size="icon" className="size-6" title="Edit" onClick={() => openEditCard(c)}><Pencil className="size-3" /></Button>
                            <Button variant="ghost" size="icon" className="size-6" title="Delete" onClick={() => removeCard(c)}><Trash2 className="size-3 text-destructive" /></Button>
                          </div>
                        )}
                      </div>
                      {c.link ? (
                        <div className="mt-2 flex items-center gap-1.5">
                          <Button asChild size="sm" variant="outline" className="h-7 flex-1 gap-1.5 text-xs">
                            <a href={c.link} target="_blank" rel="noreferrer"><ExternalLink className="size-3.5" /> Open sheet</a>
                          </Button>
                          <Button size="sm" variant="ghost" className="h-7 gap-1 px-2 text-xs" title="Copy link" onClick={() => copyLink(c)}>
                            {copiedId === c.id ? <Check className="size-3.5 text-success" /> : <Copy className="size-3.5" />}
                          </Button>
                        </div>
                      ) : (
                        <p className="mt-2 text-xs text-muted-foreground">No link added</p>
                      )}
                    </div>
                  ))}
                </div>

                {canManage && (
                  <Button variant="ghost" size="sm" className="mt-2 w-full justify-center gap-1.5 border border-dashed border-border/60 text-muted-foreground hover:text-foreground" onClick={() => openCreateCard(col.id)}>
                    <Plus className="size-4" /> Add card
                  </Button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Column dialog */}
      <Dialog open={colOpen} onOpenChange={setColOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>{editingCol ? "Edit column" : "New column"}</DialogTitle></DialogHeader>
          <div className="grid gap-4">
            <div className="space-y-1.5">
              <Label>Title <span className="text-destructive">*</span></Label>
              <Input value={colForm.title} onChange={(e) => setColForm((f) => ({ ...f, title: e.target.value }))} placeholder="e.g. Healthcare Quality" />
            </div>
            <div className="space-y-1.5">
              <Label>Icon</Label>
              <div className="grid grid-cols-8 gap-1.5 rounded-lg border border-border/60 p-2">
                {ICON_KEYS.map((key) => {
                  const I = ICONS[key];
                  const active = colForm.icon === key;
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setColForm((f) => ({ ...f, icon: key }))}
                      className={cn("grid aspect-square place-items-center rounded-md transition-colors", active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted")}
                      title={key}
                    >
                      <I className="size-4" />
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setColOpen(false)} disabled={saving}>Cancel</Button>
            <Button onClick={saveCol} disabled={saving || !colForm.title.trim()} className="gap-1.5">
              {saving && <Loader2 className="size-4 animate-spin" />}{editingCol ? "Save" : "Add"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Card dialog */}
      <Dialog open={cardOpen} onOpenChange={setCardOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>{editingCard ? "Edit card" : "New card"}</DialogTitle></DialogHeader>
          <div className="grid gap-4">
            <div className="space-y-1.5">
              <Label>Title <span className="text-destructive">*</span></Label>
              <Input value={cardForm.title} onChange={(e) => setCardForm((f) => ({ ...f, title: e.target.value }))} placeholder="e.g. CPHQ – July 2026 cohort" />
            </div>
            <div className="space-y-1.5">
              <Label>Google Sheet link</Label>
              <Input value={cardForm.link} onChange={(e) => setCardForm((f) => ({ ...f, link: e.target.value }))} placeholder="https://docs.google.com/spreadsheets/…" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCardOpen(false)} disabled={saving}>Cancel</Button>
            <Button onClick={saveCard} disabled={saving || !cardForm.title.trim()} className="gap-1.5">
              {saving && <Loader2 className="size-4 animate-spin" />}{editingCard ? "Save" : "Add"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {Confirmation}
    </div>
  );
}
