"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import type { ColumnDef } from "@tanstack/react-table";
import { Plus, ShieldCheck, Download, Layers, Palette, Trash2, Search, Loader2, Check } from "lucide-react";
import { toast } from "sonner";

import type { AdminCertificate } from "@/lib/db/admin";
import type { Lead } from "@/lib/db/crm";
import { Link, useRouter } from "@/i18n/navigation";
import { dal } from "@/lib/dal";
import { cn, formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { DataTable } from "@/components/shared/data-table/data-table";
import { FileUpload } from "@/components/shared/file-upload";

export function CertificatesModule({ initialData }: { initialData: AdminCertificate[] }) {
  const t = useTranslations("Admin");
  const router = useRouter();
  const [rows, setRows] = React.useState(initialData);
  const [open, setOpen] = React.useState(false);

  const verify = (c: AdminCertificate) => router.push(`/verify-certificate?code=${encodeURIComponent(c.code)}`);
  const download = (c: AdminCertificate) => {
    if (!c.link) { toast.error(t("certNoFile")); return; }
    window.open(c.link, "_blank", "noopener");
  };
  const remove = async (c: AdminCertificate) => {
    if (!window.confirm(t("certDeleteConfirm", { code: c.code }))) return;
    const prev = rows;
    setRows((p) => p.filter((x) => x.id !== c.id));
    const res = await dal.admin.deleteCertificate(c.id);
    if (res.ok) toast.success(t("certDeleted"));
    else { setRows(prev); toast.error(res.error); }
  };

  const columns: ColumnDef<AdminCertificate>[] = [
    { accessorKey: "code", header: t("colCode"), cell: ({ row }) => <span className="font-mono text-sm font-medium">{row.original.code}</span> },
    { accessorKey: "student", header: t("colStudent"), cell: ({ row }) => <span className="font-medium">{row.original.student}</span> },
    { accessorKey: "course", header: t("colCourse"), cell: ({ row }) => <span className="text-sm text-muted-foreground">{row.original.course}</span> },
    { accessorKey: "issuedAt", header: t("colIssued"), cell: ({ row }) => <span className="text-xs text-muted-foreground">{formatDate(row.original.issuedAt)}</span> },
    { id: "actions", cell: ({ row }) => {
      const c = row.original;
      return (
        <div className="flex justify-end gap-1">
          <Button variant="ghost" size="icon" className="size-8" onClick={() => verify(c)} aria-label={t("verify")} title={t("verify")}><ShieldCheck className="size-4" /></Button>
          <Button variant="ghost" size="icon" className="size-8" disabled={!c.link} onClick={() => download(c)} aria-label={t("download")} title={t("download")}><Download className="size-4" /></Button>
          <Button variant="ghost" size="icon" className="size-8 text-destructive hover:text-destructive" onClick={() => remove(c)} aria-label={t("certDelete")} title={t("certDelete")}><Trash2 className="size-4" /></Button>
        </div>
      );
    } },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap justify-end gap-2">
        <Button asChild variant="outline" className="gap-1.5">
          <Link href="/admin/certificates/bulk"><Layers className="size-4" />{t("certBulk")}</Link>
        </Button>
        <Button asChild variant="outline" className="gap-1.5">
          <Link href="/admin/certificates/design"><Palette className="size-4" />{t("certDesign")}</Link>
        </Button>
        <Button className="gap-1.5" onClick={() => setOpen(true)}><Plus className="size-4" />{t("issueCertificate")}</Button>
      </div>
      <DataTable columns={columns} data={rows} pageSize={8} />

      <IssueCertificateModal
        open={open}
        onOpenChange={setOpen}
        onIssued={(cert) => setRows((p) => [cert, ...p])}
      />
    </div>
  );
}

/* ───────────────────────── Issue certificate ───────────────────────── */
function IssueCertificateModal({
  open, onOpenChange, onIssued,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onIssued: (cert: AdminCertificate) => void;
}) {
  const t = useTranslations("Admin");
  const [leads, setLeads] = React.useState<Lead[]>([]);
  const [loadingLeads, setLoadingLeads] = React.useState(false);
  const [q, setQ] = React.useState("");
  const [leadId, setLeadId] = React.useState("");
  const [link, setLink] = React.useState("");
  const [saving, setSaving] = React.useState(false);

  // Load the lead directory once when the dialog opens (client-side; auth-gated).
  React.useEffect(() => {
    if (!open || leads.length) return;
    setLoadingLeads(true);
    dal.crm.fetchLeads({}).then((res) => {
      if (res.ok) setLeads(res.data);
    }).finally(() => setLoadingLeads(false));
  }, [open, leads.length]);

  const reset = () => { setQ(""); setLeadId(""); setLink(""); };
  const term = q.trim().toLowerCase();
  const filtered = term
    ? leads.filter((l) => l.fullName.toLowerCase().includes(term) || l.email?.toLowerCase().includes(term))
    : leads;
  const selectedLead = leads.find((l) => l.id === leadId);

  const submit = async () => {
    if (!leadId) { toast.error(t("certLeadRequired")); return; }
    if (!link) { toast.error(t("certFileRequired")); return; }
    setSaving(true);
    const res = await dal.admin.createCertificate({ leadId, certificateLink: link });
    setSaving(false);
    if (res.ok) {
      onIssued(res.data);
      toast.success(t("certIssued", { name: res.data.student }));
      onOpenChange(false); reset();
    } else {
      toast.error(res.error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { onOpenChange(o); if (!o) reset(); }}>
      <DialogContent className="max-h-[88vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{t("issueCertificate")}</DialogTitle>
          <DialogDescription>{t("issueCertDesc")}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label>{t("selectStudent")} <span className="text-destructive">*</span></Label>
            <div className="relative">
              <Search className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t("certSearchLead")} className="ps-9" />
            </div>
            <div className="max-h-48 space-y-1 overflow-y-auto rounded-lg border p-1">
              {loadingLeads ? (
                <p className="flex items-center justify-center gap-2 py-6 text-sm text-muted-foreground"><Loader2 className="size-4 animate-spin" />{t("certLoadingLeads")}</p>
              ) : filtered.length === 0 ? (
                <p className="py-6 text-center text-sm text-muted-foreground">{t("certNoLeads")}</p>
              ) : filtered.slice(0, 50).map((l) => (
                <button key={l.id} type="button" onClick={() => setLeadId(l.id)}
                  className={cn("flex w-full items-center justify-between gap-2 rounded-md px-3 py-2 text-start text-sm hover:bg-muted/50",
                    l.id === leadId && "bg-primary/10 text-primary")}>
                  <span className="min-w-0">
                    <span className="block truncate font-medium">{l.fullName}</span>
                    {l.email && <span className="block truncate text-xs text-muted-foreground">{l.email}</span>}
                  </span>
                  {l.id === leadId && <Check className="size-4 shrink-0" />}
                </button>
              ))}
            </div>
            {selectedLead && <p className="text-xs text-muted-foreground">{t("certSelected", { name: selectedLead.fullName })}</p>}
          </div>

          <div className="space-y-1.5">
            <Label>{t("certFile")} <span className="text-destructive">*</span></Label>
            <FileUpload value={link} onChange={setLink} hint={t("certFileHint")} accept="application/pdf,image/*,.pdf" />
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={saving}>{t("certCancel")}</Button>
          <Button onClick={submit} disabled={!leadId || !link || saving} className="gap-1.5">
            {saving && <Loader2 className="size-4 animate-spin" />}{t("issue")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
