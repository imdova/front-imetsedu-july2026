"use client";

import * as React from "react";
import { GraduationCap, CalendarClock, CheckCircle2, Award, Users, BrainCircuit, Radio, MessageCircle } from "lucide-react";

import type { FreeProgram } from "@/lib/dal/free-courses";
import { FreeLecturePlayer } from "./free-lecture-player";
import { FreeLectureQuiz } from "./free-lecture-quiz";
import { getFreeQuiz } from "@/features/free-courses/lib/free-quiz-data";
import { SimpleLeadForm } from "@/features/marketing/components/simple-lead-form";
import { cn } from "@/lib/utils";

const tr = (locale: string, en: string, ar: string) => (locale === "ar" ? ar : en);

/** Full lesson experience: watch recorded lectures → quiz → enroll in the next live cohort. */
export function FreeLessonExperience({ locale, program, advisorWhatsapp }: { locale: string; program: FreeProgram; advisorWhatsapp?: string }) {
  const playable = program.lectures.filter((l) => l.videoUrl);
  const quiz = getFreeQuiz(program.slug);
  const name = (locale === "ar" ? program.titleAr : program.titleEn) || program.titleEn;
  const enrollRef = React.useRef<HTMLDivElement>(null);
  const [passed, setPassed] = React.useState(false);

  const onPassed = () => {
    setPassed(true);
    setTimeout(() => enrollRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 400);
  };

  const BENEFITS = [
    { icon: Radio, t: tr(locale, "Live interactive sessions", "جلسات مباشرة تفاعلية") },
    { icon: Award, t: tr(locale, "Accredited certificate", "شهادة معتمدة") },
    { icon: BrainCircuit, t: tr(locale, "Full exam preparation", "تحضير كامل للامتحان") },
    { icon: Users, t: tr(locale, "Mentor + peer community", "مرشد + مجتمع زملاء") },
  ];

  return (
    <div className="space-y-10">
      {/* 1 · Watch */}
      {playable.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border/70 p-8 text-center text-sm text-muted-foreground">
          {tr(locale, "Lectures are being uploaded — check back shortly.", "يجري رفع المحاضرات — تابعنا قريبًا.")}
        </div>
      ) : (
        <FreeLecturePlayer locale={locale} lectures={playable} />
      )}

      {/* 2 · Quiz */}
      <section>
        <div className="mb-4 flex items-center gap-2.5">
          <span className="grid size-9 place-items-center rounded-xl bg-primary/10 text-primary"><BrainCircuit className="size-5" /></span>
          <div>
            <h2 className="font-heading text-xl font-bold">{tr(locale, "Test your knowledge", "اختبر معلوماتك")}</h2>
            <p className="text-xs text-muted-foreground">{tr(locale, "A quick check on what you just learned.", "اختبار سريع على اللي اتعلمته.")}</p>
          </div>
        </div>
        <FreeLectureQuiz locale={locale} quiz={quiz} onPassed={onPassed} />
      </section>

      {/* 3 · Enroll in the next live cohort */}
      <section ref={enrollRef} className={cn("scroll-mt-24 overflow-hidden rounded-3xl border shadow-lg transition", passed ? "border-[#f4c430] ring-2 ring-[#f4c430]/30" : "border-border/70")}>
        <div className="grid lg:grid-cols-2">
          {/* pitch */}
          <div className="bg-gradient-to-br from-primary to-[#082a6b] p-7 text-primary-foreground sm:p-9">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#f4c430] px-3 py-1 text-xs font-bold text-[#0a1424]">
              <CalendarClock className="size-3.5" /> {tr(locale, "Next live cohort", "الدفعة المباشرة القادمة")}
            </span>
            <h2 className="mt-3 font-heading text-2xl font-extrabold leading-tight sm:text-[1.7rem]">
              {tr(locale, `Ready for the full ${name} program?`, `جاهز للبرنامج الكامل «${name}»؟`)}
            </h2>
            <p className="mt-2 text-sm text-white/85">
              {tr(
                locale,
                "These free lectures are just the start. Join the next live group and earn your accredited certificate.",
                "المحاضرات المجانية دي البداية بس. انضم للدفعة المباشرة القادمة واحصل على شهادتك المعتمدة.",
              )}
            </p>
            <ul className="mt-5 grid gap-2.5 sm:grid-cols-2">
              {BENEFITS.map((b) => (
                <li key={b.t} className="flex items-center gap-2 text-sm">
                  <b.icon className="size-4 shrink-0 text-[#f4c430]" /> {b.t}
                </li>
              ))}
            </ul>
            <p className="mt-5 inline-flex items-center gap-1.5 rounded-lg bg-white/10 px-3 py-1.5 text-xs font-medium">
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
                  <p className="font-bold">{tr(locale, "Talk to a course advisor", "كلّم مستشار الكورس")}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{tr(locale, "Ask about the next live cohort, dates and offers — no forms.", "اسأل عن الدفعة المباشرة القادمة والمواعيد والعروض — من غير فورمات.")}</p>
                </div>
                <a
                  href={`https://wa.me/${advisorWhatsapp}?text=${encodeURIComponent(tr(locale, `Hi, I watched the free ${name} lectures and want to know about the next live cohort.`, `مرحبًا، شاهدت محاضرات ${name} المجانية وحابب أعرف تفاصيل الدفعة المباشرة القادمة.`))}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#25D366] px-5 py-3.5 text-sm font-extrabold text-white transition hover:bg-[#25D366]/90"
                >
                  <MessageCircle className="size-5" /> {tr(locale, "Chat on WhatsApp", "تواصل عبر واتساب")}
                </a>
                <p className="text-[11px] text-muted-foreground">{tr(locale, "Instant reply during working hours.", "رد فوري خلال ساعات العمل.")}</p>
              </div>
            ) : (
              <>
                <div className="mb-4 flex items-center gap-2">
                  <GraduationCap className="size-5 text-primary" />
                  <div>
                    <p className="font-bold">{tr(locale, "Reserve your seat", "احجز مقعدك")}</p>
                    <p className="text-xs text-muted-foreground">{tr(locale, "We'll contact you with the next dates & offer.", "هنتواصل معاك بمواعيد الدفعة والعرض.")}</p>
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
