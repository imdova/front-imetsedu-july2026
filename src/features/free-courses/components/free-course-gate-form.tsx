"use client";

import * as React from "react";
import { Loader2, ArrowRight } from "lucide-react";

import { dal } from "@/lib/dal";
import { fbLeadContext, fireBrowserLead } from "@/lib/meta-events";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FREE_ACCESS_KEY } from "./free-course-gate";

type Lang = "en" | "ar";

const DICT: Record<Lang, {
  name: string; email: string; whatsapp: string; profession: string;
  namePh: string; emailPh: string; waPh: string; professionPh: string;
  submit: string; submitting: string; required: string; failed: string; privacy: string;
}> = {
  en: {
    name: "Full name", email: "Email", whatsapp: "WhatsApp (optional)", profession: "Profession (optional)",
    namePh: "Dr. Sara Hassan", emailPh: "you@email.com", waPh: "+20 1XX XXX XXXX", professionPh: "Nurse, physician, administrator…",
    submit: "Unlock free lectures", submitting: "Unlocking…",
    required: "Please enter your name and a valid email.",
    failed: "Something went wrong. Please try again.",
    privacy: "We'll only use this to send you free healthcare training. No spam.",
  },
  ar: {
    name: "الاسم الكامل", email: "البريد الإلكتروني", whatsapp: "واتساب (اختياري)", profession: "التخصص (اختياري)",
    namePh: "د. سارة حسن", emailPh: "you@email.com", waPh: "+20 1XX XXX XXXX", professionPh: "ممرض، طبيب، إداري…",
    submit: "افتح المحاضرات المجانية", submitting: "جارٍ الفتح…",
    required: "من فضلك أدخل اسمك وبريدًا إلكترونيًا صحيحًا.",
    failed: "حدث خطأ ما. يرجى المحاولة مرة أخرى.",
    privacy: "نستخدم بياناتك فقط لإرسال تدريب مجاني في الرعاية الصحية. بدون رسائل مزعجة.",
  },
};

/**
 * Lead gate for the free mini-LMS.
 *
 * Reuses the existing public lead pipeline (`/free-exam/leads` + Meta CAPI) so
 * these land in the same admin inbox — segmented by `path`, since the backend
 * hardcodes `source: 'free-exam'` and rejects unknown fields.
 */
export function FreeCourseGateForm({
  locale,
  programTitle,
  slug,
  onUnlocked,
}: {
  locale: string;
  programTitle: string;
  slug: string;
  onUnlocked: () => void;
}) {
  const t = DICT[locale === "ar" ? "ar" : "en"];
  const [form, setForm] = React.useState({ name: "", email: "", whatsapp: "", profession: "" });
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState("");

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const emailOk = /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !emailOk) { setError(t.required); return; }
    setError("");
    setBusy(true);

    const fb = fbLeadContext();
    const res = await dal.landing.captureLead({
      name: form.name.trim(),
      email: form.email.trim(),
      whatsapp: form.whatsapp.trim() || undefined,
      profession: form.profession.trim() || undefined,
      interest: programTitle,
      path: `/free-courses/${slug}`,
      ...fb,
    });
    setBusy(false);

    if (!res.ok) { setError(t.failed); return; }
    fireBrowserLead(fb.eventId, { content_name: programTitle });

    // Unlock even if storage is unavailable (private mode) — the lead is
    // captured either way, and blocking access would punish the user for it.
    try {
      window.localStorage.setItem(
        FREE_ACCESS_KEY,
        JSON.stringify({ name: form.name.trim(), email: form.email.trim(), at: new Date().toISOString() }),
      );
    } catch { /* ignore */ }
    onUnlocked();
  };

  return (
    <form onSubmit={submit} className="space-y-3">
      <div className="space-y-1.5">
        <Label htmlFor="fc-name">{t.name} <span className="text-destructive">*</span></Label>
        <Input id="fc-name" value={form.name} onChange={set("name")} placeholder={t.namePh} autoComplete="name" required />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="fc-email">{t.email} <span className="text-destructive">*</span></Label>
        <Input id="fc-email" type="email" value={form.email} onChange={set("email")} placeholder={t.emailPh} autoComplete="email" required />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="fc-wa">{t.whatsapp}</Label>
          <Input id="fc-wa" value={form.whatsapp} onChange={set("whatsapp")} placeholder={t.waPh} inputMode="tel" autoComplete="tel" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="fc-prof">{t.profession}</Label>
          <Input id="fc-prof" value={form.profession} onChange={set("profession")} placeholder={t.professionPh} />
        </div>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Button type="submit" size="lg" className="w-full gap-1.5" disabled={busy}>
        {busy ? <><Loader2 className="size-4 animate-spin" /> {t.submitting}</> : <>{t.submit} <ArrowRight className="size-4 rtl:rotate-180" /></>}
      </Button>
      <p className="text-center text-[11px] text-muted-foreground">{t.privacy}</p>
    </form>
  );
}
