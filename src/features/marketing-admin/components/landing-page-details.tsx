"use client";

import * as React from "react";
import type { ColumnDef } from "@tanstack/react-table";
import {
  ArrowLeft, ExternalLink, Eye, MousePointerClick, Percent, Mail, Download, Trash2, MessageCircle, X,
} from "lucide-react";
import { toast } from "sonner";

import { Link } from "@/i18n/navigation";
import { dal } from "@/lib/dal";
import type { MarketingLandingPage, ExamLead } from "@/lib/db/landing";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { DataTable } from "@/components/shared/data-table/data-table";
import { KpiCard } from "@/components/shared/kpi-card";
import { useConfirm } from "@/hooks/use-confirm";
import { downloadCsv } from "@/lib/utils/csv";
import { timeAgo } from "@/lib/utils/time-ago";

type TimeRange = "all" | "24h" | "7d" | "30d" | "90d";
const RANGE_MS: Record<Exclude<TimeRange, "all">, number> = {
  "24h": 86_400_000, "7d": 604_800_000, "30d": 2_592_000_000, "90d": 7_776_000_000,
};
const waLink = (n?: string) => (n ? `https://wa.me/${n.replace(/\D/g, "")}` : "");

export function LandingPageDetails({
  page,
  initialRegistrations,
}: {
  page: MarketingLandingPage;
  initialRegistrations: ExamLead[];
}) {
  const { confirm, Confirmation } = useConfirm();
  const [regs, setRegs] = React.useState(initialRegistrations);
  const [search, setSearch] = React.useState("");
  const [profession, setProfession] = React.useState("all");
  const [region, setRegion] = React.useState("all");
  const [range, setRange] = React.useState<TimeRange>("all");

  // Email compose dialog
  const [emailOpen, setEmailOpen] = React.useState(false);
  const [emailTargets, setEmailTargets] = React.useState<ExamLead[]>([]);
  const [subject, setSubject] = React.useState("");
  const [message, setMessage] = React.useState("");

  const professions = React.useMemo(
    () => [...new Set(regs.map((r) => r.profession).filter(Boolean) as string[])],
    [regs],
  );
  const regions = React.useMemo(
    () => [...new Set(regs.map((r) => r.region).filter(Boolean) as string[])],
    [regs],
  );

  // Read once at mount, not per render: Date.now() inside the memo is impure.
  const [now] = React.useState(() => Date.now());
  const filtered = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    return regs.filter((r) => {
      if (q && ![r.name, r.email, r.whatsapp, r.profession, r.interest, r.region]
        .some((v) => v?.toLowerCase().includes(q))) return false;
      if (profession !== "all" && r.profession !== profession) return false;
      if (region !== "all" && r.region !== region) return false;
      if (range !== "all" && now - new Date(r.createdAt).getTime() > RANGE_MS[range]) return false;
      return true;
    });
  }, [regs, search, profession, region, range, now]);

  const activeFilters =
    (search ? 1 : 0) + (profession !== "all" ? 1 : 0) + (region !== "all" ? 1 : 0) + (range !== "all" ? 1 : 0);
  const resetFilters = () => { setSearch(""); setProfession("all"); setRegion("all"); setRange("all"); };

  const exportRows = (leads: ExamLead[]) =>
    downloadCsv(`registrations-${page.path.replace(/\W+/g, "-")}`, leads, [
      { key: "name", header: "Name" }, { key: "email", header: "Email" },
      { key: "whatsapp", header: "WhatsApp" }, { key: "profession", header: "Profession" },
      { key: "interest", header: "Interested in" }, { key: "region", header: "Region" },
      { key: "createdAt", header: "Registered" },
    ]);

  const openEmail = (targets: ExamLead[]) => {
    if (!targets.length) { toast.error("No recipients"); return; }
    setEmailTargets(targets); setSubject(""); setMessage(""); setEmailOpen(true);
  };
  const sendEmail = async () => {
    if (!subject.trim() || !message.trim()) return;
    const res = await dal.landing.emailLeads(emailTargets.map((t) => t.id), subject, message);
    if (res.ok) { toast.success(`Email queued to ${res.data.sent} recipient(s)`); setEmailOpen(false); }
    else toast.error(res.error);
  };

  const deleteOne = async (lead: ExamLead) => {
    const okConfirm = await confirm({
      title: "Delete registration", description: `Remove ${lead.name}?`,
      confirmText: "Delete", variant: "destructive",
    });
    if (!okConfirm) return;
    const res = await dal.landing.deleteLead(lead.id);
    if (res.ok) { setRegs((p) => p.filter((x) => x.id !== lead.id)); toast.success("Registration deleted"); }
    else toast.error(res.error);
  };

  const deleteMany = async (leads: ExamLead[], reset: () => void) => {
    const okConfirm = await confirm({
      title: `Delete ${leads.length} registration(s)`, description: "This cannot be undone.",
      confirmText: "Delete", variant: "destructive",
    });
    if (!okConfirm) return;
    const results = await Promise.allSettled(leads.map((l) => dal.landing.deleteLead(l.id)));
    const ids = new Set(leads.map((l) => l.id));
    setRegs((p) => p.filter((x) => !ids.has(x.id)));
    reset();
    const failed = results.filter((r) => r.status === "rejected" || (r.status === "fulfilled" && !r.value.ok)).length;
    toast.success(`Deleted ${leads.length - failed} registration(s)${failed ? `, ${failed} failed` : ""}`);
  };

  const columns: ColumnDef<ExamLead>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
          onCheckedChange={(v) => table.toggleAllPageRowsSelected(!!v)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox checked={row.getIsSelected()} onCheckedChange={(v) => row.toggleSelected(!!v)} aria-label="Select row" />
      ),
    },
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => <span className="font-medium">{row.original.name}</span>,
    },
    {
      id: "contact",
      header: "Contact",
      cell: ({ row }) => (
        <div className="flex flex-col gap-0.5 text-sm">
          <a href={`mailto:${row.original.email}`} className="text-primary hover:underline">{row.original.email}</a>
          {row.original.whatsapp && (
            <a href={waLink(row.original.whatsapp)} target="_blank" rel="noreferrer"
               className="inline-flex items-center gap-1 text-muted-foreground hover:text-success">
              <MessageCircle className="size-3" /> {row.original.whatsapp}
            </a>
          )}
        </div>
      ),
    },
    {
      accessorKey: "profession",
      header: "Profession",
      cell: ({ row }) => row.original.profession
        ? <Badge variant="outline">{row.original.profession}</Badge>
        : <span className="text-muted-foreground">—</span>,
    },
    {
      accessorKey: "interest",
      header: "Interested in",
      cell: ({ row }) => <span className="text-sm">{row.original.interest || "—"}</span>,
    },
    {
      accessorKey: "region",
      header: "Region",
      cell: ({ row }) => <span className="text-sm">{row.original.region || "—"}</span>,
    },
    {
      accessorKey: "createdAt",
      header: "When",
      cell: ({ row }) => <span className="text-sm text-muted-foreground">{timeAgo(row.original.createdAt)}</span>,
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <div className="flex justify-end">
          <Button variant="ghost" size="sm" onClick={() => deleteOne(row.original)} title="Delete">
            <Trash2 className="size-4 text-destructive" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <Link href="/admin/marketing/landing" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> Back to landing pages
      </Link>

      {/* Overview */}
      <Card>
        <CardContent className="space-y-4 py-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-semibold">{page.name}</h2>
                <Badge variant={page.status === "published" ? "default" : "secondary"}>
                  {page.status === "published" ? "Published" : "Draft"}
                </Badge>
              </div>
              <p className="font-mono text-xs text-muted-foreground">{page.path}</p>
            </div>
            <a href={page.path} target="_blank" rel="noreferrer">
              <Button variant="outline" size="sm" className="gap-1.5">
                <ExternalLink className="size-4" /> View public page
              </Button>
            </a>
          </div>
          <div className="grid gap-4 text-sm sm:grid-cols-2 lg:grid-cols-4">
            <Meta label="Campaign" value={page.campaign || "—"} />
            <Meta label="Audience" value={page.audience || "—"} />
            <Meta label="Created" value={timeAgo(page.createdAt)} />
            <Meta label="Last updated" value={timeAgo(page.updatedAt)} />
          </div>
          {page.description && <p className="text-sm text-muted-foreground">{page.description}</p>}
        </CardContent>
      </Card>

      {/* Performance */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-muted-foreground">Performance</h3>
        <div className="grid gap-4 sm:grid-cols-3">
          <KpiCard label="Views" value={page.views.toLocaleString()} icon={Eye} intent="info" />
          <KpiCard label="CTA clicks" value={page.clicks.toLocaleString()} icon={MousePointerClick} intent="warning" />
          <KpiCard label="CTR" value={`${page.ctr}%`} icon={Percent} intent="success" />
        </div>
        <Card>
          <CardContent className="space-y-2 py-4">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Views → Clicks</span>
              <span className="tabular-nums">{page.clicks.toLocaleString()} / {page.views.toLocaleString()}</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
              <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${Math.min(100, page.ctr)}%` }} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Registrations */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-sm font-semibold text-muted-foreground">
            Registrations <span className="text-muted-foreground/70">({filtered.length})</span>
          </h3>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="gap-1.5" onClick={() => openEmail(filtered)} disabled={!filtered.length}>
              <Mail className="size-4" /> Email candidates
            </Button>
            <Button variant="outline" size="sm" className="gap-1.5" onClick={() => exportRows(filtered)} disabled={!filtered.length}>
              <Download className="size-4" /> Export CSV
            </Button>
          </div>
        </div>

        {regs.length === 0 ? (
          <Card><CardContent className="py-10 text-center text-sm text-muted-foreground">
            No registrations collected for this page.
          </CardContent></Card>
        ) : (
          <DataTable
            columns={columns}
            data={filtered}
            pageSize={10}
            toolbar={() => (
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <Input placeholder="Search name, email, whatsapp…" value={search} onChange={(e) => setSearch(e.target.value)} className="sm:max-w-xs" />
                <Select value={profession} onValueChange={setProfession}>
                  <SelectTrigger className="sm:w-44"><SelectValue placeholder="Profession" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All professions</SelectItem>
                    {professions.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Select value={region} onValueChange={setRegion}>
                  <SelectTrigger className="sm:w-40"><SelectValue placeholder="Region" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All regions</SelectItem>
                    {regions.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Select value={range} onValueChange={(v) => setRange(v as TimeRange)}>
                  <SelectTrigger className="sm:w-32"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All time</SelectItem>
                    <SelectItem value="24h">Last 24h</SelectItem>
                    <SelectItem value="7d">Last 7d</SelectItem>
                    <SelectItem value="30d">Last 30d</SelectItem>
                    <SelectItem value="90d">Last 90d</SelectItem>
                  </SelectContent>
                </Select>
                {activeFilters > 0 && (
                  <Button variant="ghost" size="sm" className="gap-1" onClick={resetFilters}>
                    <X className="size-3.5" /> Reset ({activeFilters})
                  </Button>
                )}
              </div>
            )}
            bulkBar={(table) => {
              const selected = table.getSelectedRowModel().rows.map((r) => r.original);
              return (
                <div className="flex flex-wrap items-center gap-2 rounded-lg border border-border/70 bg-muted/40 px-3 py-2">
                  <span className="text-sm font-medium">{selected.length} selected</span>
                  <div className="ms-auto flex gap-2">
                    <Button variant="outline" size="sm" className="gap-1.5" onClick={() => openEmail(selected)}>
                      <Mail className="size-4" /> Email
                    </Button>
                    <Button variant="outline" size="sm" className="gap-1.5" onClick={() => exportRows(selected)}>
                      <Download className="size-4" /> Export
                    </Button>
                    <Button variant="outline" size="sm" className="gap-1.5"
                            onClick={() => deleteMany(selected, () => table.resetRowSelection())}>
                      <Trash2 className="size-4 text-destructive" /> Delete
                    </Button>
                  </div>
                </div>
              );
            }}
            emptyState={
              <div className="text-sm text-muted-foreground">No registrations match your filters.</div>
            }
          />
        )}
      </div>

      {/* Email compose */}
      <Dialog open={emailOpen} onOpenChange={setEmailOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Email candidates</DialogTitle>
            <DialogDescription>
              Sending to <strong>{emailTargets.length}</strong> recipient(s). Use{" "}
              <code className="text-xs">{"{{name}}"}</code> / <code className="text-xs">{"{{email}}"}</code> — personalized per recipient.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground">Subject</Label>
              <Input value={subject} onChange={(e) => setSubject(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground">Message</Label>
              <Textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={6} placeholder="Hi {{name}}, …" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEmailOpen(false)}>Cancel</Button>
            <Button onClick={sendEmail} disabled={!subject.trim() || !message.trim()}>
              Send to {emailTargets.length}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {Confirmation}
    </div>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-0.5">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="font-medium">{value}</p>
    </div>
  );
}
