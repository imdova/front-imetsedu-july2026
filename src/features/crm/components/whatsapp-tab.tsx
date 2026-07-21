"use client";

import * as React from "react";
import {
  MessageCircle,
  Pencil,
  Trash2,
  Plus,
  Search,
  SearchX,
  Loader2,
  Copy,
  Check,
  Phone,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";

import { dal } from "@/lib/dal";
import type { ImportantLink } from "@/lib/dal/important-links";
import { usePermission } from "@/hooks/use-permission";
import { useConfirm } from "@/hooks/use-confirm";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

/**
 * WhatsApp contacts — name + number → a shareable wa.me link.
 *
 * Reuses the existing "Important Links" store (no new backend): each contact is
 * saved as a link with category "WhatsApp", `title` = name, `url` = the wa.me
 * link, and `description` = the number as typed (for faithful reload/display).
 * The Important Links tab hides this category so the two don't overlap.
 */
const CATEGORY = "WhatsApp";

/** Keep only digits — wa.me needs the full international number with no + or spaces. */
const digits = (s: string) => (s || "").replace(/\D/g, "");
const waLink = (num: string) => `https://wa.me/${digits(num)}`;
/** Pretty display: +<number> (the raw digits, grouped loosely). */
const prettyNumber = (num: string) => {
  const d = digits(num);
  return d ? `+${d}` : "";
};
/** Recover the number from a stored contact (description first, then the url). */
const numberOf = (l: ImportantLink) =>
  digits(l.description) || (l.url.match(/wa\.me\/(\d+)/)?.[1] ?? "");

export function WhatsAppTab() {
  const canCreate = usePermission("crm.office.create");
  const canEdit = usePermission("crm.office.edit");
  const canDelete = usePermission("crm.office.delete");
  const canManage = canCreate || canEdit || canDelete;
  const { confirm, Confirmation } = useConfirm();

  const [items, setItems] = React.useState<ImportantLink[]>([]);
  const [query, setQuery] = React.useState("");
  const [loading, setLoading] = React.useState(true);
  const [copiedId, setCopiedId] = React.useState<string | null>(null);

  const [open, setOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<ImportantLink | null>(null);
  const [form, setForm] = React.useState({ name: "", number: "" });
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      const res = await dal.importantLinks.fetchImportantLinks();
      if (cancelled) return;
      if (res.ok)
        setItems(
          res.data.filter((l) => (l.category || "").toLowerCase() === "whatsapp"),
        );
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const q = query.trim().toLowerCase();
  const visible = q
    ? items.filter(
        (l) =>
          l.title.toLowerCase().includes(q) || numberOf(l).includes(digits(q)),
      )
    : items;

  const copy = async (l: ImportantLink) => {
    try {
      await navigator.clipboard.writeText(waLink(numberOf(l)));
      setCopiedId(l.id);
      toast.success("WhatsApp link copied");
      window.setTimeout(() => setCopiedId((c) => (c === l.id ? null : c)), 1500);
    } catch {
      toast.error("Couldn't copy — select the link manually");
    }
  };

  const openCreate = () => {
    setEditing(null);
    setForm({ name: "", number: "" });
    setOpen(true);
  };
  const openEdit = (l: ImportantLink) => {
    setEditing(l);
    setForm({ name: l.title, number: numberOf(l) });
    setOpen(true);
  };

  const nameOk = form.name.trim().length >= 2;
  const numOk = digits(form.number).length >= 8;

  const save = async () => {
    if (!nameOk) {
      toast.error("Name is required");
      return;
    }
    if (!numOk) {
      toast.error("Enter a valid WhatsApp number (with country code)");
      return;
    }
    setSaving(true);
    const num = digits(form.number);
    const payload = {
      title: form.name.trim(),
      url: `https://wa.me/${num}`,
      description: num, // number, for faithful reload
      category: CATEGORY,
    };
    const res = editing
      ? await dal.importantLinks.updateImportantLink(editing.id, payload)
      : await dal.importantLinks.createImportantLink(payload);
    setSaving(false);
    if (!res.ok) {
      toast.error(res.error);
      return;
    }
    setItems((p) =>
      editing
        ? p.map((x) => (x.id === res.data.id ? res.data : x))
        : [...p, res.data],
    );
    toast.success(editing ? "Contact updated" : "Contact added");
    setOpen(false);
  };

  const remove = async (l: ImportantLink) => {
    if (
      !(await confirm({
        title: "Delete contact",
        description: `Remove “${l.title}” from WhatsApp contacts?`,
        confirmText: "Delete",
        variant: "destructive",
      }))
    )
      return;
    const res = await dal.importantLinks.deleteImportantLink(l.id);
    if (res.ok) {
      setItems((p) => p.filter((x) => x.id !== l.id));
      toast.success("Deleted");
    } else toast.error(res.error);
  };

  if (loading) {
    return (
      <div className="flex min-h-[280px] items-center justify-center rounded-2xl border bg-card">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold tracking-tight">
            WhatsApp contacts{" "}
            <span className="ms-1 text-sm font-normal text-muted-foreground">
              · {items.length}
            </span>
          </h3>
          <p className="text-sm text-muted-foreground">
            Save a name and number to get a ready <code>wa.me</code> link your
            team can open or share.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:w-52 sm:flex-none">
            <Search className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search name or number…"
              className="ps-9"
            />
          </div>
          {canCreate && (
            <Button className="shrink-0 gap-1.5" onClick={openCreate}>
              <Plus className="size-4" />{" "}
              <span className="hidden sm:inline">Add contact</span>
            </Button>
          )}
        </div>
      </div>

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border/70 bg-gradient-to-b from-muted/30 to-transparent py-20 text-center">
          <span className="grid size-14 place-items-center rounded-2xl bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
            <MessageCircle className="size-7" />
          </span>
          <p className="font-medium text-foreground">No WhatsApp contacts yet</p>
          <p className="mx-auto max-w-md text-sm text-muted-foreground">
            Add a name and number and we&apos;ll build the wa.me link for you.
          </p>
          {canCreate && (
            <Button variant="outline" className="gap-1.5" onClick={openCreate}>
              <Plus className="size-4" /> Add contact
            </Button>
          )}
        </div>
      ) : visible.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border/70 py-16 text-center">
          <span className="grid size-12 place-items-center rounded-xl bg-muted text-muted-foreground">
            <SearchX className="size-6" />
          </span>
          <p className="text-sm text-muted-foreground">
            Nothing matches “{query}”.
          </p>
          <Button variant="ghost" size="sm" onClick={() => setQuery("")}>
            Clear search
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {visible.map((l) => {
            const num = numberOf(l);
            const link = waLink(num);
            return (
              <article
                key={l.id}
                className="group relative flex flex-col overflow-hidden rounded-2xl border border-border/70 bg-card shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
              >
                <span className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-emerald-500 to-emerald-400" />
                <div className="flex flex-1 flex-col p-4 pt-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="inline-flex min-w-0 items-center gap-2.5">
                      <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
                        <MessageCircle className="size-5" />
                      </span>
                      <div className="min-w-0">
                        <h4 className="truncate font-semibold text-foreground">
                          {l.title}
                        </h4>
                        <span
                          className="inline-flex items-center gap-1 text-xs text-muted-foreground"
                          dir="ltr"
                        >
                          <Phone className="size-3 shrink-0" /> {prettyNumber(num)}
                        </span>
                      </div>
                    </div>
                    {canManage && (
                      <div className="flex shrink-0 items-center opacity-0 transition-opacity group-hover:opacity-100">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-7"
                          title="Edit"
                          onClick={() => openEdit(l)}
                        >
                          <Pencil className="size-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-7"
                          title="Delete"
                          onClick={() => remove(l)}
                        >
                          <Trash2 className="size-3.5 text-destructive" />
                        </Button>
                      </div>
                    )}
                  </div>
                  <a
                    href={link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 inline-flex items-center gap-1 truncate text-xs text-primary hover:underline"
                    dir="ltr"
                    title={link}
                  >
                    <MessageCircle className="size-3 shrink-0" />
                    <span className="truncate">wa.me/{num}</span>
                  </a>
                </div>
                <div className="flex items-center gap-2 border-t p-3">
                  <Button
                    asChild
                    size="sm"
                    className="flex-1 gap-1.5 bg-emerald-600 text-white hover:bg-emerald-700"
                  >
                    <a href={link} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="size-4" /> Open chat
                    </a>
                  </Button>
                  <Button
                    variant={copiedId === l.id ? "default" : "outline"}
                    size="sm"
                    className="gap-1.5"
                    onClick={() => copy(l)}
                    title="Copy wa.me link"
                  >
                    {copiedId === l.id ? (
                      <Check className="size-4" />
                    ) : (
                      <Copy className="size-4" />
                    )}
                  </Button>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* Add / edit dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editing ? "Edit WhatsApp contact" : "New WhatsApp contact"}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="space-y-1.5">
              <Label>
                Name <span className="text-destructive">*</span>
              </Label>
              <Input
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="e.g. Admissions – Ahmed"
              />
            </div>
            <div className="space-y-1.5">
              <Label>
                WhatsApp number <span className="text-destructive">*</span>
              </Label>
              <Input
                value={form.number}
                onChange={(e) =>
                  setForm((f) => ({ ...f, number: e.target.value }))
                }
                placeholder="201115782721"
                inputMode="tel"
                dir="ltr"
              />
              <p className="text-xs text-muted-foreground">
                Full international number, country code first, no <code>+</code> or
                spaces (e.g. <code>201115782721</code>).
                {numOk && (
                  <>
                    {" "}
                    Link:{" "}
                    <code dir="ltr">wa.me/{digits(form.number)}</code>
                  </>
                )}
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button
              onClick={save}
              disabled={saving || !nameOk || !numOk}
              className="gap-1.5"
            >
              {saving && <Loader2 className="size-4 animate-spin" />}
              {editing ? "Save" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {Confirmation}
    </div>
  );
}
