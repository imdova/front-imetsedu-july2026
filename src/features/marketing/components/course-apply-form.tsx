"use client";

import * as React from "react";
import { CheckCircle2, Loader2, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

import { dal } from "@/lib/dal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type Lang = "en" | "ar";

const DICT = {
  en: {
    name: "Full name", email: "Email", whatsapp: "WhatsApp", profession: "Profession",
    license: "Target license", region: "Region / City", select: "Select", licensePh: "Where do you want to work?",
    namePh: "Dr. Sara Hassan", regionPh: "Riyadh, Cairo…", submit: "Apply now — it's free", submitting: "Submitting…",
    note: "No payment required to apply. We'll never share your details.",
    successTitle: "Application received!",
    successBody: (n: string, w: boolean) => `Thanks ${n} — an admissions advisor will reach out${w ? " on WhatsApp" : " by email"} within 24 hours with your personalized licensing roadmap.`,
    professions: ["Nurse", "Doctor / Physician", "Pharmacist", "Dentist", "Lab technologist", "Radiographer", "Physiotherapist", "Other allied health"],
    licenses: [
      { value: "SCFHS", label: "SCFHS — Saudi Arabia" }, { value: "DHA", label: "DHA — Dubai" },
      { value: "DOH", label: "DOH / HAAD — Abu Dhabi" }, { value: "MOH", label: "MOH — UAE" },
      { value: "QCHP", label: "QCHP — Qatar" }, { value: "Not sure", label: "Not sure yet — advise me" },
    ],
  },
  ar: {
    name: "الاسم الكامل", email: "البريد الإلكتروني", whatsapp: "واتساب", profession: "التخصص",
    license: "الرخصة المستهدفة", region: "المدينة / المنطقة", select: "اختر", licensePh: "أين تريد العمل؟",
    namePh: "د. سارة حسن", regionPh: "الرياض، القاهرة…", submit: "قدّم الآن — مجانًا", submitting: "جارٍ الإرسال…",
    note: "لا حاجة للدفع عند التقديم. لن نشارك بياناتك أبدًا.",
    successTitle: "تم استلام طلبك!",
    successBody: (n: string, w: boolean) => `شكرًا ${n} — سيتواصل معك مستشار القبول${w ? " عبر واتساب" : " عبر البريد الإلكتروني"} خلال 24 ساعة بخريطة طريق ترخيص مخصّصة لك.`,
    professions: ["ممرّض/ة", "طبيب/ة", "صيدلي/ة", "طبيب أسنان", "أخصائي مختبر", "أخصائي أشعة", "أخصائي علاج طبيعي", "مهن صحية أخرى"],
    licenses: [
      { value: "SCFHS", label: "SCFHS — السعودية" }, { value: "DHA", label: "DHA — دبي" },
      { value: "DOH", label: "DOH — أبوظبي" }, { value: "MOH", label: "MOH — الإمارات" },
      { value: "QCHP", label: "QCHP — قطر" }, { value: "Not sure", label: "لست متأكدًا — انصحوني" },
    ],
  },
} satisfies Record<Lang, unknown>;

/**
 * Smart apply / lead-capture form for a course landing page. Captures the lead
 * (public funnel), tracks the page view on mount + a conversion on submit, and
 * tailors `interest` from the chosen target license. Bilingual via `lang`.
 */
export function CourseApplyForm({ path, courseName, lang = "en" }: { path: string; courseName: string; lang?: Lang }) {
  const t = DICT[lang];
  const [form, setForm] = React.useState({ name: "", email: "", whatsapp: "", profession: "", license: "", region: "" });
  const [submitting, setSubmitting] = React.useState(false);
  const [done, setDone] = React.useState(false);

  React.useEffect(() => { dal.landing.trackLanding(path, "view").catch(() => {}); }, [path]);

  const set = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim()) return;
    setSubmitting(true);
    const interest = [courseName, form.license].filter(Boolean).join(" — ");
    const res = await dal.landing.captureLead({
      name: form.name, email: form.email, whatsapp: form.whatsapp,
      profession: form.profession, interest, region: form.region, path,
    });
    setSubmitting(false);
    if (res.ok) {
      setDone(true);
      dal.landing.trackLanding(path, "click").catch(() => {});
    } else {
      toast.error(res.error);
    }
  };

  if (done) {
    return (
      <Card className="border-success/30 bg-success/5">
        <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
          <CheckCircle2 className="size-12 text-success" />
          <h3 className="text-xl font-semibold">{t.successTitle}</h3>
          <p className="max-w-sm text-sm text-muted-foreground">{t.successBody(form.name.split(" ")[0], !!form.whatsapp)}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-lg shadow-primary/5">
      <CardContent className="py-6">
        <form onSubmit={submit} className="grid gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={t.name} required><Input value={form.name} onChange={(e) => set("name", e.target.value)} required placeholder={t.namePh} /></Field>
            <Field label={t.email} required><Input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} required placeholder="you@email.com" /></Field>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={t.whatsapp}><Input value={form.whatsapp} onChange={(e) => set("whatsapp", e.target.value)} placeholder="+966 5x xxx xxxx" /></Field>
            <Field label={t.profession}>
              <Select value={form.profession} onValueChange={(v) => set("profession", v)}>
                <SelectTrigger><SelectValue placeholder={t.select} /></SelectTrigger>
                <SelectContent>{t.professions.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
              </Select>
            </Field>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={t.license}>
              <Select value={form.license} onValueChange={(v) => set("license", v)}>
                <SelectTrigger><SelectValue placeholder={t.licensePh} /></SelectTrigger>
                <SelectContent>{t.licenses.map((l) => <SelectItem key={l.value} value={l.value}>{l.label}</SelectItem>)}</SelectContent>
              </Select>
            </Field>
            <Field label={t.region}><Input value={form.region} onChange={(e) => set("region", e.target.value)} placeholder={t.regionPh} /></Field>
          </div>
          <Button type="submit" size="lg" className="mt-1 w-full gap-1.5" disabled={submitting || !form.name.trim() || !form.email.trim()}>
            {submitting && <Loader2 className="size-4 animate-spin" />}
            {submitting ? t.submitting : t.submit}
          </Button>
          <p className="flex items-center justify-center gap-1.5 text-center text-xs text-muted-foreground">
            <ShieldCheck className="size-3.5" /> {t.note}
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
