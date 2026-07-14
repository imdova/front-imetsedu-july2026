"use client";

import * as React from "react";
import Image from "next/image";
import {
  Link2, Copy, Check, ExternalLink, Trash2, Plus, Loader2, Search, SearchX,
  BadgeCheck, Repeat, Receipt, GraduationCap, Wallet, GripVertical,
} from "lucide-react";
import { toast } from "sonner";
import {
  DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { SortableContext, arrayMove, rectSortingStrategy, sortableKeyboardCoordinates } from "@dnd-kit/sortable";

import { dal } from "@/lib/dal";
import type { PaymentLink, PaymentType } from "@/lib/dal/payment-links";
import type { CourseRow } from "@/types";
import { useConfirm } from "@/hooks/use-confirm";
import { usePermission } from "@/hooks/use-permission";
import { cn, formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { SearchableSelect } from "@/components/shared/searchable-select";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SortableItem, type DragHandleProps } from "@/components/shared/sortable/sortable-item";

const EGP_PER_USD = Number(process.env.NEXT_PUBLIC_EGP_PER_USD) || 50;
const COLUMN_ORDER_KEY = "imets:payment-links:column-order";

const PAYMENT_TYPES: { value: PaymentType; label: string }[] = [
  { value: "cash", label: "Cash / Full payment" },
  { value: "installment_1", label: "1st installment" },
  { value: "installment_2", label: "2nd installment" },
  { value: "installment_3", label: "3rd installment" },
];
const typeLabel = (t: PaymentType) => PAYMENT_TYPES.find((p) => p.value === t)?.label ?? t;
const TYPE_ORDER: Record<string, number> = { cash: 0, installment_1: 1, installment_2: 2, installment_3: 3 };

/** Group key for a course column — courseId when present, else the title. */
const courseKey = (l: PaymentLink) => l.courseId || `t:${l.courseTitle}`;

interface CourseColumnData {
  key: string;
  title: string;
  image: string;
  links: PaymentLink[];
}

/** Suggested USD price for a course (USD pricing, else EGP→USD fallback). */
function suggestUsd(c: CourseRow): number {
  const usd = c.salePriceUSD && c.salePriceUSD > 0 ? c.salePriceUSD : c.priceUSD ?? 0;
  if (usd > 0) return usd;
  const egp = c.salePriceEGP > 0 ? c.salePriceEGP : c.priceEGP;
  return Math.round((egp / EGP_PER_USD) * 100) / 100;
}

const num = (s: string) => {
  const n = Number(s);
  return Number.isFinite(n) && n > 0 ? n : 0;
};

const EMPTY = { courseId: "", paymentType: "cash" as PaymentType, amount: "", discount: "", tax: "" };

export function PaymentLinksManager() {
  const canCreate = usePermission("crm.payment_links.create");
  const canDelete = usePermission("crm.payment_links.delete");
  const { confirm, Confirmation } = useConfirm();

  const [links, setLinks] = React.useState<PaymentLink[]>([]);
  const [courses, setCourses] = React.useState<CourseRow[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [query, setQuery] = React.useState("");
  const [copied, setCopied] = React.useState<string | null>(null);

  const [form, setForm] = React.useState(EMPTY);
  const [saving, setSaving] = React.useState(false);

  // Column (per-course) ordering — persisted per browser.
  const [columnOrder, setColumnOrder] = React.useState<string[]>([]);
  const [mounted, setMounted] = React.useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  // Mount flag (dnd hydration) + restore saved column order — one-time init.
  React.useEffect(() => {
    let cancelled = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
    try {
      const saved = JSON.parse(window.localStorage.getItem(COLUMN_ORDER_KEY) || "[]");
      if (Array.isArray(saved)) setColumnOrder(saved.filter((x): x is string => typeof x === "string"));
    } catch { /* ignore */ }
    (async () => {
      const [linksRes, coursesRes] = await Promise.all([
        dal.paymentLinks.fetchPaymentLinks(),
        dal.courses.fetchCourses({}),
      ]);
      if (cancelled) return;
      if (linksRes.ok) setLinks(linksRes.data);
      if (coursesRes.ok) setCourses(coursesRes.data);
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, []);

  const courseOptions = React.useMemo(
    () => courses.map((c) => ({ value: c.id, label: c.titleEn || c.titleAr || "Course" })),
    [courses],
  );
  const selectedCourse = courses.find((c) => c.id === form.courseId);

  const amount = num(form.amount);
  const discount = num(form.discount);
  const tax = num(form.tax);
  const subtotal = Math.max(0, amount - discount);
  const total = Math.max(0, subtotal + tax);

  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const linkUrl = (token: string) => `${origin}/pay/${token}`;

  const onSelectCourse = (id: string) => {
    const c = courses.find((x) => x.id === id);
    setForm((f) => ({ ...f, courseId: id, amount: c ? String(suggestUsd(c)) : f.amount }));
  };

  const copy = async (token: string) => {
    try {
      await navigator.clipboard.writeText(linkUrl(token));
      setCopied(token);
      toast.success("Link copied");
      window.setTimeout(() => setCopied((c) => (c === token ? null : c)), 1500);
    } catch {
      toast.error("Couldn't copy — select the link manually");
    }
  };

  const create = async () => {
    if (!selectedCourse) { toast.error("Select a course"); return; }
    if (total <= 0) { toast.error("Enter an amount greater than zero"); return; }
    setSaving(true);
    const res = await dal.paymentLinks.createPaymentLink({
      courseId: selectedCourse.id,
      courseTitle: selectedCourse.titleEn || selectedCourse.titleAr || "Course",
      courseImage: selectedCourse.thumbnailUrl || "",
      paymentType: form.paymentType,
      amount,
      discount,
      tax,
      currency: "USD",
    });
    setSaving(false);
    if (!res.ok) { toast.error(res.error); return; }
    setLinks((p) => [res.data, ...p]);
    setForm(EMPTY);
    toast.success("Payment link created");
    void copy(res.data.token);
  };

  const remove = async (l: PaymentLink) => {
    if (!(await confirm({ title: "Delete payment link", description: `“${l.courseTitle}” · ${typeLabel(l.paymentType)}?`, confirmText: "Delete", variant: "destructive" }))) return;
    const res = await dal.paymentLinks.deletePaymentLink(l.id);
    if (res.ok) { setLinks((p) => p.filter((x) => x.id !== l.id)); toast.success("Deleted"); }
    else toast.error(res.error);
  };

  const q = query.trim().toLowerCase();
  const visible = q ? links.filter((l) => l.courseTitle.toLowerCase().includes(q) || typeLabel(l.paymentType).toLowerCase().includes(q)) : links;

  // Group the visible links into one column per course, ordered by columnOrder
  // (saved) with any new courses appended in first-seen order.
  const columns = React.useMemo<CourseColumnData[]>(() => {
    const groups = new Map<string, CourseColumnData>();
    for (const l of visible) {
      const key = courseKey(l);
      const g = groups.get(key);
      if (g) {
        g.links.push(l);
        if (!g.image && l.courseImage) g.image = l.courseImage;
      } else {
        groups.set(key, { key, title: l.courseTitle, image: l.courseImage, links: [l] });
      }
    }
    for (const g of groups.values()) {
      g.links.sort((a, b) => (TYPE_ORDER[a.paymentType] ?? 9) - (TYPE_ORDER[b.paymentType] ?? 9));
    }
    const known = columnOrder.filter((k) => groups.has(k));
    const fresh = [...groups.keys()].filter((k) => !columnOrder.includes(k));
    return [...known, ...fresh].map((k) => groups.get(k)!);
  }, [visible, columnOrder]);

  const persistOrder = (order: string[]) => {
    setColumnOrder(order);
    try { window.localStorage.setItem(COLUMN_ORDER_KEY, JSON.stringify(order)); } catch { /* ignore */ }
  };

  const onDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    // Reorder against the full known-key list so search-filtered views still persist correctly.
    const allKeys = columns.map((c) => c.key);
    const base = [...new Set([...columnOrder.filter((k) => allKeys.includes(k)), ...allKeys])];
    const oldI = base.indexOf(String(active.id));
    const newI = base.indexOf(String(over.id));
    if (oldI === -1 || newI === -1) return;
    persistOrder(arrayMove(base, oldI, newI));
  };

  if (loading) {
    return <div className="flex min-h-[320px] items-center justify-center rounded-2xl border bg-card"><Loader2 className="size-6 animate-spin text-muted-foreground" /></div>;
  }

  return (
    <div className="space-y-8">
      {/* Create */}
      {canCreate && (
        <section className="grid items-start gap-6 lg:grid-cols-[1fr_340px]">
          <div className="rounded-2xl border border-border/70 bg-card p-5 shadow-sm">
            <h2 className="mb-4 flex items-center gap-2 text-base font-semibold">
              <Plus className="size-4 text-primary" /> Create a payment link
            </h2>
            <div className="grid gap-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label>Course <span className="text-destructive">*</span></Label>
                  <SearchableSelect value={form.courseId} onChange={onSelectCourse} options={courseOptions} placeholder="Select course…" />
                </div>
                <div className="space-y-1.5">
                  <Label>Payment type</Label>
                  <Select value={form.paymentType} onValueChange={(v) => setForm((f) => ({ ...f, paymentType: v as PaymentType }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {PAYMENT_TYPES.map((p) => <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-1.5">
                  <Label>Amount (USD)</Label>
                  <Input type="number" min={0} step="0.01" value={form.amount} onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))} placeholder="0.00" />
                </div>
                <div className="space-y-1.5">
                  <Label>Discount (USD)</Label>
                  <Input type="number" min={0} step="0.01" value={form.discount} onChange={(e) => setForm((f) => ({ ...f, discount: e.target.value }))} placeholder="0.00" />
                </div>
                <div className="space-y-1.5">
                  <Label>Taxes (USD)</Label>
                  <Input type="number" min={0} step="0.01" value={form.tax} onChange={(e) => setForm((f) => ({ ...f, tax: e.target.value }))} placeholder="0.00" />
                </div>
              </div>
              <Button onClick={create} disabled={saving || !selectedCourse || total <= 0} className="w-fit gap-1.5">
                {saving ? <Loader2 className="size-4 animate-spin" /> : <Link2 className="size-4" />} Generate link
              </Button>
            </div>
          </div>

          {/* Live summary */}
          <aside className="rounded-2xl border border-border/70 bg-card p-5 shadow-sm">
            <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold">
              <Receipt className="size-4 text-primary" /> Summary
            </h3>
            <div className="flex items-center gap-2 border-b border-border/60 pb-3">
              {selectedCourse?.thumbnailUrl ? (
                <span className="relative size-10 shrink-0 overflow-hidden rounded-lg bg-muted">
                  <Image src={selectedCourse.thumbnailUrl} alt="" fill sizes="40px" className="object-cover" />
                </span>
              ) : (
                <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary"><GraduationCap className="size-5" /></span>
              )}
              <p className="min-w-0 truncate text-sm font-medium">{selectedCourse ? (selectedCourse.titleEn || selectedCourse.titleAr) : "No course selected"}</p>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">{typeLabel(form.paymentType)}</p>
            <dl className="mt-3 space-y-2 text-sm">
              <div className="flex justify-between"><dt className="text-muted-foreground">Amount</dt><dd className="tabular-nums">{formatCurrency(amount, "USD")}</dd></div>
              {discount > 0 && <div className="flex justify-between text-success"><dt>Discount</dt><dd className="tabular-nums">−{formatCurrency(discount, "USD")}</dd></div>}
              <div className="flex justify-between"><dt className="text-muted-foreground">Subtotal</dt><dd className="tabular-nums">{formatCurrency(subtotal, "USD")}</dd></div>
              <div className="flex justify-between"><dt className="text-muted-foreground">Taxes</dt><dd className="tabular-nums">{formatCurrency(tax, "USD")}</dd></div>
            </dl>
            <Separator className="my-3" />
            <div className="flex items-baseline justify-between">
              <span className="font-semibold">Total due</span>
              <span className="font-heading text-xl font-bold tabular-nums text-primary">{formatCurrency(total, "USD")}</span>
            </div>
            <p className="mt-3 text-[11px] text-muted-foreground">A PayPal link will be generated for this total. Share it with the customer to collect payment.</p>
          </aside>
        </section>
      )}

      {/* List */}
      <section className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-base font-semibold">Payment links <span className="ms-1 text-sm font-normal text-muted-foreground">· {links.length}</span></h2>
            {columns.length > 1 && <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground"><GripVertical className="size-3.5" /> Drag a column header to reorder programs</p>}
          </div>
          <div className="relative sm:w-64">
            <Search className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search…" className="ps-9" />
          </div>
        </div>

        {links.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border/70 bg-gradient-to-b from-muted/30 to-transparent py-16 text-center">
            <span className="grid size-14 place-items-center rounded-2xl bg-primary/10 text-primary"><Wallet className="size-7" /></span>
            <p className="font-medium text-foreground">No payment links yet</p>
            {canCreate && <p className="text-sm text-muted-foreground">Create one above — pick a course, set the amount and generate the PayPal link.</p>}
          </div>
        ) : visible.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border/70 py-12 text-center">
            <SearchX className="size-6 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Nothing matches “{query}”.</p>
          </div>
        ) : mounted ? (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
            <SortableContext items={columns.map((c) => c.key)} strategy={rectSortingStrategy}>
              <div className="grid grid-cols-1 items-start gap-4 md:grid-cols-2 lg:grid-cols-3">
                {columns.map((col) => (
                  <SortableItem key={col.key} id={col.key}>
                    {(handle) => (
                      <CourseColumn col={col} handle={handle} canDelete={canDelete} copied={copied} linkUrl={linkUrl} onCopy={copy} onRemove={remove} />
                    )}
                  </SortableItem>
                ))}
              </div>
            </SortableContext>
          </DndContext>
        ) : (
          <div className="grid grid-cols-1 items-start gap-4 md:grid-cols-2 lg:grid-cols-3">
            {columns.map((col) => (
              <CourseColumn key={col.key} col={col} canDelete={canDelete} copied={copied} linkUrl={linkUrl} onCopy={copy} onRemove={remove} />
            ))}
          </div>
        )}
      </section>
      {Confirmation}
    </div>
  );
}

interface ColumnCallbacks {
  canDelete: boolean;
  copied: string | null;
  linkUrl: (token: string) => string;
  onCopy: (token: string) => void;
  onRemove: (l: PaymentLink) => void;
}

/** One program column: course header (drag handle) + its payment-type cards. */
function CourseColumn({ col, handle, ...cb }: { col: CourseColumnData; handle?: DragHandleProps } & ColumnCallbacks) {
  return (
    <div className={cn("rounded-2xl border border-border/70 bg-muted/30 p-3", handle?.isDragging && "shadow-lg ring-2 ring-primary/40")}>
      <div className="mb-3 flex items-center gap-2 px-1">
        {col.image ? (
          <span className="relative size-9 shrink-0 overflow-hidden rounded-lg bg-muted">
            <Image src={col.image} alt="" fill sizes="36px" className="object-cover" />
          </span>
        ) : (
          <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary"><GraduationCap className="size-4" /></span>
        )}
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold leading-tight">{col.title}</p>
          <p className="flex items-center gap-1 text-[11px] text-muted-foreground">
            <Repeat className="size-3" /> {col.links.length} {col.links.length === 1 ? "link" : "links"} · reusable
          </p>
        </div>
        <button
          type="button"
          title="Drag to reorder"
          className={cn(
            "grid size-7 shrink-0 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-muted",
            handle ? "cursor-grab touch-none active:cursor-grabbing" : "cursor-default opacity-30",
          )}
          {...(handle?.attributes ?? {})}
          {...(handle?.listeners ?? {})}
        >
          <GripVertical className="size-4" />
        </button>
      </div>
      <div className="space-y-3">
        {col.links.map((l) => <LinkCard key={l.id} l={l} {...cb} />)}
      </div>
    </div>
  );
}

/** A single payment-type card inside a course column. */
function LinkCard({ l, canDelete, copied, linkUrl, onCopy, onRemove }: { l: PaymentLink } & ColumnCallbacks) {
  const collected = l.payments.reduce((s, p) => s + (p.amount || 0), 0);
  return (
    <article className="group relative overflow-hidden rounded-xl border border-border/70 bg-card shadow-sm transition-shadow hover:shadow-md">
      <div className="p-3.5">
        <div className="flex items-start justify-between gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
            <Wallet className="size-3.5" /> {typeLabel(l.paymentType)}
          </span>
          {canDelete && (
            <Button variant="ghost" size="icon" className="size-6 opacity-0 transition-opacity group-hover:opacity-100" title="Delete" onClick={() => onRemove(l)}>
              <Trash2 className="size-3.5 text-destructive" />
            </Button>
          )}
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="font-heading text-lg font-bold tabular-nums text-primary">{formatCurrency(l.total, l.currency)}</span>
          {l.discount > 0 && <span className="text-xs text-muted-foreground line-through tabular-nums">{formatCurrency(l.amount, l.currency)}</span>}
        </div>
        {l.payments.length > 0 ? (
          <p className="mt-1 flex items-center gap-1 text-[11px] text-success">
            <BadgeCheck className="size-3.5" />
            {l.payments.length} payment{l.payments.length > 1 ? "s" : ""} · {formatCurrency(collected, l.currency)} collected
          </p>
        ) : (
          <p className="mt-1 text-[11px] text-muted-foreground">No payments yet</p>
        )}
      </div>
      <div className="flex items-center gap-2 border-t p-2.5">
        <Button size="sm" variant={copied === l.token ? "default" : "outline"} className="flex-1 gap-1.5" onClick={() => onCopy(l.token)}>
          {copied === l.token ? <><Check className="size-4" /> Copied</> : <><Copy className="size-4" /> Copy link</>}
        </Button>
        <Button asChild size="sm" variant="ghost" className="gap-1.5" title="Open">
          <a href={linkUrl(l.token)} target="_blank" rel="noopener noreferrer"><ExternalLink className="size-4" /></a>
        </Button>
      </div>
    </article>
  );
}
