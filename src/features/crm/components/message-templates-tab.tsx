"use client";

import * as React from "react";
import { Copy, Check, Pencil, Trash2, Plus, MessageSquareText, Loader2, GraduationCap, LayoutGrid, Search, SearchX } from "lucide-react";
import { toast } from "sonner";

import { dal } from "@/lib/dal";
import type { MessageTemplate } from "@/lib/dal/message-templates";
import { usePermission } from "@/hooks/use-permission";
import { useConfirm } from "@/hooks/use-confirm";
import { cn } from "@/lib/utils";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface CourseOpt { id: string; title: string }

const GENERAL = { id: "", title: "General" };

export function MessageTemplatesTab() {
  const canCreate = usePermission("crm.office.create");
  const canEdit = usePermission("crm.office.edit");
  const canDelete = usePermission("crm.office.delete");
  const canManage = canCreate || canEdit || canDelete;
  const { confirm, Confirmation } = useConfirm();

  const [courses, setCourses] = React.useState<CourseOpt[]>([]);
  const [templates, setTemplates] = React.useState<MessageTemplate[]>([]);
  const [selected, setSelected] = React.useState<string>(""); // courseId ("" = General)
  const [query, setQuery] = React.useState("");
  const [loading, setLoading] = React.useState(true);
  const [copiedId, setCopiedId] = React.useState<string | null>(null);

  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      const [cRes, tRes] = await Promise.all([
        dal.courses.fetchCourses(),
        dal.messageTemplates.fetchTemplates(),
      ]);
      if (cancelled) return;
      if (cRes.ok) setCourses(cRes.data.map((c) => ({ id: c.id, title: c.titleEn || c.titleAr || "Course" })));
      if (tRes.ok) setTemplates(tRes.data);
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, []);

  const groups = [GENERAL, ...courses];
  const countFor = (id: string) => templates.filter((t) => t.courseId === id).length;
  const q = query.trim().toLowerCase();
  const inCourse = templates.filter((t) => t.courseId === selected);
  const visible = q ? inCourse.filter((t) => t.title.toLowerCase().includes(q) || t.body.toLowerCase().includes(q)) : inCourse;

  const copy = async (t: MessageTemplate) => {
    try {
      await navigator.clipboard.writeText(t.body);
      setCopiedId(t.id);
      toast.success("Copied — paste it into WhatsApp / Messenger");
      window.setTimeout(() => setCopiedId((c) => (c === t.id ? null : c)), 1500);
    } catch {
      toast.error("Couldn't copy — select the text manually");
    }
  };

  const remove = async (t: MessageTemplate) => {
    if (!(await confirm({ title: "Delete template", description: `“${t.title}”?`, confirmText: "Delete", variant: "destructive" }))) return;
    const res = await dal.messageTemplates.deleteTemplate(t.id);
    if (res.ok) { setTemplates((p) => p.filter((x) => x.id !== t.id)); toast.success("Deleted"); }
    else toast.error(res.error);
  };

  if (loading) {
    return <div className="flex min-h-[280px] items-center justify-center rounded-2xl border bg-card"><Loader2 className="size-6 animate-spin text-muted-foreground" /></div>;
  }

  const activeTitle = groups.find((g) => g.id === selected)?.title ?? "General";

  return (
    <div className="flex flex-col gap-6 lg:flex-row">
      {/* Secondary sidebar — courses */}
      <aside className="shrink-0 lg:w-64">
        <p className="mb-2 px-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Courses</p>
        <div className="flex gap-2 overflow-x-auto pb-2 lg:flex-col lg:gap-1 lg:overflow-visible lg:pb-0">
          {groups.map((g) => {
            const active = g.id === selected;
            return (
              <button
                key={g.id || "general"}
                onClick={() => setSelected(g.id)}
                className={cn(
                  "group relative inline-flex shrink-0 items-center justify-between gap-2 rounded-xl px-3 py-2.5 text-start text-sm transition-all lg:w-full",
                  active
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                <span className="inline-flex items-center gap-2 truncate">
                  {g.id ? <GraduationCap className="size-4 shrink-0" /> : <LayoutGrid className="size-4 shrink-0" />}
                  <span className="truncate font-medium">{g.title}</span>
                </span>
                <span className={cn("rounded-full px-2 py-0.5 text-xs font-semibold tabular-nums", active ? "bg-white/20 text-primary-foreground" : "bg-muted text-muted-foreground group-hover:bg-background")}>{countFor(g.id)}</span>
              </button>
            );
          })}
        </div>
      </aside>

      {/* Templates */}
      <div className="min-w-0 flex-1 space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-lg font-semibold tracking-tight">{activeTitle} templates</h3>
            <p className="text-sm text-muted-foreground">Ready-to-send messages — copy and paste in one click.</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative flex-1 sm:w-56 sm:flex-none">
              <Search className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search messages…" className="ps-9" />
            </div>
            {canManage && (
              <Button asChild className="shrink-0 gap-1.5">
                <Link href="/admin/crm/office/messages/new"><Plus className="size-4" /> <span className="hidden sm:inline">Add template</span></Link>
              </Button>
            )}
          </div>
        </div>

        {inCourse.length === 0 ? (
          <EmptyState canManage={canManage} />
        ) : visible.length === 0 ? (
          <NoResults query={query} onClear={() => setQuery("")} />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {visible.map((t) => (
              <article key={t.id} className="group relative flex flex-col overflow-hidden rounded-2xl border border-border/70 bg-card shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md">
                <span className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary to-primary/40" />
                <div className="flex flex-1 flex-col p-4 pt-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="inline-flex min-w-0 items-center gap-2">
                      <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary"><MessageSquareText className="size-4" /></span>
                      <h4 className="truncate font-semibold text-foreground">{t.title}</h4>
                    </div>
                    {canManage && (
                      <div className="flex shrink-0 items-center opacity-0 transition-opacity group-hover:opacity-100">
                        <Button asChild variant="ghost" size="icon" className="size-7" title="Edit">
                          <Link href={`/admin/crm/office/messages/${t.id}/edit`}><Pencil className="size-3.5" /></Link>
                        </Button>
                        <Button variant="ghost" size="icon" className="size-7" title="Delete" onClick={() => remove(t)}><Trash2 className="size-3.5 text-destructive" /></Button>
                      </div>
                    )}
                  </div>
                  <p className="mt-3 line-clamp-[7] flex-1 whitespace-pre-wrap rounded-lg bg-muted/40 p-3 text-sm leading-relaxed text-muted-foreground">{t.body}</p>
                </div>
                <div className="border-t bg-card p-3">
                  <Button variant={copiedId === t.id ? "default" : "outline"} size="sm" className="w-full gap-1.5" onClick={() => copy(t)}>
                    {copiedId === t.id ? <><Check className="size-4" /> Copied to clipboard</> : <><Copy className="size-4" /> Copy message</>}
                  </Button>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      {Confirmation}
    </div>
  );
}

function EmptyState({ canManage }: { canManage: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border/70 bg-gradient-to-b from-muted/30 to-transparent py-20 text-center">
      <span className="grid size-14 place-items-center rounded-2xl bg-primary/10 text-primary"><MessageSquareText className="size-7" /></span>
      <div className="space-y-1">
        <p className="font-medium text-foreground">No templates here yet</p>
        <p className="text-sm text-muted-foreground">{canManage ? "Create your first ready-to-send message for this course." : "Nothing has been added for this course yet."}</p>
      </div>
      {canManage && (
        <Button asChild variant="outline" className="mt-1 gap-1.5">
          <Link href="/admin/crm/office/messages/new"><Plus className="size-4" /> Add template</Link>
        </Button>
      )}
    </div>
  );
}

function NoResults({ query, onClear }: { query: string; onClear: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border/70 py-16 text-center">
      <span className="grid size-12 place-items-center rounded-xl bg-muted text-muted-foreground"><SearchX className="size-6" /></span>
      <p className="text-sm text-muted-foreground">No messages match “{query}”.</p>
      <Button variant="ghost" size="sm" onClick={onClear}>Clear search</Button>
    </div>
  );
}
