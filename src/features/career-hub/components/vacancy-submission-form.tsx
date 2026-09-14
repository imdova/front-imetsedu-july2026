"use client";

import * as React from "react";
import { CheckCircle2, Loader2, Send } from "lucide-react";
import { toast } from "sonner";

import { dal } from "@/lib/dal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CAREER_COUNTRIES, EMPLOYMENT_TYPES, pick } from "@/features/career-hub/lib/career-taxonomy";

const DIAL: Record<string, string> = { EG: "+20", SA: "+966", AE: "+971", KW: "+965", QA: "+974", OM: "+968", BH: "+973" };
const PHONE = /^\+[1-9]\d{6,14}$/;
const DESCRIPTION_MIN = 30;

/** Mirrors the server DTO so the employer hears about a problem before sending. */
export function VacancySubmissionForm({ locale }: { locale: string }) {
  const ar = locale === "ar";
  const tr = (en: string, arText: string) => (ar ? arText : en);

  const [f, setF] = React.useState({
    companyName: "",
    contactName: "",
    email: "",
    phone: DIAL.SA,
    country: "SA",
    city: "",
    jobTitle: "",
    employmentType: "full_time",
    description: "",
    applyUrl: "",
    website: "",
  });
  const [sending, setSending] = React.useState(false);
  const [sent, setSent] = React.useState(false);

  const set = (key: keyof typeof f, value: string) => setF((s) => ({ ...s, [key]: value }));

  const changeCountry = (country: string) =>
    setF((s) => ({
      ...s,
      country,
      // Swap the dial code only while the number is still just a dial code.
      phone: Object.values(DIAL).includes(s.phone.trim()) || !s.phone.trim() ? DIAL[country] : s.phone,
    }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const phone = f.phone.replace(/[\s-]/g, "");
    if (!PHONE.test(phone)) {
      toast.error(tr("Enter the phone number with its country code, e.g. +966500000000", "أدخل رقم الهاتف مع رمز الدولة، مثل ‎+966500000000"));
      return;
    }
    if (f.description.trim().length < DESCRIPTION_MIN) {
      toast.error(tr("Please describe the role in a few sentences.", "يُرجى وصف الوظيفة في بضع جمل."));
      return;
    }
    setSending(true);
    const res = await dal.careerHub.submitVacancy({ ...f, phone, applyUrl: f.applyUrl.trim() });
    setSending(false);
    if (!res.ok) {
      toast.error(res.error);
      return;
    }
    setSent(true);
  };

  if (sent) {
    return (
      <div className="rounded-3xl border border-border/70 bg-card p-8 text-center shadow-xl">
        <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-emerald-100 dark:bg-emerald-950/40">
          <CheckCircle2 className="size-7 text-emerald-600" />
        </span>
        <h2 className="mt-5 font-heading text-2xl font-bold">{tr("Thanks — we've received it", "شكرًا — استلمنا طلبك")}</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          {tr(
            "Our team will verify the role and contact you before it goes live. Once listed, it's matched to IMETS graduates with the right profession and training.",
            "سيتحقق فريقنا من الوظيفة ويتواصل معك قبل نشرها. بعد النشر تُطابَق مع خريجي IMETS أصحاب المهنة والتدريب المناسبين.",
          )}
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-4 rounded-3xl border border-border/70 bg-card p-6 shadow-xl sm:p-7">
      <div>
        <h2 className="font-heading text-xl font-bold">{tr("Share a vacancy", "أرسل وظيفة شاغرة")}</h2>
        <p className="mt-1 text-xs text-muted-foreground">{tr("Free for employers. Takes about two minutes.", "مجاني لجهات العمل. يستغرق نحو دقيقتين.")}</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <Field label={tr("Organisation", "جهة العمل")}>
          <Input required maxLength={160} value={f.companyName} onChange={(e) => set("companyName", e.target.value)} />
        </Field>
        <Field label={tr("Your name", "اسمك")}>
          <Input required maxLength={120} value={f.contactName} onChange={(e) => set("contactName", e.target.value)} />
        </Field>
        <Field label={tr("Work email", "البريد الإلكتروني للعمل")}>
          <Input required type="email" maxLength={160} dir="ltr" value={f.email} onChange={(e) => set("email", e.target.value)} />
        </Field>
        <Field label={tr("Phone / WhatsApp", "الهاتف / واتساب")}>
          <Input required type="tel" dir="ltr" maxLength={20} value={f.phone} onChange={(e) => set("phone", e.target.value)} />
        </Field>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <Field label={tr("Job title", "المسمى الوظيفي")}>
          <Input required maxLength={160} value={f.jobTitle} onChange={(e) => set("jobTitle", e.target.value)} />
        </Field>
        <Field label={tr("Employment type", "نوع الوظيفة")}>
          <Select value={f.employmentType} onValueChange={(v) => set("employmentType", v)}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {EMPLOYMENT_TYPES.map((t) => (
                <SelectItem key={t.value} value={t.value}>
                  {pick(t, locale)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <Field label={tr("Country", "الدولة")}>
          <Select value={f.country} onValueChange={changeCountry}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CAREER_COUNTRIES.map((c) => (
                <SelectItem key={c.value} value={c.value}>
                  {c.flag} {pick(c, locale)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <Field label={tr("City", "المدينة")}>
          <Input maxLength={80} value={f.city} onChange={(e) => set("city", e.target.value)} />
        </Field>
      </div>

      <Field label={tr("About the role", "عن الوظيفة")} hint={tr("Duties, requirements, experience", "المهام والمتطلبات والخبرة")}>
        <Textarea required rows={5} maxLength={5000} value={f.description} onChange={(e) => set("description", e.target.value)} />
      </Field>

      <Field label={tr("Application link (optional)", "رابط التقديم (اختياري)")}>
        <Input type="url" dir="ltr" maxLength={600} placeholder="https://" value={f.applyUrl} onChange={(e) => set("applyUrl", e.target.value)} />
      </Field>

      {/* Honeypot: hidden from people, filled by bots. */}
      <div aria-hidden="true" className="absolute -start-[9999px] h-0 w-0 overflow-hidden">
        <label>
          Website
          <input tabIndex={-1} autoComplete="off" value={f.website} onChange={(e) => set("website", e.target.value)} />
        </label>
      </div>

      <Button type="submit" size="lg" className="w-full gap-2" disabled={sending}>
        {sending ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4 rtl:-scale-x-100" />}
        {tr("Submit for review", "أرسل للمراجعة")}
      </Button>
      <p className="text-center text-[11px] text-muted-foreground">
        {tr(
          "We verify every role before listing it. Your contact details are never shown publicly.",
          "نتحقق من كل وظيفة قبل نشرها. لا تُعرض بيانات التواصل الخاصة بك للعامة.",
        )}
      </p>
    </form>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-1.5">
      <span className="flex items-baseline justify-between gap-2">
        <span className="text-xs font-semibold">{label}</span>
        {hint && <span className="text-[11px] text-muted-foreground">{hint}</span>}
      </span>
      {children}
    </label>
  );
}
