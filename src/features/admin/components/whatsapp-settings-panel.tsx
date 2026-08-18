"use client";

import * as React from "react";
import { toast } from "sonner";
import { BadgeCheck, Camera, Gauge, Loader2, Pencil, Phone, RefreshCw, Save, ShieldCheck, User } from "lucide-react";

import { dal } from "@/lib/dal";
import type { WaAccountSettings } from "@/lib/dal/whatsapp";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DetailRow } from "@/features/admin/components/whatsapp-shared";

const VERTICALS = [
  { value: "EDU", label: "Education" },
  { value: "HEALTH", label: "Medical & Health" },
  { value: "PROF_SERVICES", label: "Professional Services" },
  { value: "NONPROFIT", label: "Non-profit" },
  { value: "FINANCE", label: "Finance" },
  { value: "RETAIL", label: "Retail" },
  { value: "TRAVEL", label: "Travel" },
  { value: "ENTERTAIN", label: "Entertainment" },
  { value: "OTHER", label: "Other" },
];

function QualityBadge({ rating }: { rating?: string }) {
  const r = (rating || "").toUpperCase();
  if (r === "GREEN") return <Badge className="bg-success/12 text-success hover:bg-success/15">🟢 High</Badge>;
  if (r === "YELLOW") return <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 dark:bg-amber-900/40 dark:text-amber-300">🟡 Medium</Badge>;
  if (r === "RED") return <Badge variant="destructive">🔴 Low</Badge>;
  return <Badge variant="secondary">{rating || "Unknown"}</Badge>;
}

function NameStatusBadge({ status }: { status?: string }) {
  const s = (status || "").toUpperCase();
  if (s === "APPROVED" || s === "AVAILABLE_WITHOUT_REVIEW") return <Badge className="bg-success/12 text-success hover:bg-success/15">Approved</Badge>;
  if (s === "PENDING_REVIEW") return <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 dark:bg-amber-900/40 dark:text-amber-300">Pending review</Badge>;
  if (s === "DECLINED" || s === "EXPIRED") return <Badge variant="destructive">{s === "DECLINED" ? "Declined" : "Expired"}</Badge>;
  return <Badge variant="secondary">{status || "—"}</Badge>;
}

/** WhatsApp account settings: profile picture, display name, business profile, health. */
export function WhatsappSettingsPanel() {
  const [settings, setSettings] = React.useState<WaAccountSettings | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [uploadingPic, setUploadingPic] = React.useState(false);
  const [requestingName, setRequestingName] = React.useState(false);
  const picRef = React.useRef<HTMLInputElement>(null);

  const [about, setAbout] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [website, setWebsite] = React.useState("");
  const [vertical, setVertical] = React.useState("EDU");
  const [newName, setNewName] = React.useState("");

  const load = React.useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    const r = await dal.whatsapp.fetchAccountSettings();
    setLoading(false);
    if (!r.ok) { toast.error(r.error); return; }
    setSettings(r.data);
    const p = r.data.profile;
    setAbout(p.about ?? "");
    setDescription(p.description ?? "");
    setEmail(p.email ?? "");
    setWebsite(p.websites?.[0] ?? "");
    setVertical(p.vertical || "EDU");
  }, []);
  React.useEffect(() => {
    const t = setTimeout(() => { void load(); }, 0);
    return () => clearTimeout(t);
  }, [load]);

  const saveProfile = async () => {
    setSaving(true);
    const r = await dal.whatsapp.updateAccountProfile({ about, description, email, website, vertical });
    setSaving(false);
    if (!r.ok) { toast.error(r.error); return; }
    toast.success("Business profile updated");
    void load(true);
  };

  const onPickPicture = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; e.target.value = "";
    if (!f) return;
    if (!f.type.startsWith("image/")) { toast.error("Pick an image file (JPG or PNG)"); return; }
    if (f.size > 5 * 1024 * 1024) { toast.error("Image too large (max 5MB)"); return; }
    setUploadingPic(true);
    const r = await dal.whatsapp.updateProfilePicture(f, f.name);
    setUploadingPic(false);
    if (!r.ok) { toast.error(r.error); return; }
    toast.success("Profile picture updated");
    void load(true);
  };

  const submitName = async () => {
    const name = newName.trim();
    if (!name) return;
    setRequestingName(true);
    const r = await dal.whatsapp.requestDisplayName(name);
    setRequestingName(false);
    if (!r.ok) { toast.error(r.error); return; }
    toast.success(`Name change to “${r.data.name}” submitted — Meta reviews it (usually hours)`);
    setNewName("");
    void load(true);
  };

  if (loading) {
    return <div className="grid place-items-center rounded-xl border border-dashed border-border/70 p-16 text-muted-foreground"><Loader2 className="size-6 animate-spin" /></div>;
  }
  if (!settings) {
    return <p className="rounded-xl border border-dashed border-border/70 p-10 text-center text-sm text-muted-foreground">Could not load account settings.</p>;
  }

  const { profile, phone, waba } = settings;

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
      <div className="min-w-0 space-y-6">
        {/* Identity: picture + display name */}
        <Card>
          <CardContent className="space-y-5 pt-5">
          <div className="flex items-center gap-2"><User className="size-4 text-primary" /><p className="font-semibold">Account identity</p></div>

            <input ref={picRef} type="file" accept="image/png,image/jpeg" className="hidden" onChange={onPickPicture} />
            <div className="flex items-center gap-4">
              {profile.profile_picture_url ? (
                // eslint-disable-next-line @next/next/no-img-element -- Meta-hosted profile picture
                <img src={profile.profile_picture_url} alt="Profile" className="size-20 rounded-full border border-border/70 object-cover" />
              ) : (
                <div className="grid size-20 place-items-center rounded-full border border-dashed border-border/70 bg-muted/40 text-muted-foreground"><Camera className="size-7" /></div>
              )}
              <div className="space-y-1.5">
                <Button variant="outline" size="sm" className="gap-1.5" onClick={() => picRef.current?.click()} disabled={uploadingPic}>
                  {uploadingPic ? <Loader2 className="size-4 animate-spin" /> : <Camera className="size-4" />} {profile.profile_picture_url ? "Change picture" : "Upload picture"}
                </Button>
                <p className="text-[11px] text-muted-foreground">Square JPG/PNG, ideally 640×640, max 5MB. Shown as a circle to customers.</p>
              </div>
            </div>

            <div className="space-y-2 border-t border-border/60 pt-4">
              <div className="flex flex-wrap items-center gap-2">
                <Label className="me-1">Display name</Label>
                <span className="font-medium">{phone.verified_name || "—"}</span>
                <NameStatusBadge status={phone.name_status} />
              </div>
              <div className="flex flex-col gap-2 sm:flex-row">
                <Input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="New display name — e.g. IMETS" className="sm:flex-1" onKeyDown={(e) => e.key === "Enter" && submitName()} />
                <Button className="gap-1.5" onClick={submitName} disabled={requestingName || !newName.trim()}>
                  {requestingName ? <Loader2 className="size-4 animate-spin" /> : <Pencil className="size-4" />} Request change
                </Button>
              </div>
              <p className="text-[11px] text-muted-foreground">Reviewed by Meta (usually hours). The name should match your verified business — generic or personal names get declined.</p>
            </div>
          </CardContent>
        </Card>

        {/* Business profile */}
        <Card>
          <CardContent className="space-y-4 pt-5">
            <div className="flex items-center gap-2"><Pencil className="size-4 text-primary" /><p className="font-semibold">Business profile</p></div>
            <div className="space-y-1.5">
              <Label>About <span className="font-normal text-muted-foreground">(shown under the name — {139 - about.length} left)</span></Label>
              <Input value={about} maxLength={139} onChange={(e) => setAbout(e.target.value)} placeholder="IMETS Medical School — Healthcare Management & Quality Training" />
            </div>
            <div className="space-y-1.5">
              <Label>Description</Label>
              <Textarea rows={3} value={description} maxLength={512} onChange={(e) => setDescription(e.target.value)} placeholder="What your business does…" />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5"><Label>Email</Label><Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="hello@imetsedu.com" /></div>
              <div className="space-y-1.5"><Label>Website</Label><Input value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="https://imetsedu.com" /></div>
            </div>
            <div className="space-y-1.5">
              <Label>Category</Label>
              <Select value={vertical} onValueChange={setVertical}>
                <SelectTrigger className="w-56"><SelectValue /></SelectTrigger>
                <SelectContent position="popper">
                  {VERTICALS.map((v) => <SelectItem key={v.value} value={v.value}>{v.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end border-t border-border/60 pt-3">
              <Button className="gap-1.5" onClick={saveProfile} disabled={saving}>
                {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />} Save profile
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Right rail: account health */}
      <div className="space-y-4 lg:sticky lg:top-4 lg:self-start">
        <Card>
          <CardContent className="space-y-2.5 pt-5 text-sm">
            <div className="mb-1 flex items-center justify-between">
              <div className="flex items-center gap-2"><Gauge className="size-4 text-primary" /><p className="font-semibold">Account health</p></div>
              <Button variant="ghost" size="icon" className="size-7" title="Refresh" onClick={() => load(true)}><RefreshCw className="size-3.5" /></Button>
            </div>
            <DetailRow k="Phone" v={<span className="inline-flex items-center gap-1.5"><Phone className="size-3.5 text-muted-foreground" />{phone.display_phone_number || "—"}</span>} />
            <DetailRow k="Quality rating" v={<QualityBadge rating={phone.quality_rating} />} />
            <DetailRow k="Business verification" v={
              (waba.business_verification_status || "").toLowerCase() === "verified"
                ? <Badge className="gap-1 bg-success/12 text-success hover:bg-success/15"><BadgeCheck className="size-3" /> Verified</Badge>
                : <Badge variant="secondary" className="capitalize">{waba.business_verification_status || "—"}</Badge>
            } />
            <DetailRow k="Account review" v={
              (waba.account_review_status || "").toUpperCase() === "APPROVED"
                ? <Badge className="gap-1 bg-success/12 text-success hover:bg-success/15"><ShieldCheck className="size-3" /> Approved</Badge>
                : <Badge variant="secondary" className="capitalize">{waba.account_review_status || "—"}</Badge>
            } />
            <DetailRow k="Throughput" v={<span className="capitalize">{(phone.throughput?.level || "—").toLowerCase()}</span>} />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="space-y-2 pt-5 text-xs text-muted-foreground">
            <p className="text-sm font-medium text-foreground">Daily messaging limit</p>
            <p>Verified businesses start at <span className="font-medium text-foreground">1,000 unique customers / 24h</span>. Meta auto-upgrades (10K → 100K → unlimited) when you consistently message about half your current limit with a green quality rating.</p>
            <p>Replies to customers in the inbox don&apos;t count toward the limit.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
