"use client";

import * as React from "react";
import { CheckCircle2, Loader2, ShieldCheck, User, Phone, Mail, MessageCircle, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

import { dal } from "@/lib/dal";
import { fbLeadContext, fireBrowserLead } from "@/lib/meta-events";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select";
import { cn } from "@/lib/utils";

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

/** Lead-qualification wizard shown after registration (helps the sales team). */
const WIZARD = [
  { key: "التخصص", q: "ما تخصصك؟", options: ["طبيب", "صيدلي", "تمريض", "أخصائي جودة", "خريج جديد", "أخرى"] },
  { key: "العمل", q: "هل تعمل حاليًا؟", options: ["نعم، في مستشفى", "نعم، مكان آخر", "لا، أبحث عن عمل", "طالب / خريج جديد"] },
  { key: "الهدف", q: "هل تريد الحصول على CPHQ خلال سنة؟", options: ["نعم، بجدية 🔥", "ربما", "مجرد استكشاف"] },
];

type Phase = "form" | "wizard" | "whatsapp";

export function CphqLectureForm({
  path, courseName, whatsappNumber = "201115782721",
}: {
  path: string; courseName: string; whatsappNumber?: string;
}) {
  const [phase, setPhase] = React.useState<Phase>("form");
  const [form, setForm] = React.useState({ name: "", email: "", code: "+20", whatsapp: "" });
  const [submitting, setSubmitting] = React.useState(false);
  const [qIndex, setQIndex] = React.useState(0);
  const [answers, setAnswers] = React.useState<Record<string, string>>({});

  React.useEffect(() => { dal.landing.trackLanding(path, "view").catch(() => {}); }, [path]);
  const set = (k: "name" | "email" | "code" | "whatsapp", v: string) => setForm((f) => ({ ...f, [k]: v }));
  const fullPhone = () => `${form.code}${digits(form.whatsapp)}`;
  const valid = form.name.trim().length > 1 && EMAIL_RE.test(form.email.trim()) && digits(form.whatsapp).length >= 8;

  // Capture the lead the moment the form is submitted (seat reserved).
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!valid) { toast.error("اكمل بياناتك بشكل صحيح"); return; }
    setSubmitting(true);
    const fb = fbLeadContext();
    const res = await dal.landing.captureLead({
      name: form.name.trim(), email: form.email.trim(), whatsapp: fullPhone(),
      interest: courseName, region: "Egypt", path, ...fb,
    });
    setSubmitting(false);
    if (res.ok) { fireBrowserLead(fb.eventId, { content_name: courseName }); dal.landing.trackLanding(path, "click").catch(() => {}); setPhase("wizard"); }
    else toast.error(res.error);
  };

  // Enrich the lead with the wizard answers (qualification for sales).
  const pickAnswer = (opt: string) => {
    const key = WIZARD[qIndex].key;
    const next = { ...answers, [key]: opt };
    setAnswers(next);
    if (qIndex < WIZARD.length - 1) { setQIndex((i) => i + 1); return; }
    const summary = Object.entries(next).map(([k, v]) => `${k}: ${v}`).join(" · ");
    dal.landing.captureLead({
      name: form.name.trim(), email: form.email.trim(), whatsapp: fullPhone(),
      profession: next["التخصص"] ?? "", interest: `${courseName} — ${summary}`, region: "Egypt", path,
    }).catch(() => {});
    setPhase("whatsapp");
  };

  /* ── WhatsApp (final) ── */
  if (phase === "whatsapp") {
    const waText = encodeURIComponent(`مرحبًا، سجّلت في محاضرة CPHQ المجانية — اسمي ${form.name.trim()}`);
    return (
      <div className="space-y-4 text-center" dir="rtl">
        <div className="mx-auto grid size-12 place-items-center rounded-full bg-emerald-100 text-emerald-600"><CheckCircle2 className="size-7" /></div>
        <div>
          <h3 className="text-lg font-bold text-emerald-700">تمام! مقعدك محجوز 🎉</h3>
          <p className="mt-1 text-sm text-muted-foreground">فضلت خطوة واحدة — انضم لجروب الواتساب عشان يوصلك رابط الحضور والتذكيرات.</p>
        </div>
        <Button asChild size="lg" className="w-full gap-2 bg-[#25D366] text-white hover:bg-[#25D366]/90">
          <a href={`https://wa.me/${whatsappNumber}?text=${waText}`} target="_blank" rel="noopener noreferrer">
            <MessageCircle className="size-5" /> انضم لجروب الواتساب
          </a>
        </Button>
        <p className="text-[11px] text-muted-foreground">مهم عشان متفوتش المحاضرة ✅</p>
      </div>
    );
  }

  /* ── Qualification wizard ── */
  if (phase === "wizard") {
    const step = WIZARD[qIndex];
    return (
      <div className="space-y-4" dir="rtl">
        <div className="text-center">
          <p className="text-sm font-bold text-primary">شكرًا لتسجيلك، {form.name.trim().split(" ")[0]} 🙌</p>
          <p className="text-xs text-muted-foreground">3 أسئلة سريعة تساعدنا نخدمك أحسن</p>
        </div>
        <div className="flex items-center justify-center gap-1.5">
          {WIZARD.map((_, i) => <span key={i} className={cn("h-1.5 w-8 rounded-full", i <= qIndex ? "bg-primary" : "bg-border")} />)}
        </div>
        <div>
          <p className="mb-3 text-center text-base font-bold">{step.q}</p>
          <div className="grid gap-2">
            {step.options.map((opt) => (
              <button key={opt} onClick={() => pickAnswer(opt)}
                className="flex items-center justify-between rounded-lg border border-border/70 bg-card px-4 py-2.5 text-right text-sm font-medium transition hover:border-primary hover:bg-primary/5">
                {opt}
                <ArrowLeft className="size-4 text-muted-foreground" />
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  /* ── Registration form ── */
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
