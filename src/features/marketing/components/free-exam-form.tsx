"use client";

import * as React from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { dal } from "@/lib/dal";
import { fbLeadContext, fireBrowserLead } from "@/lib/meta-events";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";

const PATH = "/free-exam";

export function FreeExamForm() {
  const [form, setForm] = React.useState({
    name: "", email: "", whatsapp: "", profession: "", interest: "", region: "",
  });
  const [submitting, setSubmitting] = React.useState(false);
  const [done, setDone] = React.useState(false);

  // Best-effort page-view tracking (matches a registered landing page by path).
  React.useEffect(() => {
    dal.landing.trackLanding(PATH, "view").catch(() => {});
  }, []);

  const set = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim()) return;
    setSubmitting(true);
    const fb = fbLeadContext();
    const res = await dal.landing.captureLead({ ...form, path: PATH, ...fb });
    setSubmitting(false);
    if (res.ok) {
      setDone(true);
      dal.landing.trackLanding(PATH, "click").catch(() => {});
      fireBrowserLead(fb.eventId, { content_name: form.interest || "Free exam" });
    } else {
      toast.error(res.error);
    }
  };

  if (done) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
          <CheckCircle2 className="size-12 text-success" />
          <h3 className="text-xl font-semibold">You&apos;re registered!</h3>
          <p className="max-w-sm text-sm text-muted-foreground">
            Thanks {form.name.split(" ")[0]} — our team will email you the free exam details shortly.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="py-6">
        <form onSubmit={submit} className="grid gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Full name" required><Input value={form.name} onChange={(e) => set("name", e.target.value)} required /></Field>
            <Field label="Email" required><Input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} required /></Field>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="WhatsApp"><Input value={form.whatsapp} onChange={(e) => set("whatsapp", e.target.value)} placeholder="+20…" /></Field>
            <Field label="Profession"><Input value={form.profession} onChange={(e) => set("profession", e.target.value)} /></Field>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Interested in"><Input value={form.interest} onChange={(e) => set("interest", e.target.value)} placeholder="e.g. PMP, Finance…" /></Field>
            <Field label="Region / City"><Input value={form.region} onChange={(e) => set("region", e.target.value)} /></Field>
          </div>
          <Button type="submit" className="mt-1 w-full gap-1.5" disabled={submitting || !form.name.trim() || !form.email.trim()}>
            {submitting && <Loader2 className="size-4 animate-spin" />}
            {submitting ? "Submitting…" : "Get my free exam"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium text-muted-foreground">
        {label}{required && <span className="text-destructive"> *</span>}
      </Label>
      {children}
    </div>
  );
}
