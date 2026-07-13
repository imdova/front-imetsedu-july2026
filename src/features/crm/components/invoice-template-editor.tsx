"use client";

import * as React from "react";
import { Palette, Building2, LayoutList, Tag, Save, RotateCcw } from "lucide-react";
import { toast } from "sonner";

import { dal } from "@/lib/dal";
import { DEFAULT_INVOICE_TEMPLATE } from "@/lib/dal/invoice-template";
import type { InvoiceTemplate } from "@/types/invoice-template";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";

type Group = keyof InvoiceTemplate;

const COLOR_FIELDS: { key: keyof InvoiceTemplate["colors"]; label: string }[] = [
  { key: "primary", label: "Brand / header" },
  { key: "headerText", label: "Header text" },
  { key: "accent", label: "Accent (headings)" },
  { key: "text", label: "Body text" },
  { key: "muted", label: "Labels" },
  { key: "tableHeaderBg", label: "Table header bg" },
  { key: "border", label: "Borders" },
];

export function InvoiceTemplateEditor() {
  const [form, setForm] = React.useState<InvoiceTemplate>(DEFAULT_INVOICE_TEMPLATE);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [dirty, setDirty] = React.useState(false);

  React.useEffect(() => {
    (async () => {
      const res = await dal.invoiceTemplate.fetchTemplate();
      if (res.ok) setForm(res.data);
      else toast.error(res.error);
      setLoading(false);
    })();
  }, []);

  const patch = <G extends Group>(group: G, partial: Partial<InvoiceTemplate[G]>) => {
    setForm((f) => ({ ...f, [group]: { ...f[group], ...partial } }));
    setDirty(true);
  };

  const save = async () => {
    setSaving(true);
    const res = await dal.invoiceTemplate.updateTemplate(form);
    setSaving(false);
    if (res.ok) { setForm(res.data); setDirty(false); toast.success("Invoice template saved"); }
    else toast.error(res.error);
  };

  const reset = () => { setForm(DEFAULT_INVOICE_TEMPLATE); setDirty(true); };

  if (loading) return <p className="py-16 text-center text-sm text-muted-foreground">Loading template…</p>;

  return (
    <div className="grid gap-5 lg:grid-cols-[1fr_360px]">
      <div className="space-y-5">
        {/* Colors */}
        <Panel icon={Palette} title="Colors" subtitle="Used across the downloadable invoice PDF.">
          <div className="grid gap-4 sm:grid-cols-2">
            {COLOR_FIELDS.map((c) => (
              <F key={c.key} label={c.label}>
                <ColorInput value={form.colors[c.key]} onChange={(v) => patch("colors", { [c.key]: v } as Partial<InvoiceTemplate["colors"]>)} />
              </F>
            ))}
          </div>
        </Panel>

        {/* Company */}
        <Panel icon={Building2} title="Company" subtitle="Branding shown in the header and company block.">
          <div className="grid gap-4 sm:grid-cols-2">
            <F label="Wordmark"><Input value={form.company.wordmark} onChange={(e) => patch("company", { wordmark: e.target.value })} /></F>
            <F label="Tagline"><Input value={form.company.tagline} onChange={(e) => patch("company", { tagline: e.target.value })} /></F>
            <F label="Company name"><Input value={form.company.name} onChange={(e) => patch("company", { name: e.target.value })} /></F>
            <F label="Address"><Input value={form.company.address} onChange={(e) => patch("company", { address: e.target.value })} /></F>
          </div>
        </Panel>

        {/* Sections */}
        <Panel icon={LayoutList} title="Sections" subtitle="Toggle which parts appear on the invoice.">
          <div className="grid gap-2.5 sm:grid-cols-2">
            <Toggle label="Colored header band" checked={form.sections.coloredHeader} onChange={(v) => patch("sections", { coloredHeader: v })} />
            <Toggle label="Company details" checked={form.sections.showCompany} onChange={(v) => patch("sections", { showCompany: v })} />
            <Toggle label="Terms line" checked={form.sections.showTerms} onChange={(v) => patch("sections", { showTerms: v })} />
            <Toggle label="Payment receipt" checked={form.sections.showReceipt} onChange={(v) => patch("sections", { showReceipt: v })} />
            <Toggle label="Footer note" checked={form.sections.showFooter} onChange={(v) => patch("sections", { showFooter: v })} />
          </div>
        </Panel>

        {/* Labels */}
        <Panel icon={Tag} title="Labels & text" subtitle="Wording rendered on the invoice.">
          <div className="grid gap-4 sm:grid-cols-2">
            <F label="Invoice title"><Input value={form.labels.invoiceTitle} onChange={(e) => patch("labels", { invoiceTitle: e.target.value })} /></F>
            <F label={'"Bill to" label'}><Input value={form.labels.billTo} onChange={(e) => patch("labels", { billTo: e.target.value })} /></F>
            <F label="Receipt heading"><Input value={form.labels.receipt} onChange={(e) => patch("labels", { receipt: e.target.value })} /></F>
            <F label="Footer note"><Input value={form.labels.footer} onChange={(e) => patch("labels", { footer: e.target.value })} /></F>
          </div>
        </Panel>

        <div className="flex items-center gap-2">
          <Button className="gap-1.5" disabled={!dirty || saving} onClick={save}><Save className="size-4" />{saving ? "Saving…" : "Save template"}</Button>
          <Button variant="ghost" className="gap-1.5 text-muted-foreground" onClick={reset}><RotateCcw className="size-4" />Reset to defaults</Button>
        </div>
      </div>

      {/* Live preview */}
      <div className="lg:sticky lg:top-20 lg:self-start">
        <p className="mb-2 text-xs font-semibold text-muted-foreground">Live preview</p>
        <InvoicePreview t={form} />
      </div>
    </div>
  );
}

function InvoicePreview({ t }: { t: InvoiceTemplate }) {
  const c = t.colors;
  return (
    <div className="overflow-hidden rounded-xl border shadow-sm" style={{ background: "#fff", color: c.text }}>
      {/* Header */}
      {t.sections.coloredHeader ? (
        <div className="flex items-start justify-between px-4 py-3" style={{ background: c.primary, color: c.headerText }}>
          <div>
            <div className="text-lg font-bold leading-none">{t.company.wordmark || "IMETS"}</div>
            <div className="mt-1 text-[8px] uppercase tracking-wider opacity-85">{t.company.tagline}</div>
          </div>
          <div className="text-end">
            <div className="text-[9px] uppercase opacity-85">{t.labels.invoiceTitle}</div>
            <div className="text-base font-bold">INV-2026-0143</div>
          </div>
        </div>
      ) : (
        <div className="flex items-start justify-between px-4 py-3">
          <div className="text-lg font-bold" style={{ color: c.primary }}>{t.company.wordmark || "IMETS"}</div>
          <div className="text-base font-bold" style={{ color: c.primary }}>INV-2026-0143</div>
        </div>
      )}
      <div className="space-y-3 px-4 py-3 text-[11px]">
        {t.sections.showCompany && (
          <div><div className="font-semibold">{t.company.name}</div><div style={{ color: c.muted }}>{t.company.address}</div></div>
        )}
        <div className="h-px" style={{ background: c.border }} />
        <div className="flex justify-between">
          <div>
            <div className="text-[8px] uppercase" style={{ color: c.muted }}>{t.labels.billTo}</div>
            <div className="font-semibold" dir="auto">هبة محمد عبد الحميد اسماعيل</div>
          </div>
          {t.sections.showTerms && (
            <div className="text-end"><div className="text-[8px] uppercase" style={{ color: c.muted }}>Terms</div><div>Net 14</div></div>
          )}
        </div>
        {/* Table header */}
        <div className="grid grid-cols-[1fr_auto] rounded px-2 py-1 text-[8px] font-semibold uppercase" style={{ background: c.tableHeaderBg, color: c.muted }}>
          <span>Description</span><span>Total</span>
        </div>
        <div className="grid grid-cols-[1fr_auto] px-2 text-[10px]"><span>Installment 1 of 2</span><span>EGP 7,900</span></div>
        {/* Total */}
        <div className="flex items-center justify-between rounded px-2 py-1.5 text-[11px] font-bold" style={{ background: c.primary, color: c.headerText }}>
          <span>Total due</span><span>EGP 7,900</span>
        </div>
        {t.sections.showFooter && t.labels.footer.trim() && (
          <div className="border-t pt-2 text-center text-[9px]" style={{ borderColor: c.border, color: c.muted }}>{t.labels.footer}</div>
        )}
      </div>
    </div>
  );
}

function Panel({ icon: Icon, title, subtitle, children }: { icon: React.ElementType; title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <Card>
      <CardContent className="space-y-4 pt-5">
        <div className="flex items-center gap-2.5">
          <span className="grid size-8 place-items-center rounded-lg bg-primary/10 text-primary"><Icon className="size-4" /></span>
          <div><p className="font-heading text-sm font-semibold">{title}</p><p className="text-xs text-muted-foreground">{subtitle}</p></div>
        </div>
        {children}
      </CardContent>
    </Card>
  );
}

function F({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="space-y-1.5"><Label className="text-xs font-medium text-muted-foreground">{label}</Label>{children}</div>;
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center justify-between rounded-lg border border-border/70 px-3 py-2.5">
      <span className="text-sm font-medium">{label}</span>
      <Switch checked={checked} onCheckedChange={onChange} />
    </label>
  );
}

function ColorInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex gap-2">
      <input type="color" value={value || "#000000"} onChange={(e) => onChange(e.target.value)} className="h-9 w-12 shrink-0 cursor-pointer rounded-md border border-border bg-background" />
      <Input value={value} onChange={(e) => onChange(e.target.value)} className={cn("font-mono")} />
    </div>
  );
}
