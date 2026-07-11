"use client";

import * as React from "react";
import { Clock, Flame, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

type Lang = "ar" | "en";

const toArabicDigits = (s: string) => s.replace(/\d/g, (d) => "٠١٢٣٤٥٦٧٨٩"[Number(d)]);

/** Zero-padded countdown number in the requested language's digits. */
const fmt = (n: number, lang: Lang) => {
  const padded = String(Math.max(0, n)).padStart(2, "0");
  return lang === "ar" ? toArabicDigits(padded) : padded;
};

const COPY = {
  ar: {
    badge: "عرض لفترة محدودة",
    headPre: "خصم ",
    headPercent: "٥٠٪",
    headPost: " على رسوم الكورس",
    desc: "احجز مقعدك قبل انتهاء العدّاد واحصل على الدبلومة كاملة بنصف السعر — العرض ينتهي قريبًا.",
    save: "وفّر ٥٠٪",
    saveLong: "وفّر ٥٠٪ على رسوم الكورس",
    endsIn: "ينتهي العرض خلال",
    units: ["ساعة", "دقيقة", "ثانية"],
    cta: "احجز الآن بخصم ٥٠٪",
    footnote: "السعر يشمل المنهج كاملًا وبنك الأسئلة والامتحان المحاكي.",
  },
  en: {
    badge: "Limited-time offer",
    headPre: "Get ",
    headPercent: "50%",
    headPost: " off the course fee",
    desc: "Book your seat before the timer runs out and get the full program at half price — the offer ends soon.",
    save: "Save 50%",
    saveLong: "Save 50% on the course fee",
    endsIn: "Offer ends in",
    units: ["Hours", "Minutes", "Seconds"],
    cta: "Book now — 50% off",
    footnote: "Includes the full curriculum, question bank and mock exam.",
  },
} satisfies Record<Lang, unknown>;

interface DiscountCountdownProps {
  /** UI language for the banner (labels + digits). */
  lang?: Lang;
  /** Length of the offer window, in hours. */
  hours?: number;
  /** localStorage key holding this visitor's offer deadline. */
  storageKey?: string;
  /** Original price (struck through), pre-formatted. */
  priceWas?: string;
  /** Discounted price, pre-formatted. */
  priceNow?: string;
  currency?: string;
  /** Show the price row (was/now/save). Set false to advertise the offer without prices. */
  showPrice?: boolean;
  ctaHref?: string;
  className?: string;
}

/**
 * "Smart" limited-time discount banner with a live countdown.
 *
 * The deadline is stored per visitor in localStorage, so the timer keeps
 * counting down across reloads instead of resetting to the full window on every
 * page view. When it reaches zero it recycles to a fresh window, keeping the
 * offer credibly "live" without inventing a fixed calendar date.
 */
export function DiscountCountdown({
  lang = "ar",
  hours = 7,
  storageKey = "imets_offer_deadline",
  priceWas = "٩٬٠٠٠",
  priceNow = "٤٬٥٠٠",
  currency = "جنيه",
  showPrice = true,
  ctaHref = "#apply",
  className,
}: DiscountCountdownProps) {
  const t = COPY[lang];
  const isRtl = lang === "ar";
  const Chevron = isRtl ? ChevronLeft : ChevronRight;
  const windowMs = hours * 60 * 60 * 1000;
  // Starts null on the server + first client render (= full window) to avoid a
  // hydration mismatch; the real remaining time is computed in the effect.
  const [remaining, setRemaining] = React.useState<number | null>(null);

  React.useEffect(() => {
    const resolveDeadline = () => {
      const now = Date.now();
      const stored = Number(window.localStorage.getItem(storageKey));
      if (!stored || Number.isNaN(stored) || stored <= now) {
        const fresh = now + windowMs;
        window.localStorage.setItem(storageKey, String(fresh));
        return fresh;
      }
      return stored;
    };

    let deadline = resolveDeadline();
    const tick = () => {
      const now = Date.now();
      let diff = deadline - now;
      if (diff <= 0) {
        deadline = now + windowMs; // recycle so the offer stays live
        window.localStorage.setItem(storageKey, String(deadline));
        diff = windowMs;
      }
      setRemaining(diff);
    };

    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [storageKey, windowMs]);

  const total = remaining ?? windowMs;
  const h = Math.floor(total / 3_600_000);
  const m = Math.floor((total % 3_600_000) / 60_000);
  const s = Math.floor((total % 60_000) / 1000);

  return (
    <section dir={isRtl ? "rtl" : "ltr"} className={cn("mx-auto max-w-6xl px-4 sm:px-6 lg:px-8", className)}>
      <div className="relative overflow-hidden rounded-3xl bg-[radial-gradient(ellipse_120%_90%_at_50%_-10%,#1e6ef0_0%,#0b3fa8_42%,#051a4a_100%)] p-6 text-white shadow-xl ring-1 ring-white/10 sm:p-10">
        {/* ambient gold glow */}
        <div className="pointer-events-none absolute -left-16 -top-20 size-56 rounded-full bg-[#f4c430]/25 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -right-10 size-56 rounded-full bg-[#1e6ef0]/20 blur-3xl" />

        <div className="relative grid items-center gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          {/* offer copy + price */}
          <div className={cn("space-y-4 text-center", isRtl ? "lg:text-right" : "lg:text-left")}>
            <span className="inline-flex items-center gap-2 rounded-full bg-[#f4c430] px-3 py-1 text-xs font-bold text-[#051a4a] shadow">
              <Flame className="size-3.5" /> {t.badge}
            </span>
            <h2 className="text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl">
              {t.headPre}<span className="text-[#f4c430]">{t.headPercent}</span>{t.headPost}
            </h2>
            <p className="mx-auto max-w-md text-white/80 lg:mx-0">
              {t.desc}
            </p>
            {showPrice ? (
              <div className="flex flex-wrap items-center justify-center gap-3 lg:justify-start">
                <span className="text-lg text-white/50 line-through">{priceWas} {currency}</span>
                <span className="text-3xl font-extrabold text-[#f4c430]">{priceNow} {currency}</span>
                <span className="rounded-lg bg-[#f4c430]/15 px-2 py-1 text-sm font-bold text-[#f4c430]">{t.save}</span>
              </div>
            ) : (
              <span className="inline-flex items-center gap-2 rounded-lg bg-[#f4c430]/15 px-3 py-1.5 text-base font-bold text-[#f4c430]">
                {t.saveLong}
              </span>
            )}
          </div>

          {/* countdown + CTA */}
          <div className="space-y-4">
            <p className="flex items-center justify-center gap-2 text-sm font-semibold text-white/80">
              <Clock className="size-4" /> {t.endsIn}
            </p>
            <div className="flex justify-center gap-3" dir="ltr">
              {([[h, t.units[0]], [m, t.units[1]], [s, t.units[2]]] as const).map(([v, label]) => (
                <div
                  key={label}
                  className="min-w-[76px] rounded-2xl bg-white/10 px-3 py-3 text-center ring-1 ring-white/15 backdrop-blur"
                >
                  <span className="block font-mono text-3xl font-extrabold tabular-nums text-white">
                    {fmt(v, lang)}
                  </span>
                  <span className="mt-1 block text-xs text-white/60">{label}</span>
                </div>
              ))}
            </div>
            <a
              href={ctaHref}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#f4c430] px-6 py-3.5 text-base font-bold text-[#051a4a] shadow-lg transition hover:bg-[#e0b020]"
            >
              {t.cta} <Chevron className="size-5" />
            </a>
            <p className="text-center text-xs text-white/55">{t.footnote}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
