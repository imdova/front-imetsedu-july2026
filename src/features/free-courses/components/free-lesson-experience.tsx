"use client";

import * as React from "react";
import { GraduationCap, CalendarClock, CheckCircle2, Award, Users, BrainCircuit, Radio, MessageCircle, Layers, Flame } from "lucide-react";

import type { FreeProgram } from "@/lib/dal/free-courses";
import { FreeLecturePlayer } from "./free-lecture-player";
import { getFreeQuiz, type QuizQuestion } from "@/features/free-courses/lib/free-quiz-data";
import { SimpleLeadForm } from "@/features/marketing/components/simple-lead-form";
import { RegistrationCountdown } from "@/features/marketing/components/registration-countdown";
import { cn } from "@/lib/utils";

const tr = (locale: string, en: string, ar: string) => (locale === "ar" ? ar : en);
/** Cohort discount shown on the offer (edit to match the running promo). */
const DISCOUNT = "30%";

/** First name of the visitor if they registered (landing form or the gate form). */
function getLeadFirstName(): string {
  try {
    const sources: [Storage, string][] = [
      [localStorage, "imets_lead"],
      [sessionStorage, "imets_cphq_lead"],
      [localStorage, "imets_free_access"],
    ];
    for (const [store, key] of sources) {
      const raw = store.getItem(key);
      if (!raw || raw === "1") continue;
      const name = String((JSON.parse(raw) as { name?: string })?.name ?? "").trim().split(/\s+/)[0];
      if (name) return name;
    }
  } catch { /* ignore */ }
  return "";
}

/** Full lesson experience: watch recorded lectures → quiz → enroll in the next live cohort. */
export function FreeLessonExperience({ locale, program, advisorWhatsapp, quiz: quizProp }: { locale: string; program: FreeProgram; advisorWhatsapp?: string; quiz?: QuizQuestion[] }) {
  const playable = program.lectures.filter((l) => l.videoUrl);
  const quiz = quizProp && quizProp.length ? quizProp : getFreeQuiz(program.slug);
  const name = (locale === "ar" ? program.titleAr : program.titleEn) || program.titleEn;
  const enrollRef = React.useRef<HTMLDivElement>(null);
  const [passed, setPassed] = React.useState(false);
  const [firstName, setFirstName] = React.useState("");
  const [returning, setReturning] = React.useState(false);

  React.useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect -- read the stored lead + first/return visit on mount */
    setFirstName(getLeadFirstName());
    try {
      const key = `imets_visited_${program.slug}`;
      if (localStorage.getItem(key)) setReturning(true);
      localStorage.setItem(key, "1");
    } catch { /* ignore */ }
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [program.slug]);

  const onPassed = () => {
    setPassed(true);
    setTimeout(() => enrollRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 400);
  };

  const BENEFITS = [
    { icon: Radio, t: tr(locale, "Attend live interactive sessions", "احضر الجلسات المباشرة التفاعلية") },
    { icon: Layers, t: tr(locale, "Access to ALL resources & materials", "وصول لكل المصادر والمرفقات") },
    { icon: Award, t: tr(locale, "Accredited certificate", "شهادة معتمدة") },
    { icon: BrainCircuit, t: tr(locale, "Full exam preparation", "تحضير كامل للامتحان") },
  ];

  return (
    <div className="space-y-10">
      {/* Personalized welcome for registered visitors */}
      {firstName && (
        <div className="rounded-2xl border border-primary/25 bg-gradient-to-br from-primary/[0.08] to-transparent p-4 sm:p-5">
          {returning ? (
            <>
              <p className="font-bold">
                👋 {tr(locale, `Welcome back, ${firstName}!`, `أهلاً بعودتك يا ${firstName}!`)}{" "}
                <span className="text-primary">{tr(locale, "Pick up where you left off.", "أكمل من حيث وقفت.")}</span>
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {tr(locale, `The full ${name} program is just one step away.`, `البرنامج الكامل «${name}» على بُعد خطوة واحدة.`)}
              </p>
            </>
          ) : (
            <>
              <p className="font-bold">
                👋 {tr(locale, `Hi ${firstName},`, `أهلاً ${firstName}،`)}{" "}
                <span className="text-primary">{tr(locale, "you've reached your first free lesson! 🎉", "وصلت لأول درس مجاني! 🎉")}</span>
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {tr(locale, `After this lesson you'll know whether the ${name} program is the right fit for you.`, `بعد ما تخلّص الدرس ده هتعرف إذا كان برنامج ${name} مناسب ليك.`)}
              </p>
            </>
          )}
        </div>
      )}

      {/* 1 · Watch lectures + take the quiz (one playlist) */}
      {playable.length === 0 && (
        <p className="rounded-xl border border-dashed border-border/70 p-4 text-center text-sm text-muted-foreground">
          {tr(locale, "Lectures are being uploaded — try the quiz meanwhile.", "يجري رفع المحاضرات — جرّب الاختبار لحد ما تنزل.")}
        </p>
      )}
      <FreeLecturePlayer locale={locale} lectures={playable} quiz={quiz} onQuizPassed={onPassed} programName={name} advisorWhatsapp={advisorWhatsapp} />

      {/* 2 · Enroll in the next live cohort */}
      <section id="enroll-offer" ref={enrollRef} className={cn("scroll-mt-24 overflow-hidden rounded-3xl border shadow-lg transition", passed ? "border-[#f4c430] ring-2 ring-[#f4c430]/30" : "border-border/70")}>
        <div className="grid lg:grid-cols-2">
          {/* pitch */}
          <div className="bg-gradient-to-br from-primary to-[#082a6b] p-7 text-primary-foreground sm:p-9">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-bold">
                <CalendarClock className="size-3.5 text-[#f4c430]" /> {tr(locale, "Next live cohort", "الدفعة المباشرة القادمة")}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#f4c430] px-3 py-1 text-xs font-extrabold text-[#0a1424]">
                <Flame className="size-3.5" /> {tr(locale, `${DISCOUNT} OFF`, `خصم ${DISCOUNT}`)}
              </span>
            </div>
            <h2 className="mt-3 font-heading text-2xl font-extrabold leading-tight sm:text-[1.7rem]">
              {tr(locale, `${name} — Live Preparation`, `${name} — التحضير المباشر`)}
            </h2>
            <p className="mt-2 text-sm text-white/85">
              {tr(
                locale,
                `Get ${DISCOUNT} off the full ${name} Live Preparation program — live sessions, all resources and an accredited certificate.`,
                `احصل على خصم ${DISCOUNT} على برنامج ${name} للتحضير المباشر — جلسات مباشرة، كل المصادر، وشهادة معتمدة.`,
              )}
            </p>
            <ul className="mt-5 grid gap-2.5 sm:grid-cols-2">
              {BENEFITS.map((b) => (
                <li key={b.t} className="flex items-center gap-2 text-sm">
                  <b.icon className="size-4 shrink-0 text-[#f4c430]" /> {b.t}
                </li>
              ))}
            </ul>
            <div className="mt-5">
              <RegistrationCountdown
                storageKey={`imets_offer_${program.slug}`}
                label={tr(locale, "Offer ends in:", "ينتهي العرض خلال:")}
              />
            </div>
            <p className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-white/10 px-3 py-1.5 text-xs font-medium">
              <Users className="size-3.5 text-[#f4c430]" /> {tr(locale, "Seats are limited — cohorts fill fast.", "الأماكن محدودة — الدفعات بتخلص بسرعة.")}
            </p>
          </div>

          {/* action: WhatsApp advisor OR lead form */}
          <div className="flex flex-col justify-center bg-card p-6 sm:p-8">
            {passed && (
              <p className="mb-3 inline-flex w-fit items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                <CheckCircle2 className="size-3.5" /> {tr(locale, "You passed the quiz — you're ready!", "نجحت في الاختبار — إنت جاهز!")}
              </p>
            )}
            {advisorWhatsapp ? (
              <div className="space-y-4 text-center">
                <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-[#25D366]/10 text-[#25D366]"><MessageCircle className="size-8" /></span>
                <div>
                  <p className="font-bold">{tr(locale, "Want to understand the program?", "عايز تفهم البرنامج أكتر؟")}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{tr(locale, `Talk to a course advisor about ${name} Live Preparation — dates, content and the ${DISCOUNT} offer.`, `كلّم مستشار الكورس عن برنامج ${name} للتحضير المباشر — المواعيد والمحتوى وعرض الخصم ${DISCOUNT}.`)}</p>
                </div>
                <a
                  href={`https://wa.me/${advisorWhatsapp}?text=${encodeURIComponent(tr(locale, `Hi, I watched the free ${name} lectures and want to know about the ${name} Live Preparation program.`, `مرحبًا، شاهدت محاضرات ${name} المجانية وحابب أعرف عن برنامج ${name} للتحضير المباشر.`))}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#25D366] px-5 py-3.5 text-sm font-extrabold text-white transition hover:bg-[#25D366]/90"
                >
                  <MessageCircle className="size-5" /> {tr(locale, "Talk to an Advisor", "كلّم مستشار الكورس")}
                </a>
                <p className="text-[11px] text-muted-foreground">{tr(locale, "Instant reply during working hours.", "رد فوري خلال ساعات العمل.")}</p>
              </div>
            ) : (
              <>
                <div className="mb-4 flex items-center gap-2">
                  <GraduationCap className="size-5 text-primary" />
                  <div>
                    <p className="font-bold">{tr(locale, `Reserve your seat — ${DISCOUNT} off`, `احجز مقعدك — بخصم ${DISCOUNT}`)}</p>
                    <p className="text-xs text-muted-foreground">{tr(locale, "We'll contact you with the next dates & your discount.", "هنتواصل معاك بمواعيد الدفعة والخصم.")}</p>
                  </div>
                </div>
                <SimpleLeadForm path={`/free-courses/${program.slug}`} courseName={`${name} — Live cohort`} />
              </>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
