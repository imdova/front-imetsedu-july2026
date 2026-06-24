"use client";

import * as React from "react";
import { CheckCircle2, Loader2, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

import { dal } from "@/lib/dal";
import { fbLeadContext, fireBrowserLead } from "@/lib/meta-events";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const COUNTRY_CODES = [
  { code: "+20", label: "🇪🇬 +20" },
  { code: "+966", label: "🇸🇦 +966" },
  { code: "+971", label: "🇦🇪 +971" },
  { code: "+965", label: "🇰🇼 +965" },
  { code: "+974", label: "🇶🇦 +974" },
  { code: "+973", label: "🇧🇭 +973" },
  { code: "+968", label: "🇴🇲 +968" },
  { code: "+962", label: "🇯🇴 +962" },
  { code: "+1", label: "🇺🇸 +1" },
  { code: "+44", label: "🇬🇧 +44" },
  { code: "+91", label: "🇮🇳 +91" },
];

const SPECIALITIES = ["Doctors", "Dentist", "Pharmacist", "Nurse", "Others"];

/**
 * Minimal English lead-capture form: Name, Email, WhatsApp (with country code)
 * and Speciality. Captures the lead via the public funnel, tracks the landing
 * view on mount + a conversion on submit, and fires the browser-side Meta Lead
 * event (deduped against the server CAPI event by shared eventId).
 */
export function SimpleLeadForm({ path, courseName }: { path: string; courseName: string }) {
  const [form, setForm] = React.useState({ name: "", email: "", code: "+20", whatsapp: "", speciality: "" });
  const [submitting, setSubmitting] = React.useState(false);
  const [done, setDone] = React.useState(false);

  React.useEffect(() => { dal.landing.trackLanding(path, "view").catch(() => {}); }, [path]);

  const set = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim()) return;
    setSubmitting(true);
    const whatsapp = form.whatsapp.trim() ? `${form.code} ${form.whatsapp.trim()}` : "";
    const fb = fbLeadContext();
    const res = await dal.landing.captureLead({
      name: form.name, email: form.email, whatsapp,
      profession: form.speciality, interest: courseName, path, ...fb,
    });
    setSubmitting(false);
    if (res.ok) {
      setDone(true);
      dal.landing.trackLanding(path, "click").catch(() => {});
      fireBrowserLead(fb.eventId, { content_name: courseName });
    } else {
      toast.error(res.error);
    }
  };

  if (done) {
    return (
      <Card className="border-success/30 bg-success/5">
        <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
          <CheckCircle2 className="size-12 text-success" />
          <h3 className="text-xl font-semibold">Thanks, {form.name.split(" ")[0]}!</h3>
          <p className="max-w-sm text-sm text-muted-foreground">
            An admissions advisor will reach out{form.whatsapp ? " on WhatsApp" : " by email"} within 24 hours to confirm your seat.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-lg shadow-primary/5">
      <CardContent className="py-6">
        <form onSubmit={submit} className="grid gap-4" dir="ltr">
          <Field label="Full name" required>
            <Input value={form.name} onChange={(e) => set("name", e.target.value)} required placeholder="Dr. Sara Hassan" />
          </Field>
          <Field label="Email" required>
            <Input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} required placeholder="you@email.com" />
          </Field>
          <Field label="WhatsApp">
            <div className="flex gap-2">
              <Select value={form.code} onValueChange={(v) => set("code", v)}>
                <SelectTrigger className="w-28 shrink-0"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {COUNTRY_CODES.map((c) => <SelectItem key={c.code} value={c.code}>{c.label}</SelectItem>)}
                </SelectContent>
              </Select>
              <Input
                className="flex-1"
                inputMode="tel"
                value={form.whatsapp}
                onChange={(e) => set("whatsapp", e.target.value)}
                placeholder="10 1234 5678"
              />
            </div>
          </Field>
          <Field label="Speciality">
            <Select value={form.speciality} onValueChange={(v) => set("speciality", v)}>
              <SelectTrigger><SelectValue placeholder="Select your speciality" /></SelectTrigger>
              <SelectContent>
                {SPECIALITIES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
          </Field>
          <Button type="submit" size="lg" className="mt-1 w-full gap-1.5" disabled={submitting || !form.name.trim() || !form.email.trim()}>
            {submitting && <Loader2 className="size-4 animate-spin" />}
            {submitting ? "Submitting…" : "Book my seat — it's free"}
          </Button>
          <p className="flex items-center justify-center gap-1.5 text-center text-xs text-muted-foreground">
            <ShieldCheck className="size-3.5" /> No payment required. We'll never share your details.
          </p>
        </form>
      </CardContent>
    </Card>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium text-muted-foreground">{label}{required && <span className="text-destructive"> *</span>}</Label>
      {children}
    </div>
  );
}
