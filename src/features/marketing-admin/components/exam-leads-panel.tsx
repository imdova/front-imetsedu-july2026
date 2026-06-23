"use client";

import * as React from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Users, CalendarClock, CalendarDays, MessageCircle, Mail, Download, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { dal } from "@/lib/dal";
import type { ExamLead } from "@/lib/db/landing";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { DataTable } from "@/components/shared/data-table/data-table";
import { KpiCard } from "@/components/shared/kpi-card";
import { useConfirm } from "@/hooks/use-confirm";
import { downloadCsv } from "@/lib/utils/csv";
import { timeAgo } from "@/lib/utils/time-ago";

const waLink = (n?: string) => (n ? `https://wa.me/${n.replace(/\D/g, "")}` : "");

export function ExamLeadsPanel({ initialLeads }: { initialLeads: ExamLead[] }) {
  const { confirm, Confirmation } = useConfirm();
  const [leads, setLeads] = React.useState(initialLeads);
  const [search, setSearch] = React.useState("");

  const [emailOpen, setEmailOpen] = React.useState(false);
  const [subject, setSubject] = React.useState("");
  const [message, setMessage] = React.useState("");

  const filtered = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return leads;
    return leads.filter((l) =>
      [l.name, l.email, l.whatsapp, l.profession, l.interest, l.region].some((v) =>
        v?.toLowerCase().includes(q),
      ),
    );
  }, [leads, search]);

  const now = Date.now();
  const within = (ms: number) => leads.filter((l) => now - new Date(l.createdAt).getTime() <= ms).length;
  const withWhatsapp = leads.filter((l) => !!l.whatsapp?.trim()).length;

  const exportCsv = () =>
    downloadCsv("free-exam-leads", filtered, [
      { key: "name", header: "Name" }, { key: "email", header: "Email" },
      { key: "whatsapp", header: "WhatsApp" }, { key: "profession", header: "Profession" },
      { key: "interest", header: "Interested in" }, { key: "region", header: "Region" },
      { key: "source", header: "Source" }, { key: "path", header: "Path" },
      { key: "createdAt", header: "Registered" },
    ]);

  const sendEmail = async () => {
    if (!subject.trim() || !message.trim()) return;
    const res = await dal.landing.emailLeads(filtered.map((l) => l.id), subject, message);
    if (res.ok) { toast.success(`Email queued to ${res.data.sent} lead(s)`); setEmailOpen(false); }
    else toast.error(res.error);
  };

  const remove = async (lead: ExamLead) => {
    const okConfirm = await confirm({
      title: "Delete lead", description: `Remove ${lead.name}?`,
      confirmText: "Delete", variant: "destructive",
    });
    if (!okConfirm) return;
    const res = await dal.landing.deleteLead(lead.id);
    if (res.ok) { setLeads((p) => p.filter((x) => x.id !== lead.id)); toast.success("Lead deleted"); }
    else toast.error(res.error);
  };

  const columns: ColumnDef<ExamLead>[] = [
    { accessorKey: "name", header: "Name", cell: ({ row }) => <span className="font-medium">{row.original.name}</span> },
    {
      id: "contact", header: "Contact",
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
      accessorKey: "profession", header: "Profession",
      cell: ({ row }) => row.original.profession
        ? <Badge variant="outline">{row.original.profession}</Badge>
        : <span className="text-muted-foreground">—</span>,
    },
    { accessorKey: "interest", header: "Interested in", cell: ({ row }) => <span className="text-sm">{row.original.interest || "—"}</span> },
    { accessorKey: "region", header: "Region", cell: ({ row }) => <span className="text-sm">{row.original.region || "—"}</span> },
    { accessorKey: "createdAt", header: "When", cell: ({ row }) => <span className="text-sm text-muted-foreground">{timeAgo(row.original.createdAt)}</span> },
    {
      id: "actions", header: "",
      cell: ({ row }) => (
        <div className="flex justify-end">
          <Button variant="ghost" size="sm" onClick={() => remove(row.original)} title="Delete">
            <Trash2 className="size-4 text-destructive" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Total leads" value={leads.length} icon={Users} intent="primary" />
        <KpiCard label="Last 7 days" value={within(7 * 86_400_000)} icon={CalendarClock} intent="info" />
        <KpiCard label="Last 30 days" value={within(30 * 86_400_000)} icon={CalendarDays} intent="success" />
        <KpiCard label="With WhatsApp" value={withWhatsapp} icon={MessageCircle} intent="warning" />
      </div>

      <DataTable
        columns={columns}
        data={filtered}
        pageSize={10}
        toolbar={() => (
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <Input
              placeholder="Search name, email, whatsapp, profession…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="sm:max-w-sm"
            />
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setEmailOpen(true)} disabled={!filtered.length}>
                <Mail className="size-4" /> Email leads
              </Button>
              <Button variant="outline" size="sm" className="gap-1.5" onClick={exportCsv} disabled={!filtered.length}>
                <Download className="size-4" /> Export CSV
              </Button>
            </div>
          </div>
        )}
        emptyState={<div className="text-sm text-muted-foreground">No leads match your search.</div>}
      />

      <Dialog open={emailOpen} onOpenChange={setEmailOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Email leads</DialogTitle>
            <DialogDescription>
              Sending to <strong>{filtered.length}</strong> lead(s). Use{" "}
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
            <Button onClick={sendEmail} disabled={!subject.trim() || !message.trim()}>Send to {filtered.length}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {Confirmation}
    </div>
  );
}
