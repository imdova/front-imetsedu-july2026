"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import {
  Settings, Palette, Puzzle, TrendingUp, Shield, Wrench, Code2, Webhook,
  Folder, Eye, Image as ImageIcon, UploadCloud, Pencil, ChevronRight, Save,
  Search, Share2, BarChart3, Video, Lock, MessageCircle, Rocket, X, RefreshCw, CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";

import type { Integration, BrandingTheme, IntegrationGroup } from "@/lib/db/site-settings";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent } from "@/components/ui/dialog";

const INTG_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  Share2, BarChart3, Search, Video, Lock, MessageCircle,
};
const FONTS = ["Poppins", "Inter", "Roboto", "Lato", "Montserrat", "Nunito"];

type Section = "general" | "branding" | "integrations" | "marketing" | "security" | "maintenance" | "api" | "webhooks";

export function SettingsConsole({ integrations, theme: initialTheme }: { integrations: Integration[]; theme: BrandingTheme }) {
  const t = useTranslations("Admin");
  const [section, setSection] = React.useState<Section>("branding");

  const siteItems: { key: Section; label: string; icon: React.ReactNode }[] = [
    { key: "general", label: t("setNavGeneral"), icon: <Settings className="size-4" /> },
    { key: "branding", label: t("setNavBranding"), icon: <Palette className="size-4" /> },
    { key: "integrations", label: t("setNavIntegrations"), icon: <Puzzle className="size-4" /> },
    { key: "marketing", label: t("setNavMarketing"), icon: <TrendingUp className="size-4" /> },
    { key: "security", label: t("setNavSecurity"), icon: <Shield className="size-4" /> },
    { key: "maintenance", label: t("setNavMaintenance"), icon: <Wrench className="size-4" /> },
  ];
  const advItems: { key: Section; label: string; icon: React.ReactNode }[] = [
    { key: "api", label: t("setNavApi"), icon: <Code2 className="size-4" /> },
    { key: "webhooks", label: t("setNavWebhooks"), icon: <Webhook className="size-4" /> },
  ];

  return (
    <div className="overflow-hidden rounded-2xl border border-border/70 bg-card shadow-sm">
      {/* Top bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/70 px-5 py-3">
        <div>
          <p className="font-bold">{t("setAcademy")}</p>
          <p className="text-xs text-muted-foreground">{t("setConsole")}</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-end">
            <p className="text-sm font-semibold">{t("setAdminUser")}</p>
            <p className="text-xs text-muted-foreground">{t("setAdminRole")}</p>
          </div>
          <Button className="gap-2" onClick={() => toast.success(t("brandSaved"))}><Save className="size-4" />{t("setSaveChanges")}</Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-[240px_1fr]">
        {/* Sub-sidebar */}
        <aside className="border-b border-border/70 p-4 lg:border-b-0 lg:border-e">
          <p className="px-2 text-[0.7rem] font-semibold uppercase tracking-wide text-muted-foreground">{t("setGroupSite")}</p>
          <nav className="mt-2 space-y-1">
            {siteItems.map((it) => <SideLink key={it.key} label={it.label} icon={it.icon} active={section === it.key} onClick={() => setSection(it.key)} />)}
          </nav>
          <p className="mt-5 px-2 text-[0.7rem] font-semibold uppercase tracking-wide text-muted-foreground">{t("setGroupAdvanced")}</p>
          <nav className="mt-2 space-y-1">
            {advItems.map((it) => <SideLink key={it.key} label={it.label} icon={it.icon} active={section === it.key} onClick={() => setSection(it.key)} />)}
          </nav>
        </aside>

        {/* Content */}
        <div className="min-w-0 p-5 lg:p-7">
          {section === "branding" ? <BrandingPanel theme={initialTheme} />
            : section === "integrations" ? <IntegrationsPanel integrations={integrations} />
            : <PlaceholderPanel section={section} />}
        </div>
      </div>

      {/* Footer */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border/70 px-5 py-3 text-xs text-muted-foreground">
        <span>{t("setCopyright")}</span>
        <span className="flex items-center gap-4">
          <button type="button" className="hover:text-foreground">{t("setPrivacy")}</button>
          <button type="button" className="hover:text-foreground">{t("setDocs")}</button>
          <button type="button" className="hover:text-foreground">{t("setStatus")}</button>
        </span>
      </div>
    </div>
  );
}

function SideLink({ label, icon, active, onClick }: { label: string; icon: React.ReactNode; active: boolean; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick}
      className={cn("flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
        active ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted/50 hover:text-foreground")}>
      {icon}{label}
    </button>
  );
}

/* ───────────────────────────── Branding panel ────────────────────────────── */
function BrandingPanel({ theme }: { theme: BrandingTheme }) {
  const t = useTranslations("Admin");
  const [state, setState] = React.useState(theme);
  const set = <K extends keyof BrandingTheme>(k: K, v: BrandingTheme[K]) => setState((s) => ({ ...s, [k]: v }));
  const radii: BrandingTheme["radius"][] = ["square", "modern", "soft", "round"];
  const radiusPx: Record<BrandingTheme["radius"], string> = { square: "2px", modern: "6px", soft: "10px", round: "16px" };

  return (
    <div className="space-y-6">
      <Breadcrumb crumbs={[t("setBreadSettings"), t("brandBreadcrumb")]} />
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">{t("brandTitle")}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{t("brandSubtitle")}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setState(theme)}>{t("setDiscard")}</Button>
          <Button onClick={() => toast.success(t("brandSaved"))}>{t("setSaveChanges")}</Button>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        {/* Visual Assets */}
        <div className="space-y-4">
          <SectionLabel icon={<Folder className="size-4" />}>{t("brandVisualAssets")}</SectionLabel>
          <AssetCard title={t("brandPrimaryLogo")} filename="1780330603377-40uj6otj7…" t={t} />
          <AssetCard title={t("brandSecondaryLogo")} filename="1780330644914-tmvt1jxild…" t={t} dark />
          <div className="rounded-xl border border-border/70 p-4">
            <p className="text-sm font-semibold">{t("brandHero")}</p>
            <div className="mt-3 grid place-items-center rounded-xl border-2 border-dashed border-border/70 bg-muted/20 px-4 py-8 text-center">
              <UploadCloud className="size-7 text-primary" />
              <p className="mt-2 text-sm font-medium text-primary">{t("brandUpload")}</p>
              <p className="mt-1 text-xs text-muted-foreground">{t("brandUploadHint")}</p>
            </div>
          </div>
        </div>

        {/* Theme Customization */}
        <div className="space-y-4">
          <SectionLabel icon={<Palette className="size-4" />}>{t("brandThemeCustom")}</SectionLabel>
          <ColorField label={t("brandPrimaryColor")} value={state.primaryColor} onChange={(v) => set("primaryColor", v)} />
          <ColorField label={t("brandAccentColor")} value={state.accentColor} onChange={(v) => set("accentColor", v)} />
          <ColorField label={t("brandSystemHighlight")} value={state.systemHighlight} onChange={(v) => set("systemHighlight", v)} />
          <FontField label={t("brandHeadingFont")} value={state.headingFont} onChange={(v) => set("headingFont", v)} />
          <FontField label={t("brandBodyFont")} value={state.bodyFont} onChange={(v) => set("bodyFont", v)} />
          <div className="rounded-xl border border-border/70 p-4">
            <p className="text-sm font-semibold">{t("brandRadius")}</p>
            <div className="mt-3 grid grid-cols-4 gap-2">
              {radii.map((r) => (
                <button key={r} type="button" onClick={() => set("radius", r)}
                  className={cn("rounded-lg px-2 py-2 text-xs font-medium transition-colors",
                    state.radius === r ? "bg-primary text-primary-foreground" : "bg-muted/50 text-muted-foreground hover:bg-muted")}>
                  {t(("brandRadius" + r[0].toUpperCase() + r.slice(1)) as never)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Preview */}
        <div className="space-y-4">
          <SectionLabel icon={<Eye className="size-4" />}>{t("brandPreview")}</SectionLabel>
          <div className="rounded-2xl border border-border/70 bg-muted/20 p-4">
            <div className="overflow-hidden rounded-xl border border-border/70 bg-card shadow-sm" style={{ borderRadius: radiusPx[state.radius] }}>
              <div className="flex items-center gap-1.5 border-b border-border/70 px-3 py-2">
                <span className="size-2.5 rounded-full bg-destructive/60" /><span className="size-2.5 rounded-full bg-warning/60" /><span className="size-2.5 rounded-full bg-success/60" />
                <span className="ms-3 text-[0.65rem] font-semibold uppercase tracking-wide text-muted-foreground">{t("brandPreviewLabel")}</span>
              </div>
              <div className="space-y-3 p-4">
                <div className="h-6 w-full rounded" style={{ background: state.primaryColor }} />
                <div className="space-y-2">
                  <div className="h-2.5 w-3/4 rounded bg-muted" /><div className="h-2.5 w-1/2 rounded bg-muted" /><div className="h-2.5 w-2/3 rounded bg-muted" />
                </div>
                <div className="relative h-8 w-full rounded" style={{ background: state.accentColor }}>
                  <span className="absolute -top-3 end-2 grid size-9 place-items-center rounded-full text-white shadow-md" style={{ background: state.primaryColor }}>+</span>
                </div>
              </div>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">{t("brandDesktopPreview")}</p>
          </div>
          <div className="rounded-2xl border border-border/70 p-4">
            <p className="text-xs text-muted-foreground">{t("brandLogoPreview")}</p>
            <p className="mt-2 text-xl font-bold tracking-tight" style={{ color: state.primaryColor, fontFamily: state.headingFont }}>IMETS</p>
            <p className="text-[0.6rem] uppercase tracking-[0.3em] text-muted-foreground">school of business</p>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border/70 pt-4">
        <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-success">
          <span className="size-2 rounded-full bg-success" />{t("brandChangesLive")}
        </span>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setState(theme)}>{t("setDiscard")}</Button>
          <Button onClick={() => toast.success(t("brandSaved"))}>{t("setSaveChanges")}</Button>
        </div>
      </div>
    </div>
  );
}

function AssetCard({ title, filename, t, dark }: { title: string; filename: string; t: (k: string) => string; dark?: boolean }) {
  return (
    <div className="rounded-xl border border-border/70 p-4">
      <p className="text-sm font-semibold">{title}</p>
      <div className={cn("mt-3 grid place-items-center rounded-lg border border-border/60 px-4 py-6", dark ? "bg-slate-800" : "bg-muted/20")}>
        <span className={cn("text-2xl font-bold tracking-tight", dark ? "text-white" : "text-primary")}>IMETS</span>
      </div>
      <div className="mt-2 flex items-center justify-between gap-2 text-xs">
        <span className="truncate text-muted-foreground">{filename}</span>
        <span className="flex shrink-0 items-center gap-2">
          <button type="button" className="font-medium text-primary hover:underline">{t("brandChange")}</button>
          <button type="button" className="font-medium text-destructive hover:underline">{t("brandRemove")}</button>
        </span>
      </div>
    </div>
  );
}

function ColorField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="rounded-xl border border-border/70 p-4">
      <p className="text-sm font-semibold">{label}</p>
      <div className="mt-3 flex items-center gap-2 rounded-lg border border-border/60 px-2 py-1.5">
        <label className="relative size-6 shrink-0 cursor-pointer overflow-hidden rounded" style={{ background: value }}>
          <input type="color" value={value} onChange={(e) => onChange(e.target.value)} className="absolute inset-0 cursor-pointer opacity-0" />
        </label>
        <input value={value} onChange={(e) => onChange(e.target.value)} className="flex-1 bg-transparent text-sm outline-none" />
        <Pencil className="size-4 text-muted-foreground" />
      </div>
    </div>
  );
}

function FontField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="rounded-xl border border-border/70 p-4">
      <p className="text-sm font-semibold">{label}</p>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="mt-3 w-full"><SelectValue /></SelectTrigger>
        <SelectContent>{FONTS.map((f) => <SelectItem key={f} value={f}>{f}</SelectItem>)}</SelectContent>
      </Select>
    </div>
  );
}

/* ──────────────────────────── Integrations panel ─────────────────────────── */
const GROUP_ORDER: { key: IntegrationGroup; labelKey: string; icon: React.ReactNode }[] = [
  { key: "marketing", labelKey: "intgGroupMarketing", icon: <TrendingUp className="size-4 text-primary" /> },
  { key: "operations", labelKey: "intgGroupOperations", icon: <Settings className="size-4 text-primary" /> },
  { key: "optimization", labelKey: "intgGroupOptimization", icon: <Rocket className="size-4 text-primary" /> },
];

function IntegrationsPanel({ integrations }: { integrations: Integration[] }) {
  const t = useTranslations("Admin");
  const [query, setQuery] = React.useState("");
  const [setup, setSetup] = React.useState<Integration | null>(null);

  const visible = React.useMemo(
    () =>
      integrations.filter(
        (i) =>
          i.id !== "int_payment" &&
          !/stripe/i.test(i.id) &&
          !/stripe/i.test(i.name),
      ),
    [integrations],
  );

  const matches = (i: Integration) => i.name.toLowerCase().includes(query.trim().toLowerCase());

  return (
    <div className="space-y-7">
      <Breadcrumb crumbs={[t("intgBreadSite"), t("intgBreadcrumb")]} />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-2xl font-bold tracking-tight">{t("intgTitle")}</h2>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={t("intgSearch")} className="ps-9 sm:w-64" />
          </div>
          <Button className="gap-2" onClick={() => toast.success(t("intgSaved"))}><Save className="size-4" />{t("intgSave")}</Button>
        </div>
      </div>

      {GROUP_ORDER.map((g) => {
        const items = visible.filter((i) => i.group === g.key && matches(i));
        if (items.length === 0) return null;
        return (
          <div key={g.key} className="space-y-4">
            <p className="flex items-center gap-2 text-sm font-bold uppercase tracking-wide">{g.icon}{t(g.labelKey)}</p>
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {items.map((i) => {
                const Icon = INTG_ICONS[i.icon] ?? Puzzle;
                const connected = i.status === "connected";
                return (
                  <div key={i.id} className="flex flex-col rounded-2xl border border-border/70 bg-card p-5 shadow-sm">
                    <div className="flex items-start justify-between">
                      <span className="grid size-11 place-items-center rounded-xl" style={{ backgroundColor: `${i.accent}1a`, color: i.accent }}><Icon className="size-5" /></span>
                      <span className={cn("rounded-full px-2.5 py-1 text-[0.65rem] font-bold uppercase tracking-wide",
                        connected ? "bg-success/10 text-success" : "bg-muted text-muted-foreground")}>
                        {connected ? t("intgConnected") : t("intgNotConfigured")}
                      </span>
                    </div>
                    <p className="mt-4 font-semibold">{i.name}</p>
                    <p className="mt-1 flex-1 text-sm text-muted-foreground">{i.description}</p>
                    <Button variant={connected ? "outline" : "default"} className="mt-4 w-full" onClick={() => setSetup(i)}>{t("intgConfigure")}</Button>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      <IntegrationSetupModal integration={setup} onClose={() => setSetup(null)} />
    </div>
  );
}

function IntegrationSetupModal({ integration, onClose }: { integration: Integration | null; onClose: () => void }) {
  const t = useTranslations("Admin");
  const [secret, setSecret] = React.useState("");
  const [show, setShow] = React.useState(false);
  if (!integration) return null;
  const Icon = INTG_ICONS[integration.icon] ?? Puzzle;
  return (
    <Dialog open={!!integration} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="p-0 sm:max-w-lg" showCloseButton={false}>
        <div className="flex items-start justify-between gap-3 p-5">
          <div className="flex items-start gap-3">
            <span className="grid size-9 place-items-center rounded-lg" style={{ backgroundColor: `${integration.accent}1a`, color: integration.accent }}><Icon className="size-5" /></span>
            <div>
              <h3 className="font-semibold">{t("intgSetupTitle", { name: integration.name })}</h3>
              <p className="text-sm text-muted-foreground">{t("intgSetupSub")}</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="text-muted-foreground hover:text-foreground"><X className="size-5" /></button>
        </div>
        <div className="px-5 pb-2">
          <Label className="text-sm font-semibold">{t("intgApiKey")}</Label>
          <div className="relative mt-2">
            <Input type={show ? "text" : "password"} value={secret} onChange={(e) => setSecret(e.target.value)} className="pe-9" />
            <button type="button" onClick={() => setShow((s) => !s)} className="absolute end-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
              {show ? <Eye className="size-4" /> : <Eye className="size-4 opacity-60" />}
            </button>
          </div>
        </div>
        <div className="flex flex-wrap items-center justify-end gap-2 border-t border-border/70 p-5">
          <Button variant="outline" className="gap-2" onClick={() => toast.success(t("intgTested"))}><RefreshCw className="size-4" />{t("intgTest")}</Button>
          <Button variant="ghost" onClick={onClose}>{t("intgCancel")}</Button>
          <Button className="gap-2" onClick={() => { toast.success(t("intgActivated", { name: integration.name })); onClose(); }}><CheckCircle2 className="size-4" />{t("intgActivate")}</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* ─────────────────────────── Placeholder panels ──────────────────────────── */
function PlaceholderPanel({ section }: { section: Section }) {
  const t = useTranslations("Admin");
  const map: Record<string, { title: string; sub: string }> = {
    general: { title: t("setGeneralTitle"), sub: t("setGeneralSub") },
    marketing: { title: t("setMarketingTitle"), sub: t("setMarketingSub") },
    security: { title: t("setSecurityTitle"), sub: t("setSecuritySub") },
    maintenance: { title: t("setMaintenanceTitle"), sub: t("setMaintenanceSub") },
    api: { title: t("setApiTitle"), sub: t("setApiSub") },
    webhooks: { title: t("setWebhooksTitle"), sub: t("setWebhooksSub") },
  };
  const info = map[section] ?? map.general;
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">{info.title}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{info.sub}</p>
      </div>
      <div className="grid place-items-center rounded-2xl border border-dashed border-border/70 bg-muted/20 p-16 text-center">
        <Settings className="size-10 text-muted-foreground/40" />
        <p className="mt-3 text-sm text-muted-foreground">{t("setComingSoon")}</p>
      </div>
    </div>
  );
}

function SectionLabel({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return <p className="flex items-center gap-2 text-base font-bold"><span className="text-primary">{icon}</span>{children}</p>;
}

function Breadcrumb({ crumbs }: { crumbs: string[] }) {
  return (
    <nav className="flex items-center gap-1.5 text-sm text-muted-foreground">
      {crumbs.map((c, i) => (
        <span key={c} className="flex items-center gap-1.5">
          {i > 0 && <ChevronRight className="size-3.5 rtl:rotate-180" />}
          <span className={i === crumbs.length - 1 ? "font-medium text-foreground" : "text-primary"}>{c}</span>
        </span>
      ))}
    </nav>
  );
}
