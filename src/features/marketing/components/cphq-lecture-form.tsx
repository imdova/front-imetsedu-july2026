"use client";

import * as React from "react";
import { CheckCircle2, Loader2, ShieldCheck, User, Phone, Mail } from "lucide-react";
import { toast } from "sonner";

import { dal } from "@/lib/dal";
import { fbLeadContext, fireBrowserLead } from "@/lib/meta-events";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const digits = (s: string) => s.replace(/\D/g, "");

/** Minimal registration for the CPHQ free-lecture page: name + email + WhatsApp. */
export function CphqLectureForm({ path, courseName }: { path: string; courseName: string }) {
  const [form, setForm] = React.useState({ name: "", email: "", whatsapp: "" });
  const [submitting, setSubmitting] = React.useState(false);
  const [done, setDone] = React.useState(false);

  React.useEffect(() => { dal.landing.trackLanding(path, "view").catch(() => {}); }, [path]);
  const set = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const valid = form.name.trim().length > 1 && EMAIL_RE.test(form.email.trim()) && digits(form.whatsapp).length >= 8;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!valid) { toast.error("اكمل بياناتك بشكل صحيح"); return; }
    setSubmitting(true);
    const fb = fbLeadContext();
    const res = await dal.landing.captureLead({
      name: form.name.trim(),
      email: form.email.trim(),
      whatsapp: `+20${digits(form.whatsapp)}`,
      interest: courseName,
      region: "Egypt",
      path,
      ...fb,
    });
    setSubmitting(false);
    if (res.ok) { setDone(true); fireBrowserLead(fb.eventId, { content_name: courseName }); dal.landing.trackLanding(path, "click").catch(() => {}); }
    else toast.error(res.error);
  };

  if (done) {
    return (
      <div className="rounded-xl bg-emerald-50 p-6 text-center" dir="rtl">
        <div className="mx-auto mb-3 grid size-12 place-items-center rounded-full bg-emerald-100 text-emerald-600">
          <CheckCircle2 className="size-7" />
        </div>
        <h3 className="text-lg font-bold text-emerald-800">تم حجز مقعدك! 🎉</h3>
        <p className="mt-1 text-sm text-emerald-700">هنبعتلك رابط الحضور على الإيميل والواتساب، مع تذكير قبل المحاضرة.</p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} dir="rtl" className="space-y-3.5">
      <Field label="الاسم" icon={User}>
        <Input value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="اسمك بالكامل" />
      </Field>
      <Field label="البريد الإلكتروني" icon={Mail}>
        <Input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="name@email.com" dir="ltr" className="text-left" />
      </Field>
      <Field label="رقم الواتساب" icon={Phone}>
        <div className="flex items-center gap-2">
          <span className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-md border border-input bg-muted px-2.5 text-sm">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="https://flagcdn.com/24x18/eg.png" alt="EG" width={20} height={15} className="rounded-[2px]" /> +20
          </span>
          <Input type="tel" inputMode="numeric" value={form.whatsapp} onChange={(e) => set("whatsapp", e.target.value)} placeholder="10xxxxxxxx" className="text-left" dir="ltr" />
        </div>
      </Field>
      <Button type="submit" size="lg" className="w-full gap-2" disabled={submitting || !valid}>
        {submitting ? <><Loader2 className="size-4 animate-spin" /> جارٍ الحجز…</> : "احجز مقعدي المجاني الآن"}
      </Button>
      <p className="flex items-center justify-center gap-1.5 text-center text-[11px] text-muted-foreground">
        <ShieldCheck className="size-3.5 text-primary" /> بياناتك آمنة — لن نشاركها مع أي جهة.
      </p>
    </form>
  );
}

function Field({ label, icon: Icon, children }: { label: string; icon: React.ElementType; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
        <Icon className="size-3.5 text-primary" /> {label}
      </Label>
      {children}
    </div>
  );
}
