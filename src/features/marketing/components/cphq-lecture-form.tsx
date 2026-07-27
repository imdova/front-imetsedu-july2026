"use client";

import * as React from "react";
import { Loader2, ShieldCheck, User, Phone, Mail } from "lucide-react";
import { toast } from "sonner";

import { dal } from "@/lib/dal";
import { useRouter } from "@/i18n/navigation";
import { fbLeadContext, fireBrowserLead } from "@/lib/meta-events";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const digits = (s: string) => s.replace(/\D/g, "");

/** Arab-country dialing codes (code + flag). */
const COUNTRIES = [
  { code: "+20", iso: "eg", name: "مصر" },
  { code: "+966", iso: "sa", name: "السعودية" },
  { code: "+971", iso: "ae", name: "الإمارات" },
  { code: "+965", iso: "kw", name: "الكويت" },
  { code: "+974", iso: "qa", name: "قطر" },
  { code: "+973", iso: "bh", name: "البحرين" },
  { code: "+968", iso: "om", name: "عُمان" },
  { code: "+962", iso: "jo", name: "الأردن" },
  { code: "+961", iso: "lb", name: "لبنان" },
  { code: "+964", iso: "iq", name: "العراق" },
  { code: "+970", iso: "ps", name: "فلسطين" },
  { code: "+963", iso: "sy", name: "سوريا" },
  { code: "+967", iso: "ye", name: "اليمن" },
  { code: "+249", iso: "sd", name: "السودان" },
  { code: "+218", iso: "ly", name: "ليبيا" },
  { code: "+216", iso: "tn", name: "تونس" },
  { code: "+213", iso: "dz", name: "الجزائر" },
  { code: "+212", iso: "ma", name: "المغرب" },
];

/**
 * Minimal registration for the CPHQ free-lecture page (name + email + WhatsApp).
 * On success it stashes the lead in sessionStorage and routes to the full
 * thank-you page (celebration → qualification wizard → WhatsApp).
 */
export function CphqLectureForm({
  path, courseName, thankYouPath = "/lp/free-lecture-cphq/thank-you",
}: {
  path: string; courseName: string; whatsappNumber?: string; thankYouPath?: string;
}) {
  const router = useRouter();
  const [form, setForm] = React.useState({ name: "", email: "", code: "+20", whatsapp: "" });
  const [submitting, setSubmitting] = React.useState(false);

  React.useEffect(() => { dal.landing.trackLanding(path, "view").catch(() => {}); }, [path]);
  const set = (k: "name" | "email" | "code" | "whatsapp", v: string) => setForm((f) => ({ ...f, [k]: v }));
  const fullPhone = () => `${form.code}${digits(form.whatsapp)}`;
  const valid = form.name.trim().length > 1 && EMAIL_RE.test(form.email.trim()) && digits(form.whatsapp).length >= 8;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!valid) { toast.error("اكمل بياناتك بشكل صحيح"); return; }
    setSubmitting(true);
    const fb = fbLeadContext();
    const lead = { name: form.name.trim(), email: form.email.trim(), whatsapp: fullPhone() };
    const res = await dal.landing.captureLead({ ...lead, interest: courseName, region: "Egypt", path, ...fb });
    if (res.ok) {
      fireBrowserLead(fb.eventId, { content_name: courseName });
      dal.landing.trackLanding(path, "click").catch(() => {});
      try { sessionStorage.setItem("imets_cphq_lead", JSON.stringify({ ...lead, path, courseName })); } catch { /* ignore */ }
      router.push(thankYouPath);
      return; // keep the button disabled through the navigation
    }
    setSubmitting(false);
    toast.error(res.error);
  };

  const selIso = COUNTRIES.find((c) => c.code === form.code)?.iso ?? "eg";
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
          <Select value={form.code} onValueChange={(v) => set("code", v)}>
            <SelectTrigger className="w-[104px] shrink-0">
              <span className="flex items-center gap-1.5"><Flag iso={selIso} /> {form.code}</span>
            </SelectTrigger>
            <SelectContent className="max-h-64">
              {COUNTRIES.map((c) => (
                <SelectItem key={c.code} value={c.code}>
                  <span className="flex items-center gap-2"><Flag iso={c.iso} /> {c.name} <span className="text-muted-foreground">{c.code}</span></span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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

function Flag({ iso }: { iso: string }) {
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={`https://flagcdn.com/24x18/${iso}.png`} alt={iso} width={20} height={15} className="rounded-[2px]" />;
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
