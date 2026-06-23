"use client";

import * as React from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Plus, Pencil, Trash2, Megaphone, Star, Power } from "lucide-react";
import { toast } from "sonner";

import { dal } from "@/lib/dal";
import type {
  Banner,
  BannerInput,
  BannerPlacement,
  BannerVariant,
  PromotedPlacement,
  PromotedInput,
  PromotedItemType,
  PromotedSlot,
} from "@/lib/db/marketing";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DataTable } from "@/components/shared/data-table/data-table";
import { KpiCard } from "@/components/shared/kpi-card";
import { useConfirm } from "@/hooks/use-confirm";

/* -------------------------------------------------------------------------- */
/*  Options                                                                    */
/* -------------------------------------------------------------------------- */

const BANNER_PLACEMENTS: { value: BannerPlacement; label: string }[] = [
  { value: "global", label: "Global (all pages)" },
  { value: "home", label: "Homepage" },
  { value: "courses", label: "Courses" },
  { value: "checkout", label: "Checkout" },
];
const BANNER_VARIANTS: { value: BannerVariant; label: string }[] = [
  { value: "info", label: "Info" },
  { value: "success", label: "Success" },
  { value: "warning", label: "Warning" },
  { value: "promo", label: "Promo" },
];
const PROMOTED_TYPES: { value: PromotedItemType; label: string }[] = [
  { value: "course", label: "Course" },
  { value: "instructor", label: "Instructor" },
  { value: "category", label: "Category" },
  { value: "event", label: "Event" },
];
const PROMOTED_SLOTS: { value: PromotedSlot; label: string }[] = [
  { value: "home_hero", label: "Home — Hero" },
  { value: "home_featured", label: "Home — Featured" },
  { value: "courses_top", label: "Courses — Top" },
  { value: "sidebar", label: "Sidebar" },
];

const emptyBanner: BannerInput = {
  title: "",
  message: "",
  linkUrl: "",
  linkLabel: "",
  placement: "global",
  variant: "info",
  isActive: true,
  order: 1,
};
const emptyPromoted: PromotedInput = {
  itemType: "course",
  itemId: "",
  label: "",
  slot: "home_hero",
  order: 1,
  isActive: true,
};

const variantBadge: Record<BannerVariant, "default" | "secondary" | "outline" | "destructive"> = {
  promo: "default",
  info: "outline",
  success: "secondary",
  warning: "destructive",
};

/* -------------------------------------------------------------------------- */
/*  Component                                                                  */
/* -------------------------------------------------------------------------- */

export function PlatformMarketing({
  initialBanners,
  initialPromoted,
}: {
  initialBanners: Banner[];
  initialPromoted: PromotedPlacement[];
}) {
  const { confirm, Confirmation } = useConfirm();
  const [banners, setBanners] = React.useState(initialBanners);
  const [promoted, setPromoted] = React.useState(initialPromoted);

  /* ── Banner dialog state ── */
  const [bannerOpen, setBannerOpen] = React.useState(false);
  const [bannerEditing, setBannerEditing] = React.useState<Banner | null>(null);
  const [bannerForm, setBannerForm] = React.useState<BannerInput>(emptyBanner);

  const openCreateBanner = () => {
    setBannerEditing(null);
    setBannerForm(emptyBanner);
    setBannerOpen(true);
  };
  const openEditBanner = (b: Banner) => {
    setBannerEditing(b);
    const { id: _i, createdAt: _c, updatedAt: _u, ...rest } = b;
    setBannerForm(rest);
    setBannerOpen(true);
  };
  const saveBanner = async () => {
    if (!bannerForm.title.trim()) return;
    if (bannerEditing) {
      const res = await dal.marketing.updateBanner(bannerEditing.id, bannerForm);
      if (res.ok && res.data) {
        setBanners((p) => p.map((x) => (x.id === res.data!.id ? res.data! : x)));
        toast.success("Banner updated");
        setBannerOpen(false);
      } else toast.error(res.ok ? "Banner not found" : res.error);
    } else {
      const res = await dal.marketing.createBanner(bannerForm);
      if (res.ok) {
        setBanners((p) => [...p, res.data]);
        toast.success("Banner created");
        setBannerOpen(false);
      } else toast.error(res.error);
    }
  };
  const toggleBanner = async (b: Banner) => {
    const res = await dal.marketing.updateBanner(b.id, { isActive: !b.isActive });
    if (res.ok && res.data) {
      setBanners((p) => p.map((x) => (x.id === res.data!.id ? res.data! : x)));
      toast.success(res.data.isActive ? "Banner activated" : "Banner deactivated");
    }
  };
  const removeBanner = async (b: Banner) => {
    const okConfirm = await confirm({
      title: "Delete banner",
      description: `“${b.title}” will be removed permanently.`,
      confirmText: "Delete",
      variant: "destructive",
    });
    if (!okConfirm) return;
    const res = await dal.marketing.deleteBanner(b.id);
    if (res.ok) {
      setBanners((p) => p.filter((x) => x.id !== b.id));
      toast.success("Banner deleted");
    } else toast.error(res.error);
  };

  /* ── Promoted dialog state ── */
  const [promoOpen, setPromoOpen] = React.useState(false);
  const [promoEditing, setPromoEditing] = React.useState<PromotedPlacement | null>(null);
  const [promoForm, setPromoForm] = React.useState<PromotedInput>(emptyPromoted);

  const openCreatePromo = () => {
    setPromoEditing(null);
    setPromoForm(emptyPromoted);
    setPromoOpen(true);
  };
  const openEditPromo = (p: PromotedPlacement) => {
    setPromoEditing(p);
    const { id: _i, createdAt: _c, updatedAt: _u, ...rest } = p;
    setPromoForm(rest);
    setPromoOpen(true);
  };
  const savePromo = async () => {
    if (!promoForm.itemId.trim()) return;
    if (promoEditing) {
      const res = await dal.marketing.updatePromoted(promoEditing.id, promoForm);
      if (res.ok && res.data) {
        setPromoted((p) => p.map((x) => (x.id === res.data!.id ? res.data! : x)));
        toast.success("Placement updated");
        setPromoOpen(false);
      } else toast.error(res.ok ? "Placement not found" : res.error);
    } else {
      const res = await dal.marketing.createPromoted(promoForm);
      if (res.ok) {
        setPromoted((p) => [...p, res.data]);
        toast.success("Placement created");
        setPromoOpen(false);
      } else toast.error(res.error);
    }
  };
  const togglePromo = async (p: PromotedPlacement) => {
    const res = await dal.marketing.updatePromoted(p.id, { isActive: !p.isActive });
    if (res.ok && res.data) {
      setPromoted((prev) => prev.map((x) => (x.id === res.data!.id ? res.data! : x)));
      toast.success(res.data.isActive ? "Placement activated" : "Placement deactivated");
    }
  };
  const removePromo = async (p: PromotedPlacement) => {
    const okConfirm = await confirm({
      title: "Delete placement",
      description: `“${p.label || p.itemId}” will be removed permanently.`,
      confirmText: "Delete",
      variant: "destructive",
    });
    if (!okConfirm) return;
    const res = await dal.marketing.deletePromoted(p.id);
    if (res.ok) {
      setPromoted((prev) => prev.filter((x) => x.id !== p.id));
      toast.success("Placement deleted");
    } else toast.error(res.error);
  };

  /* ── Columns ── */
  const bannerColumns: ColumnDef<Banner>[] = [
    {
      accessorKey: "title",
      header: "Banner",
      cell: ({ row }) => (
        <div className="space-y-0.5">
          <p className="font-medium">{row.original.title}</p>
          <p className="line-clamp-1 max-w-md text-xs text-muted-foreground">
            {row.original.message}
          </p>
        </div>
      ),
    },
    {
      accessorKey: "placement",
      header: "Placement",
      cell: ({ row }) => (
        <span className="text-sm capitalize">{row.original.placement}</span>
      ),
    },
    {
      accessorKey: "variant",
      header: "Style",
      cell: ({ row }) => (
        <Badge variant={variantBadge[row.original.variant]} className="capitalize">
          {row.original.variant}
        </Badge>
      ),
    },
    {
      accessorKey: "order",
      header: "Order",
      cell: ({ row }) => <span className="tabular-nums">{row.original.order}</span>,
    },
    {
      accessorKey: "isActive",
      header: "Status",
      cell: ({ row }) => (
        <Badge variant={row.original.isActive ? "default" : "secondary"}>
          {row.original.isActive ? "Active" : "Inactive"}
        </Badge>
      ),
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <div className="flex justify-end gap-1">
          <Button variant="ghost" size="sm" onClick={() => toggleBanner(row.original)} title="Toggle active">
            <Power className="size-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => openEditBanner(row.original)} title="Edit">
            <Pencil className="size-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => removeBanner(row.original)} title="Delete">
            <Trash2 className="size-4 text-destructive" />
          </Button>
        </div>
      ),
    },
  ];

  const promoColumns: ColumnDef<PromotedPlacement>[] = [
    {
      accessorKey: "label",
      header: "Item",
      cell: ({ row }) => (
        <div className="space-y-0.5">
          <p className="font-medium">{row.original.label || row.original.itemId}</p>
          <p className="font-mono text-xs text-muted-foreground">{row.original.itemId}</p>
        </div>
      ),
    },
    {
      accessorKey: "itemType",
      header: "Type",
      cell: ({ row }) => (
        <Badge variant="outline" className="capitalize">{row.original.itemType}</Badge>
      ),
    },
    {
      accessorKey: "slot",
      header: "Slot",
      cell: ({ row }) => (
        <span className="text-sm">{PROMOTED_SLOTS.find((s) => s.value === row.original.slot)?.label ?? row.original.slot}</span>
      ),
    },
    {
      accessorKey: "order",
      header: "Order",
      cell: ({ row }) => <span className="tabular-nums">{row.original.order}</span>,
    },
    {
      accessorKey: "isActive",
      header: "Status",
      cell: ({ row }) => (
        <Badge variant={row.original.isActive ? "default" : "secondary"}>
          {row.original.isActive ? "Active" : "Inactive"}
        </Badge>
      ),
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <div className="flex justify-end gap-1">
          <Button variant="ghost" size="sm" onClick={() => togglePromo(row.original)} title="Toggle active">
            <Power className="size-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => openEditPromo(row.original)} title="Edit">
            <Pencil className="size-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => removePromo(row.original)} title="Delete">
            <Trash2 className="size-4 text-destructive" />
          </Button>
        </div>
      ),
    },
  ];

  const activeBanners = banners.filter((b) => b.isActive).length;
  const activePromoted = promoted.filter((p) => p.isActive).length;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Banners" value={banners.length} icon={Megaphone} intent="primary" />
        <KpiCard label="Active banners" value={activeBanners} icon={Power} intent="success" />
        <KpiCard label="Featured items" value={promoted.length} icon={Star} intent="info" />
        <KpiCard label="Active featured" value={activePromoted} icon={Power} intent="success" />
      </div>

      <Tabs defaultValue="banners" className="space-y-4">
        <TabsList>
          <TabsTrigger value="banners">Banners</TabsTrigger>
          <TabsTrigger value="placements">Featured Placements</TabsTrigger>
        </TabsList>

        <TabsContent value="banners" className="space-y-4">
          <div className="flex justify-end">
            <Button className="gap-1.5" onClick={openCreateBanner}>
              <Plus className="size-4" /> Add banner
            </Button>
          </div>
          <DataTable
            columns={bannerColumns}
            data={banners}
            pageSize={8}
            emptyState={
              <div className="flex flex-col items-center gap-2 text-muted-foreground">
                <Megaphone className="size-8 opacity-50" />
                <p className="text-sm font-medium">No banners yet</p>
              </div>
            }
          />
        </TabsContent>

        <TabsContent value="placements" className="space-y-4">
          <div className="flex justify-end">
            <Button className="gap-1.5" onClick={openCreatePromo}>
              <Plus className="size-4" /> Add placement
            </Button>
          </div>
          <DataTable
            columns={promoColumns}
            data={promoted}
            pageSize={8}
            emptyState={
              <div className="flex flex-col items-center gap-2 text-muted-foreground">
                <Star className="size-8 opacity-50" />
                <p className="text-sm font-medium">No featured placements yet</p>
              </div>
            }
          />
        </TabsContent>
      </Tabs>

      {/* ── Banner dialog ── */}
      <Dialog open={bannerOpen} onOpenChange={setBannerOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{bannerEditing ? "Edit banner" : "New banner"}</DialogTitle>
            <DialogDescription>
              Promo bars shown on the public site. Inactive banners are hidden.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <Field label="Title" required>
              <Input
                value={bannerForm.title}
                onChange={(e) => setBannerForm((f) => ({ ...f, title: e.target.value }))}
                placeholder="Summer Intake 2026"
              />
            </Field>
            <Field label="Message">
              <Textarea
                value={bannerForm.message}
                onChange={(e) => setBannerForm((f) => ({ ...f, message: e.target.value }))}
                rows={2}
              />
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Link URL">
                <Input
                  value={bannerForm.linkUrl}
                  onChange={(e) => setBannerForm((f) => ({ ...f, linkUrl: e.target.value }))}
                  placeholder="/courses"
                />
              </Field>
              <Field label="Link label">
                <Input
                  value={bannerForm.linkLabel}
                  onChange={(e) => setBannerForm((f) => ({ ...f, linkLabel: e.target.value }))}
                  placeholder="Browse courses"
                />
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Placement">
                <Select
                  value={bannerForm.placement}
                  onValueChange={(v) => setBannerForm((f) => ({ ...f, placement: v as BannerPlacement }))}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {BANNER_PLACEMENTS.map((o) => (
                      <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Style">
                <Select
                  value={bannerForm.variant}
                  onValueChange={(v) => setBannerForm((f) => ({ ...f, variant: v as BannerVariant }))}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {BANNER_VARIANTS.map((o) => (
                      <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <Field label="Starts">
                <Input
                  type="date"
                  value={bannerForm.startsAt?.slice(0, 10) ?? ""}
                  onChange={(e) => setBannerForm((f) => ({ ...f, startsAt: e.target.value || undefined }))}
                />
              </Field>
              <Field label="Ends">
                <Input
                  type="date"
                  value={bannerForm.endsAt?.slice(0, 10) ?? ""}
                  onChange={(e) => setBannerForm((f) => ({ ...f, endsAt: e.target.value || undefined }))}
                />
              </Field>
              <Field label="Order">
                <Input
                  type="number"
                  value={bannerForm.order}
                  onChange={(e) => setBannerForm((f) => ({ ...f, order: Number(e.target.value) }))}
                />
              </Field>
            </div>
            <label className="flex items-center justify-between rounded-lg border border-border/70 px-3 py-2">
              <span className="text-sm font-medium">Active</span>
              <Switch
                checked={bannerForm.isActive}
                onCheckedChange={(v) => setBannerForm((f) => ({ ...f, isActive: v }))}
              />
            </label>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBannerOpen(false)}>Cancel</Button>
            <Button onClick={saveBanner} disabled={!bannerForm.title.trim()}>
              {bannerEditing ? "Save changes" : "Create banner"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Promoted dialog ── */}
      <Dialog open={promoOpen} onOpenChange={setPromoOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{promoEditing ? "Edit placement" : "New featured placement"}</DialogTitle>
            <DialogDescription>
              Promote a course, instructor, category or event into a site slot.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="grid grid-cols-2 gap-4">
              <Field label="Item type">
                <Select
                  value={promoForm.itemType}
                  onValueChange={(v) => setPromoForm((f) => ({ ...f, itemType: v as PromotedItemType }))}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {PROMOTED_TYPES.map((o) => (
                      <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Slot">
                <Select
                  value={promoForm.slot}
                  onValueChange={(v) => setPromoForm((f) => ({ ...f, slot: v as PromotedSlot }))}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {PROMOTED_SLOTS.map((o) => (
                      <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            </div>
            <Field label="Item ID" required>
              <Input
                value={promoForm.itemId}
                onChange={(e) => setPromoForm((f) => ({ ...f, itemId: e.target.value }))}
                placeholder="course_finance_101"
              />
            </Field>
            <Field label="Label">
              <Input
                value={promoForm.label}
                onChange={(e) => setPromoForm((f) => ({ ...f, label: e.target.value }))}
                placeholder="Financial Modeling Masterclass"
              />
            </Field>
            <div className="grid grid-cols-3 gap-4">
              <Field label="Starts">
                <Input
                  type="date"
                  value={promoForm.startsAt?.slice(0, 10) ?? ""}
                  onChange={(e) => setPromoForm((f) => ({ ...f, startsAt: e.target.value || undefined }))}
                />
              </Field>
              <Field label="Ends">
                <Input
                  type="date"
                  value={promoForm.endsAt?.slice(0, 10) ?? ""}
                  onChange={(e) => setPromoForm((f) => ({ ...f, endsAt: e.target.value || undefined }))}
                />
              </Field>
              <Field label="Order">
                <Input
                  type="number"
                  value={promoForm.order}
                  onChange={(e) => setPromoForm((f) => ({ ...f, order: Number(e.target.value) }))}
                />
              </Field>
            </div>
            <label className="flex items-center justify-between rounded-lg border border-border/70 px-3 py-2">
              <span className="text-sm font-medium">Active</span>
              <Switch
                checked={promoForm.isActive}
                onCheckedChange={(v) => setPromoForm((f) => ({ ...f, isActive: v }))}
              />
            </label>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPromoOpen(false)}>Cancel</Button>
            <Button onClick={savePromo} disabled={!promoForm.itemId.trim()}>
              {promoEditing ? "Save changes" : "Create placement"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {Confirmation}
    </div>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium text-muted-foreground">
        {label}
        {required && <span className="text-destructive"> *</span>}
      </Label>
      {children}
    </div>
  );
}
