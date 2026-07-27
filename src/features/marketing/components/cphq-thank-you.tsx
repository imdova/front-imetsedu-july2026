"use client";

import * as React from "react";
import { CheckCircle2, MessageCircle, ArrowLeft, PartyPopper, Mail, CalendarClock } from "lucide-react";

import { dal } from "@/lib/dal";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const WIZARD = [
  { key: "التخصص", q: "ما تخصصك؟", options: ["طبيب", "صيدلي", "تمريض", "أخصائي جودة", "خريج جديد", "أخرى"] },
  { key: "العمل", q: "هل تعمل حاليًا؟", options: ["نعم، في مستشفى", "نعم، مكان آخر", "لا، أبحث عن عمل", "طالب / خريج جديد"] },
  { key: "الهدف", q: "هل تريد الحصول على CPHQ خلال سنة؟", options: ["نعم، بجدية 🔥", "ربما", "مجرد استكشاف"] },
];

type Lead = { name?: string; email?: string; whatsapp?: string; path?: string; courseName?: string };

/** Full-page thank-you: celebration → qualification wizard → Join-WhatsApp step. */
export function CphqThankYou({ whatsappNumber = "201142293143" }: { whatsappNumber?: string }) {
  const [lead, setLead] = React.useState<Lead | null>(null);
  const [ready, setReady] = React.useState(false);
  const [qIndex, setQIndex] = React.useState(0);
  const [answers, setAnswers] = React.useState<Record<string, string>>({});
  const [phase, setPhase] = React.useState<"wizard" | "whatsapp">("wizard");

  React.useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect -- hydrate the captured lead from sessionStorage on mount */
    let parsed: Lead | null = null;
    try {
      const raw = sessionStorage.getItem("imets_cphq_lead");
      if (raw) parsed = JSON.parse(raw) as Lead;
    } catch { /* ignore */ }
    setLead(parsed);
    if (!parsed) setPhase("whatsapp"); // direct visit → skip the wizard
    setReady(true);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  const firstName = (lead?.name ?? "").trim().split(" ")[0];

  const pickAnswer = (opt: string) => {
    const key = WIZARD[qIndex].key;
    const next = { ...answers, [key]: opt };
    setAnswers(next);
    if (qIndex < WIZARD.length - 1) { setQIndex((i) => i + 1); return; }
    if (lead?.email) {
      const summary = Object.entries(next).map(([k, v]) => `${k}: ${v}`).join(" · ");
      dal.landing.captureLead({
        name: lead.name ?? "", email: lead.email, whatsapp: lead.whatsapp ?? "",
        profession: next["التخصص"] ?? "", interest: `${lead.courseName ?? "CPHQ Free Lecture"} — ${summary}`,
        region: "Egypt", path: lead.path ?? "/lp/free-lecture-cphq",
      }).catch(() => {});
    }
    setPhase("whatsapp");
  };

  const waText = encodeURIComponent(`مرحبًا، سجّلت في محاضرة CPHQ المجانية${firstName ? ` — اسمي ${firstName}` : ""}`);

  return (
    <div dir="rtl" className="min-h-[70vh] bg-gradient-to-b from-primary/[0.06] to-background">
      <div className="mx-auto max-w-xl px-4 py-14 sm:py-20">
        {/* Celebration */}
        <div className="text-center">
          <div className="mx-auto mb-4 grid size-16 place-items-center rounded-2xl bg-emerald-100 text-emerald-600">
            <PartyPopper className="size-9" />
          </div>
          <h1 className="text-2xl font-extrabold sm:text-3xl">تم تسجيلك بنجاح 🎉</h1>
          <p className="mt-2 text-muted-foreground">
            {firstName ? `مبروك يا ${firstName}! ` : ""}مقعدك في المحاضرة المجانية اتحجز.
          </p>
        </div>

        {/* Wizard / WhatsApp card */}
        <div className="mt-8 rounded-2xl border border-border/70 bg-card p-5 shadow-sm sm:p-6">
          {!ready ? null : phase === "wizard" ? (
            <div className="space-y-4">
              <div className="text-center">
                <p className="text-sm font-bold text-primary">3 أسئلة سريعة تساعدنا نخدمك أحسن</p>
              </div>
              <div className="flex items-center justify-center gap-1.5">
                {WIZARD.map((_, i) => <span key={i} className={cn("h-1.5 w-10 rounded-full", i <= qIndex ? "bg-primary" : "bg-border")} />)}
              </div>
              <p className="text-center text-lg font-bold">{WIZARD[qIndex].q}</p>
              <div className="grid gap-2">
                {WIZARD[qIndex].options.map((opt) => (
                  <button key={opt} onClick={() => pickAnswer(opt)}
                    className="flex items-center justify-between rounded-lg border border-border/70 bg-background px-4 py-3 text-right text-sm font-medium transition hover:border-primary hover:bg-primary/5">
                    {opt}
                    <ArrowLeft className="size-4 text-muted-foreground" />
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-5 text-center">
              <div>
                <p className="text-sm font-bold uppercase tracking-wide text-primary">الخطوة التالية</p>
                <h2 className="mt-1 text-xl font-extrabold">تواصل معنا على واتساب</h2>
                <p className="mt-1 text-sm text-muted-foreground">عشان يوصلك رابط الحضور والتذكيرات، وتقدر تسأل أي سؤال.</p>
              </div>
              <Button asChild size="lg" className="w-full gap-2 bg-[#25D366] text-white hover:bg-[#25D366]/90">
                <a href={`https://wa.me/${whatsappNumber}?text=${waText}`} target="_blank" rel="noopener noreferrer">
                  <MessageCircle className="size-5" /> تواصل معنا من خلال واتساب
                </a>
              </Button>
              <ul className="space-y-2 pt-1 text-right text-sm">
                <li className="flex items-center gap-2"><CheckCircle2 className="size-4 shrink-0 text-emerald-500" /> رابط الحضور بيوصلك على واتساب والإيميل</li>
                <li className="flex items-center gap-2"><Mail className="size-4 shrink-0 text-primary" /> تأكيد التسجيل في بريدك الإلكتروني</li>
                <li className="flex items-center gap-2"><CalendarClock className="size-4 shrink-0 text-primary" /> تذكير قبل المحاضرة بوقت كافٍ</li>
              </ul>
            </div>
          )}
        </div>

        <div className="mt-6 text-center">
          <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">العودة للرئيسية</Link>
        </div>
      </div>
    </div>
  );
}
