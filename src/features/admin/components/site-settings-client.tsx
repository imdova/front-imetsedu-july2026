"use client";

import * as React from "react";
import {
  Save, SlidersHorizontal, Image as ImageIcon, Palette, Phone, Share2, Code2,
  ToggleRight, Wrench, AlertTriangle, Globe, Check,
} from "lucide-react";
import { toast } from "sonner";

import { dal } from "@/lib/dal";
import type { SiteSettings, SsTheme } from "@/types/site-settings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ImageUpload } from "@/components/shared/image-upload";
import { cn } from "@/lib/utils";

type SectionId = keyof SiteSettings;
const SECTIONS: { id: SectionId; label: string; desc: string; icon: React.ElementType }[] = [
  { id: "general", label: "General", desc: "Identity, locale, currency", icon: SlidersHorizontal },
  { id: "branding", label: "Branding", desc: "Logos, favicon, social image", icon: ImageIcon },
  { id: "theme", label: "Theme", desc: "Colors, appearance, radius", icon: Palette },
  { id: "contact", label: "Contact", desc: "Support email, phone, address", icon: Phone },
  { id: "social", label: "Social Links", desc: "Your social profiles", icon: Share2 },
  { id: "integrations", label: "Integrations", desc: "Analytics & tracking IDs", icon: Code2 },
  { id: "features", label: "Feature Flags", desc: "Module toggles", icon: ToggleRight },
  { id: "maintenance", label: "Maintenance", desc: "Take the site offline", icon: Wrench },
];

export function SiteSettingsClient({ initial }: { initial: SiteSettings }) {
  const [form, setForm] = React.useState<SiteSettings>(initial);
  const [active, setActive] = React.useState<SectionId>("general");
  const [saving, setSaving] = React.useState(false);
  const [dirty, setDirty] = React.useState(false);

  const patch = <K extends SectionId>(section: K, partial: Partial<SiteSettings[K]>) => {
    setForm((f) => ({ ...f, [section]: { ...f[section], ...partial } }));
    setDirty(true);
  };

  const save = async () => {
    setSaving(true);
    const res = await dal.siteSettings.updateFullSettings(form);
    setSaving(false);
    if (res.ok) {
      setDirty(false);
      toast.success("Settings saved");
    } else {
      toast.error(res.error);
    }
  };

  // Setup health — % of key fields completed; the list surfaces what's still missing.
  const checklist = [
    { ok: !!form.general.siteName, todo: "Add site name", section: "general" as SectionId },
    { ok: !!form.general.tagline, todo: "Add tagline", section: "general" as SectionId },
    { ok: !!form.branding.logoUrl, todo: "Add navbar logo", section: "branding" as SectionId },
    { ok: !!form.branding.faviconUrl, todo: "Add favicon", section: "branding" as SectionId },
    { ok: !!form.branding.ogImage, todo: "Add social share image", section: "branding" as SectionId },
    { ok: !!form.contact.supportEmail, todo: "Add support email", section: "contact" as SectionId },
    { ok: !!form.integrations.gaMeasurementId, todo: "Add analytics id", section: "integrations" as SectionId },
    { ok: !!form.integrations.metaPixelId, todo: "Add meta pixel id", section: "integrations" as SectionId },
    { ok: !!form.theme.primaryColor, todo: "Add primary color", section: "theme" as SectionId },
  ];
  const done = checklist.filter((c) => c.ok).length;
  const pct = Math.round((done / checklist.length) * 100);
  const todos = checklist.filter((c) => !c.ok);
  const health = pct < 50 ? "#ef4444" : pct < 80 ? "#f59e0b" : "#10b981";

  const activeMeta = SECTIONS.find((s) => s.id === active)!;

  return (
    <div className="space-y-4">
      {form.maintenance.enabled && (
        <div className="flex items-center gap-2 rounded-xl border border-warning/40 bg-warning/10 px-4 py-2.5 text-sm">
          <AlertTriangle className="size-4 text-warning" />
          <span className="font-medium">Maintenance mode is ON</span>
          <span className="text-muted-foreground">— the public site shows the maintenance screen.</span>
        </div>
      )}

      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Site Settings</h1>
          <p className="text-sm text-muted-foreground">
            Configure your platform — identity, branding, integrations, modules and more.
          </p>
        </div>
        {dirty ? (
          <Button className="gap-1.5" onClick={save} disabled={saving}>
            <Save className="size-4" /> {saving ? "Saving…" : "Save changes"}
          </Button>
        ) : (
          <span className="inline-flex items-center gap-1.5 rounded-md bg-success/15 px-3 py-2 text-sm font-medium text-success">
            <Check className="size-4" /> Saved
          </span>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
        {/* section nav + setup health */}
        <aside className="space-y-4 lg:sticky lg:top-20 lg:self-start">
          <Card>
            <CardContent className="p-2">
              <nav className="space-y-0.5">
                {SECTIONS.map((s) => (
                  <button key={s.id} onClick={() => setActive(s.id)}
                    className={cn("flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-start text-sm transition-colors",
                      active === s.id ? "bg-primary/10 font-medium text-primary" : "text-foreground/80 hover:bg-muted")}>
                    <s.icon className="size-4 shrink-0" />
                    <span>{s.label}</span>
                  </button>
                ))}
              </nav>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="space-y-2.5 py-4">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Setup Health</p>
                <span
                  className="rounded-full px-2 py-0.5 text-xs font-semibold"
                  style={{ background: `${health}1a`, color: health }}
                >
                  {pct}%
                </span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: health }} />
              </div>
              {todos.length ? (
                <ul className="space-y-1 pt-1">
                  {todos.map((c) => (
                    <li key={c.todo}>
                      <button
                        onClick={() => setActive(c.section)}
                        className="text-xs text-muted-foreground transition-colors hover:text-foreground"
                      >
                        • {c.todo}
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="pt-1 text-xs font-medium text-success">Everything is set up 🎉</p>
              )}
            </CardContent>
          </Card>
        </aside>

        {/* active panel */}
        <Card>
          <CardContent className="space-y-5 py-6">
            <PanelHeader icon={activeMeta.icon} title={activeMeta.label} subtitle={activeMeta.desc} />

            {active === "general" && <>
              <div className="grid gap-4 sm:grid-cols-2">
                <F label="Site name"><Input value={form.general.siteName} onChange={(e) => patch("general", { siteName: e.target.value })} /></F>
                <F label="Tagline"><Input value={form.general.tagline} onChange={(e) => patch("general", { tagline: e.target.value })} /></F>
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <F label="Default locale">
                  <Select value={form.general.defaultLocale} onValueChange={(v) => patch("general", { defaultLocale: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="en">English</SelectItem><SelectItem value="ar">Arabic</SelectItem></SelectContent>
                  </Select>
                </F>
                <F label="Timezone"><Input value={form.general.timezone} onChange={(e) => patch("general", { timezone: e.target.value })} /></F>
                <F label="Currency"><Input value={form.general.currency} onChange={(e) => patch("general", { currency: e.target.value })} /></F>
              </div>
            </>}

            {active === "branding" && <div className="grid gap-5 sm:grid-cols-2">
              <F label="Navbar logo"><ImageUpload value={form.branding.logoUrl} onChange={(url) => patch("branding", { logoUrl: url })} /></F>
              <F label="Dark-mode logo"><ImageUpload value={form.branding.darkLogoUrl} onChange={(url) => patch("branding", { darkLogoUrl: url })} /></F>
              <F label="Footer logo"><ImageUpload value={form.branding.footerLogoUrl} onChange={(url) => patch("branding", { footerLogoUrl: url })} /></F>
              <F label="Favicon"><ImageUpload value={form.branding.faviconUrl} onChange={(url) => patch("branding", { faviconUrl: url })} hint="Square icon" /></F>
              <F label="Default social (OG) image"><ImageUpload value={form.branding.ogImage} onChange={(url) => patch("branding", { ogImage: url })} hint="1200×630" /></F>
              <F label="Primary color"><ColorInput value={form.branding.primaryColor} onChange={(v) => patch("branding", { primaryColor: v })} /></F>
            </div>}

            {active === "theme" && <>
              <div className="grid gap-4 sm:grid-cols-2">
                <F label="Primary color"><ColorInput value={form.theme.primaryColor} onChange={(v) => patch("theme", { primaryColor: v })} /></F>
                <F label="Accent color"><ColorInput value={form.theme.accentColor} onChange={(v) => patch("theme", { accentColor: v })} /></F>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <F label="Mode">
                  <Select value={form.theme.mode} onValueChange={(v) => patch("theme", { mode: v as SsTheme["mode"] })}>
                    <SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="light">Light</SelectItem><SelectItem value="dark">Dark</SelectItem><SelectItem value="system">System</SelectItem></SelectContent>
                  </Select>
                </F>
                <F label="Radius">
                  <Select value={form.theme.radius} onValueChange={(v) => patch("theme", { radius: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{["square", "modern", "soft", "round"].map((r) => <SelectItem key={r} value={r} className="capitalize">{r}</SelectItem>)}</SelectContent>
                  </Select>
                </F>
              </div>
              <Toggle label="Let visitors switch theme" checked={form.theme.allowUserToggle} onChange={(v) => patch("theme", { allowUserToggle: v })} />
              <ThemePreview theme={form.theme} />
            </>}

            {active === "contact" && <>
              <div className="grid gap-4 sm:grid-cols-2">
                <F label="Support email"><Input type="email" value={form.contact.supportEmail} onChange={(e) => patch("contact", { supportEmail: e.target.value })} /></F>
                <F label="Phone"><Input value={form.contact.phone} onChange={(e) => patch("contact", { phone: e.target.value })} /></F>
              </div>
              <F label="Address"><Textarea rows={2} value={form.contact.address} onChange={(e) => patch("contact", { address: e.target.value })} /></F>
              <F label="Business hours"><Input value={form.contact.businessHours} onChange={(e) => patch("contact", { businessHours: e.target.value })} placeholder="Sun–Thu, 9am–5pm" /></F>
            </>}

            {active === "social" && <div className="grid gap-4 sm:grid-cols-2">
              {(["facebook", "x", "linkedin", "instagram", "youtube"] as const).map((k) => (
                <F key={k} label={k === "x" ? "X (Twitter)" : k.charAt(0).toUpperCase() + k.slice(1)}>
                  <Input value={form.social[k]} onChange={(e) => patch("social", { [k]: e.target.value } as Partial<SiteSettings["social"]>)} placeholder="https://…" />
                </F>
              ))}
            </div>}

            {active === "integrations" && <>
              <p className="flex items-start gap-2 text-xs leading-relaxed text-primary/80">
                <Globe className="mt-0.5 size-3.5 shrink-0" />
                <span>Tracking IDs below are public. The Conversions API token is stored securely on the server and is never sent to browsers.</span>
              </p>

              <div className="grid gap-5 sm:grid-cols-2">
                <IField label="Google Analytics (GA4) ID"><Input value={form.integrations.gaMeasurementId} onChange={(e) => patch("integrations", { gaMeasurementId: e.target.value })} placeholder="G-XXXXXXX" /></IField>
                <IField label="Google Tag Manager ID"><Input value={form.integrations.gtmId} onChange={(e) => patch("integrations", { gtmId: e.target.value })} placeholder="GTM-XXXXXX" /></IField>
                <IField label="Meta Pixel ID"><Input value={form.integrations.metaPixelId} onChange={(e) => patch("integrations", { metaPixelId: e.target.value })} placeholder="990261693785375" /></IField>
                <IField label="Hotjar ID"><Input value={form.integrations.hotjarId} onChange={(e) => patch("integrations", { hotjarId: e.target.value })} placeholder="1234567" /></IField>
                <IField label="Intercom App ID"><Input value={form.integrations.intercomAppId} onChange={(e) => patch("integrations", { intercomAppId: e.target.value })} placeholder="abcd1234" /></IField>
              </div>

              <div className="space-y-4 rounded-xl border border-border/60 p-5">
                <div>
                  <p className="font-semibold">Facebook Conversions API (CAPI)</p>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                    Sends conversion events (Purchase, Lead, ViewContent, InitiateCheckout, …) server-side, alongside the Pixel, for more accurate tracking. Uses the Meta Pixel ID above.
                  </p>
                </div>

                <label className="flex items-center justify-between gap-4 rounded-xl border border-border/70 bg-card px-4 py-3">
                  <span>
                    <span className="block text-sm font-medium">Enable Conversions API</span>
                    <span className="block text-xs text-muted-foreground">Send server-side events to Meta using the access token below.</span>
                  </span>
                  <Switch checked={form.integrations.metaCapiEnabled} onCheckedChange={(v) => patch("integrations", { metaCapiEnabled: v })} />
                </label>

                <IField label="Access Token">
                  <Input type="password" value={form.integrations.metaCapiToken ?? ""} onChange={(e) => patch("integrations", { metaCapiToken: e.target.value })} placeholder="••••••••••••••••" />
                </IField>
                <p className="-mt-2 text-xs text-muted-foreground">
                  Events Manager → Settings → Generate access token. Stored securely server-side; never exposed to the browser.
                </p>

                <IField label="Test Event Code (optional)">
                  <Input value={form.integrations.metaTestEventCode} onChange={(e) => patch("integrations", { metaTestEventCode: e.target.value })} placeholder="TEST12345" />
                </IField>
                <p className="-mt-2 text-xs text-muted-foreground">
                  For Events Manager → Test Events. Leave empty in production.
                </p>
              </div>
            </>}

            {active === "features" && <div className="grid gap-3 sm:grid-cols-2">
              {(["jobs", "questionBanks", "events", "webinars", "blog", "store"] as const).map((k) => (
                <Toggle key={k} label={k === "questionBanks" ? "Question Banks" : k.charAt(0).toUpperCase() + k.slice(1)} checked={form.features[k]} onChange={(v) => patch("features", { [k]: v } as Partial<SiteSettings["features"]>)} />
              ))}
            </div>}

            {active === "maintenance" && <>
              <Toggle label="Enable maintenance mode" hint="Takes the public site offline" checked={form.maintenance.enabled} onChange={(v) => patch("maintenance", { enabled: v })} />
              <F label="Maintenance message"><Textarea rows={3} value={form.maintenance.message} onChange={(e) => patch("maintenance", { message: e.target.value })} /></F>
            </>}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function PanelHeader({ icon: Icon, title, subtitle }: { icon: React.ElementType; title: string; subtitle: string }) {
  return (
    <div className="flex items-center gap-3 border-b border-border/60 pb-4">
      <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
        <Icon className="size-5" />
      </span>
      <div>
        <p className="font-semibold leading-tight">{title}</p>
        <p className="text-xs text-muted-foreground">{subtitle}</p>
      </div>
    </div>
  );
}

/** Small muted-label field (used across most tabs). */
function F({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="space-y-1.5"><Label className="text-xs font-medium text-muted-foreground">{label}</Label>{children}</div>;
}
/** Integrations field — darker, form-style label to match the tracking-ID layout. */
function IField({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="space-y-1.5"><Label className="text-sm font-medium text-foreground">{label}</Label>{children}</div>;
}
function Toggle({ label, hint, checked, onChange }: { label: string; hint?: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center justify-between rounded-lg border border-border/70 px-3 py-2.5">
      <span><span className="block text-sm font-medium">{label}</span>{hint && <span className="block text-xs text-muted-foreground">{hint}</span>}</span>
      <Switch checked={checked} onCheckedChange={onChange} />
    </label>
  );
}
function ColorInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex gap-2">
      <input type="color" value={value || "#000000"} onChange={(e) => onChange(e.target.value)} className="h-9 w-12 shrink-0 cursor-pointer rounded-md border border-border bg-background" />
      <Input value={value} onChange={(e) => onChange(e.target.value)} className="font-mono" />
    </div>
  );
}
function ThemePreview({ theme }: { theme: SsTheme }) {
  const radiusPx: Record<string, string> = { square: "2px", modern: "6px", soft: "10px", round: "16px" };
  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold text-muted-foreground">Live preview</p>
      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-border/60 p-4">
        <span className="rounded-md px-4 py-2 text-sm font-medium text-white" style={{ background: theme.primaryColor, borderRadius: radiusPx[theme.radius] ?? "10px" }}>Primary</span>
        <span className="rounded-md px-4 py-2 text-sm font-medium text-black" style={{ background: theme.accentColor, borderRadius: radiusPx[theme.radius] ?? "10px" }}>Accent</span>
        <span className="text-xs text-muted-foreground">Mode: {theme.mode} · toggle {theme.allowUserToggle ? "on" : "off"}</span>
      </div>
    </div>
  );
}
