"use client";

import * as React from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { dal } from "@/lib/dal";
import type {
  BlogCategory, BlogCategoryInput, BlogSubcategory, BlogSubcategoryInput, BlogCategoryColor,
} from "@/types/blog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DataTable } from "@/components/shared/data-table/data-table";
import { ImageUpload } from "@/components/shared/image-upload";
import { useConfirm } from "@/hooks/use-confirm";
import { cn } from "@/lib/utils";

const COLORS: BlogCategoryColor[] = ["primary", "info", "success", "warning", "destructive", "neutral"];
const SWATCH: Record<BlogCategoryColor, string> = {
  primary: "bg-primary", info: "bg-info", success: "bg-success",
  warning: "bg-warning", destructive: "bg-destructive", neutral: "bg-muted-foreground",
};

type Confirm = ReturnType<typeof useConfirm>["confirm"];

export function BlogTaxonomyManager({
  initialCategories, initialSubcategories,
}: {
  initialCategories: BlogCategory[];
  initialSubcategories: BlogSubcategory[];
}) {
  const { confirm, Confirmation } = useConfirm();
  const [categories, setCategories] = React.useState(initialCategories);

  return (
    <div className="space-y-4">
      <Tabs defaultValue="categories" className="space-y-4">
        <TabsList>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="subcategories">Subcategories</TabsTrigger>
        </TabsList>
        <TabsContent value="categories">
          <CategoriesTab rows={categories} setRows={setCategories} confirm={confirm} />
        </TabsContent>
        <TabsContent value="subcategories">
          <SubcategoriesTab initial={initialSubcategories} categories={categories} confirm={confirm} />
        </TabsContent>
      </Tabs>
      {Confirmation}
    </div>
  );
}

/* ── Categories ── */
const emptyCat: BlogCategoryInput = { name: "", slug: "", description: "", color: "primary", image: "", rank: 0, status: "active", seoTitle: "", seoDescription: "" };

function CategoriesTab({ rows, setRows, confirm }: { rows: BlogCategory[]; setRows: React.Dispatch<React.SetStateAction<BlogCategory[]>>; confirm: Confirm }) {
  const [open, setOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<BlogCategory | null>(null);
  const [form, setForm] = React.useState<BlogCategoryInput>(emptyCat);
  const set = <K extends keyof BlogCategoryInput>(k: K, v: BlogCategoryInput[K]) => setForm((f) => ({ ...f, [k]: v }));

  const openCreate = () => { setEditing(null); setForm(emptyCat); setOpen(true); };
  const openEdit = (c: BlogCategory) => { setEditing(c); const { id: _i, articleCount: _a, ...rest } = c; setForm(rest); setOpen(true); };
  const save = async () => {
    if (!form.name?.trim()) return;
    const res = editing ? await dal.blog.updateCategory(editing.id, form) : await dal.blog.createCategory(form);
    if (res.ok) { setRows((p) => editing ? p.map((x) => x.id === res.data.id ? res.data : x) : [...p, res.data]); toast.success(editing ? "Updated" : "Created"); setOpen(false); }
    else toast.error(res.error);
  };
  const remove = async (c: BlogCategory) => {
    if (!(await confirm({ title: "Delete category", description: `“${c.name}”?`, confirmText: "Delete", variant: "destructive" }))) return;
    const res = await dal.blog.deleteCategory(c.id);
    if (res.ok) { setRows((p) => p.filter((x) => x.id !== c.id)); toast.success("Deleted"); } else toast.error(res.error);
  };

  const columns: ColumnDef<BlogCategory>[] = [
    { accessorKey: "name", header: "Name", cell: ({ row }) => <div className="flex items-center gap-2"><span className={cn("size-3 rounded-full", SWATCH[row.original.color])} /><span className="font-medium">{row.original.name}</span></div> },
    { accessorKey: "slug", header: "Slug", cell: ({ row }) => <span className="font-mono text-xs text-muted-foreground">{row.original.slug}</span> },
    { accessorKey: "rank", header: "Rank", cell: ({ row }) => <span className="tabular-nums">{row.original.rank}</span> },
    { accessorKey: "status", header: "Status", cell: ({ row }) => <Badge variant={row.original.status === "active" ? "default" : "secondary"}>{row.original.status}</Badge> },
    { id: "actions", header: "", cell: ({ row }) => <RowActions onEdit={() => openEdit(row.original)} onDelete={() => remove(row.original)} /> },
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-end"><Button className="gap-1.5" onClick={openCreate}><Plus className="size-4" /> Add category</Button></div>
      <DataTable columns={columns} data={rows} pageSize={10} />
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader><DialogTitle>{editing ? "Edit category" : "New category"}</DialogTitle></DialogHeader>
          <TaxonomyFields form={form} set={set} />
          <DialogFooter><Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={save} disabled={!form.name?.trim()}>{editing ? "Save" : "Create"}</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* ── Subcategories ── */
const emptySub: BlogSubcategoryInput = { name: "", slug: "", categoryId: "", description: "", color: "primary", image: "", rank: 0, status: "active", seoTitle: "", seoDescription: "" };

function SubcategoriesTab({ initial, categories, confirm }: { initial: BlogSubcategory[]; categories: BlogCategory[]; confirm: Confirm }) {
  const [rows, setRows] = React.useState(initial);
  const [open, setOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<BlogSubcategory | null>(null);
  const [form, setForm] = React.useState<BlogSubcategoryInput>(emptySub);
  const set = <K extends keyof BlogSubcategoryInput>(k: K, v: BlogSubcategoryInput[K]) => setForm((f) => ({ ...f, [k]: v }));
  const catName = (id: string) => categories.find((c) => c.id === id)?.name ?? "—";

  const openCreate = () => { setEditing(null); setForm({ ...emptySub, categoryId: categories[0]?.id ?? "" }); setOpen(true); };
  const openEdit = (s: BlogSubcategory) => { setEditing(s); const { id: _i, articleCount: _a, categoryName: _n, ...rest } = s; setForm(rest); setOpen(true); };
  const save = async () => {
    if (!form.name?.trim() || !form.categoryId) { toast.error("Name and parent category are required"); return; }
    const res = editing ? await dal.blog.updateSubcategory(editing.id, form) : await dal.blog.createSubcategory(form);
    if (res.ok) { setRows((p) => editing ? p.map((x) => x.id === res.data.id ? res.data : x) : [...p, res.data]); toast.success(editing ? "Updated" : "Created"); setOpen(false); }
    else toast.error(res.error);
  };
  const remove = async (s: BlogSubcategory) => {
    if (!(await confirm({ title: "Delete subcategory", description: `“${s.name}”?`, confirmText: "Delete", variant: "destructive" }))) return;
    const res = await dal.blog.deleteSubcategory(s.id);
    if (res.ok) { setRows((p) => p.filter((x) => x.id !== s.id)); toast.success("Deleted"); } else toast.error(res.error);
  };

  const columns: ColumnDef<BlogSubcategory>[] = [
    { accessorKey: "name", header: "Name", cell: ({ row }) => <div className="flex items-center gap-2"><span className={cn("size-3 rounded-full", SWATCH[row.original.color])} /><span className="font-medium">{row.original.name}</span></div> },
    { id: "parent", header: "Parent", cell: ({ row }) => <Badge variant="secondary">{catName(row.original.categoryId)}</Badge> },
    { accessorKey: "rank", header: "Rank", cell: ({ row }) => <span className="tabular-nums">{row.original.rank}</span> },
    { accessorKey: "status", header: "Status", cell: ({ row }) => <Badge variant={row.original.status === "active" ? "default" : "secondary"}>{row.original.status}</Badge> },
    { id: "actions", header: "", cell: ({ row }) => <RowActions onEdit={() => openEdit(row.original)} onDelete={() => remove(row.original)} /> },
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-end"><Button className="gap-1.5" onClick={openCreate} disabled={!categories.length}><Plus className="size-4" /> Add subcategory</Button></div>
      <DataTable columns={columns} data={rows} pageSize={10} emptyState={<div className="text-sm text-muted-foreground">{categories.length ? "No subcategories yet." : "Create a category first."}</div>} />
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader><DialogTitle>{editing ? "Edit subcategory" : "New subcategory"}</DialogTitle></DialogHeader>
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground">Parent category</Label>
            <Select value={form.categoryId} onValueChange={(v) => set("categoryId", v)}>
              <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
              <SelectContent>{categories.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <TaxonomyFields form={form} set={set as never} />
          <DialogFooter><Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={save} disabled={!form.name?.trim() || !form.categoryId}>{editing ? "Save" : "Create"}</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* ── shared form fields ── */
function TaxonomyFields({ form, set }: { form: BlogCategoryInput; set: <K extends keyof BlogCategoryInput>(k: K, v: BlogCategoryInput[K]) => void }) {
  return (
    <div className="grid gap-4">
      <div className="grid grid-cols-2 gap-4">
        <Fld label="Name"><Input value={form.name ?? ""} onChange={(e) => set("name", e.target.value)} /></Fld>
        <Fld label="Slug (auto if blank)"><Input value={form.slug ?? ""} onChange={(e) => set("slug", e.target.value)} /></Fld>
      </div>
      <Fld label="Description"><Textarea rows={2} value={form.description ?? ""} onChange={(e) => set("description", e.target.value)} /></Fld>
      <div className="grid grid-cols-3 gap-4">
        <Fld label="Color">
          <Select value={form.color ?? "primary"} onValueChange={(v) => set("color", v as BlogCategoryColor)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{COLORS.map((c) => <SelectItem key={c} value={c}><span className="flex items-center gap-2"><span className={cn("size-3 rounded-full", SWATCH[c])} />{c}</span></SelectItem>)}</SelectContent>
          </Select>
        </Fld>
        <Fld label="Rank"><Input type="number" value={form.rank ?? 0} onChange={(e) => set("rank", Number(e.target.value))} /></Fld>
        <Fld label="Status">
          <Select value={form.status ?? "active"} onValueChange={(v) => set("status", v as "active" | "inactive")}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent><SelectItem value="active">Active</SelectItem><SelectItem value="inactive">Inactive</SelectItem></SelectContent>
          </Select>
        </Fld>
      </div>
      <Fld label="Image"><ImageUpload value={form.image} onChange={(url) => set("image", url)} /></Fld>
      <div className="grid grid-cols-1 gap-4">
        <Fld label="SEO title"><Input value={form.seoTitle ?? ""} onChange={(e) => set("seoTitle", e.target.value)} /></Fld>
        <Fld label="SEO description"><Textarea rows={2} value={form.seoDescription ?? ""} onChange={(e) => set("seoDescription", e.target.value)} /></Fld>
      </div>
    </div>
  );
}

function RowActions({ onEdit, onDelete }: { onEdit: () => void; onDelete: () => void }) {
  return (
    <div className="flex justify-end gap-1">
      <Button variant="ghost" size="sm" onClick={onEdit}><Pencil className="size-4" /></Button>
      <Button variant="ghost" size="sm" onClick={onDelete}><Trash2 className="size-4 text-destructive" /></Button>
    </div>
  );
}
function Fld({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="space-y-1.5"><Label className="text-xs font-medium text-muted-foreground">{label}</Label>{children}</div>;
}
