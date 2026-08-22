"use client";

import * as React from "react";
import { toast } from "sonner";
import { Copy, ExternalLink, Globe, Loader2, Save, ShieldCheck } from "lucide-react";

import { dal } from "@/lib/dal";
import type { PublicProfile } from "@/lib/dal/profiles";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

const ORIGIN = typeof window !== "undefined" ? window.location.origin : "https://imetsedu.com";

/**
 * "Public profile" card on the student profile page — controls what appears at
 * /profile/{username}: username, headline, summary, skills, links, visibility.
 */
export function PublicProfileSettings() {
  const [p, setP] = React.useState<PublicProfile | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [username, setUsername] = React.useState("");
  const [enabled, setEnabled] = React.useState(true);
  const [headline, setHeadline] = React.useState("");
  const [summary, setSummary] = React.useState("");
  const [skills, setSkills] = React.useState("");
  const [linkedin, setLinkedin] = React.useState("");
  const [website, setWebsite] = React.useState("");
  const [showEmail, setShowEmail] = React.useState(false);
  const [showPhone, setShowPhone] = React.useState(false);

  const apply = React.useCallback((d: PublicProfile) => {
    setP(d); setUsername(d.username); setEnabled(d.publicProfileEnabled); setHeadline(d.headline);
    setSummary(d.summary); setSkills(d.skills.join(", ")); setLinkedin(d.links.linkedin); setWebsite(d.links.website);
    setShowEmail(d.showEmail); setShowPhone(d.showPhone);
  }, []);

  React.useEffect(() => {
    const t = setTimeout(async () => {
      const r = await dal.profiles.fetchMyPublicProfile();
      setLoading(false);
      if (r.ok) apply(r.data); else toast.error(r.error);
    }, 0);
    return () => clearTimeout(t);
  }, [apply]);

  const url = `${ORIGIN}/profile/${username || p?.username || ""}`;
  const copy = () => { navigator.clipboard?.writeText(url); toast.success("Public profile link copied"); };

  const save = async () => {
    setSaving(true);
    const r = await dal.profiles.updateMyPublicProfile({
      username: username.trim().toLowerCase(), publicProfileEnabled: enabled, headline: headline.trim(), summary: summary.trim(),
      skills: skills.split(/[,\n]/).map((s) => s.trim()).filter(Boolean), linkedin: linkedin.trim(), website: website.trim(), showEmail, showPhone,
    });
    setSaving(false);
    if (!r.ok) { toast.error(r.error); return; }
    apply(r.data);
    toast.success("Public profile saved");
  };

  if (loading) {
    return <Card><CardContent className="grid place-items-center py-10 text-muted-foreground"><Loader2 className="size-5 animate-spin" /></CardContent></Card>;
  }
  if (!p) return null;

  return (
    <Card>
      <CardContent className="space-y-5 pt-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Globe className="size-4 text-primary" />
              <p className="font-semibold">Public profile</p>
              {p.verified && <Badge className="gap-1 bg-success/12 text-success hover:bg-success/15"><ShieldCheck className="size-3" /> Verified graduate</Badge>}
            </div>
            <p className="mt-1 text-sm text-muted-foreground">A shareable page with your credentials, competencies and learning record — separate from this private platform profile.</p>
          </div>
          <label className="flex items-center gap-2 rounded-lg border border-border/70 px-3 py-2 text-sm">
            <span className="font-medium">{enabled ? "Visible" : "Hidden"}</span>
            <Switch checked={enabled} onCheckedChange={setEnabled} />
          </label>
        </div>

        {/* Link */}
        <div className="flex flex-col gap-2 rounded-xl border border-border/70 bg-muted/30 p-3 sm:flex-row sm:items-center">
          <p className="min-w-0 flex-1 truncate font-mono text-xs">{url}</p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="gap-1.5" onClick={copy}><Copy className="size-3.5" /> Copy</Button>
            <a href={url} target="_blank" rel="noreferrer"><Button variant="outline" size="sm" className="gap-1.5" disabled={!enabled}><ExternalLink className="size-3.5" /> Open</Button></a>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label>Username <span className="font-normal text-muted-foreground">(your URL)</span></Label>
            <Input value={username} onChange={(e) => setUsername(e.target.value.toLowerCase())} placeholder="e.g. marwa-ismail" className="font-mono text-sm" />
            <p className="text-[11px] text-muted-foreground">3–40 characters: lowercase letters, numbers, hyphens.</p>
          </div>
          <div className="space-y-1.5">
            <Label>Headline</Label>
            <Input value={headline} onChange={(e) => setHeadline(e.target.value)} maxLength={120} placeholder="e.g. Dentist · Healthcare Quality Management Diploma" />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label>Summary</Label>
          <Textarea rows={3} value={summary} onChange={(e) => setSummary(e.target.value)} maxLength={1200} placeholder="A short professional bio employers will read first." />
        </div>

        <div className="space-y-1.5">
          <Label>Competencies <span className="font-normal text-muted-foreground">(comma-separated)</span></Label>
          <Textarea rows={2} value={skills} onChange={(e) => setSkills(e.target.value)} placeholder="Quality Management Systems, Patient Safety, Root Cause Analysis, KPIs" />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5"><Label>LinkedIn URL</Label><Input value={linkedin} onChange={(e) => setLinkedin(e.target.value)} placeholder="https://linkedin.com/in/…" /></div>
          <div className="space-y-1.5"><Label>Website</Label><Input value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="https://…" /></div>
        </div>

        <div className="grid gap-2 sm:grid-cols-2">
          <label className="flex items-center justify-between rounded-lg border border-border/70 px-3 py-2 text-sm"><span>Show my email publicly</span><Switch checked={showEmail} onCheckedChange={setShowEmail} /></label>
          <label className="flex items-center justify-between rounded-lg border border-border/70 px-3 py-2 text-sm"><span>Show my phone publicly</span><Switch checked={showPhone} onCheckedChange={setShowPhone} /></label>
        </div>

        <div className="flex items-center justify-between border-t border-border/60 pt-4">
          <p className="text-xs text-muted-foreground">Your photo, name, country and certificates come from your platform profile automatically.</p>
          <Button className="gap-1.5" onClick={save} disabled={saving}>
            {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />} Save public profile
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
