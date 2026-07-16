"use client";

import * as React from "react";
import Image from "next/image";
import {
  Quote,
  GraduationCap,
  MessageCircle,
  ThumbsUp,
  X,
  ChevronLeft,
  ChevronRight,
  BadgeCheck,
} from "lucide-react";

import { cn } from "@/lib/utils";
import type { StudentReview } from "@/lib/db/student-reviews";
import { VideoFacade } from "./video-facade";
import { extractYouTubeVideoId } from "@/features/marketing/lib/youtube-id";

const poster = (id: string) => `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
const FACEBOOK_CAROUSEL_LIMIT = 10;

const GALLERY_PLACEHOLDERS = [
  {
    key: "ceremony",
    en: "Graduation Ceremony",
    ar: "حفل التخرج",
    img: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=900&h=700&fit=crop&q=80",
  },
  {
    key: "certificates",
    en: "Certificates",
    ar: "الشهادات",
    img: "https://images.unsplash.com/photo-1589330694653-ded6df03f754?w=900&h=700&fit=crop&q=80",
  },
  {
    key: "group",
    en: "Group Photos",
    ar: "صور جماعية",
    img: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=900&h=700&fit=crop&q=80",
  },
] as const;

function SectionHead({
  icon: Icon,
  eyebrow,
  title,
  subtitle,
}: {
  icon: React.ElementType;
  eyebrow: string;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="max-w-2xl">
      <p className="inline-flex items-center gap-2 text-sm font-semibold text-[#B8860B]">
        <Icon className="size-4" /> {eyebrow}
      </p>
      <h2 className="mt-2 font-heading text-2xl font-bold tracking-tight text-[#0a2f7a] sm:text-3xl">
        {title}
      </h2>
      <p className="mt-2 text-muted-foreground">{subtitle}</p>
    </div>
  );
}

function VideoCard({ r, portrait }: { r: StudentReview; portrait?: boolean }) {
  const id = extractYouTubeVideoId(r.videoUrl) || "";
  if (!id) return null;
  return (
    <figure className="w-full">
      <div
        className={cn(
          "relative overflow-hidden rounded-2xl bg-muted shadow-sm ring-1 ring-border/60",
          portrait ? "aspect-[9/16]" : "aspect-video",
        )}
      >
        <VideoFacade
          videoId={id}
          thumbnail={poster(id)}
          title={r.studentName || "Student review"}
        />
      </div>
      {(r.studentName || r.role || r.country) && (
        <figcaption className="mt-2.5">
          {r.studentName && (
            <p className="text-sm font-semibold">{r.studentName}</p>
          )}
          {(r.role || r.country) && (
            <p className="text-xs text-muted-foreground">
              {[r.role, r.country].filter(Boolean).join(" · ")}
            </p>
          )}
        </figcaption>
      )}
    </figure>
  );
}

function FacebookCarousel({
  shots,
  onZoom,
  locale,
}: {
  shots: StudentReview[];
  onZoom: (src: string) => void;
  locale: string;
}) {
  const ar = locale === "ar";
  const trackRef = React.useRef<HTMLDivElement>(null);
  const items = shots.slice(0, FACEBOOK_CAROUSEL_LIMIT);

  const scrollByCard = (dir: 1 | -1) => {
    const el = trackRef.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>("[data-fb-card]");
    const step = (card?.offsetWidth ?? 280) + 16;
    const delta = (ar ? -dir : dir) * step;
    el.scrollBy({ left: delta, behavior: "smooth" });
  };

  return (
    <div className="relative mt-8">
      <div className="absolute -top-14 end-0 z-10 hidden items-center gap-2 sm:flex">
        <button
          type="button"
          aria-label={ar ? "السابق" : "Previous"}
          onClick={() => scrollByCard(-1)}
          className="grid size-10 place-items-center rounded-full border border-blue-100 bg-white text-[#0b3fa8] shadow-sm transition hover:bg-blue-50"
        >
          <ChevronLeft className="size-5 rtl:rotate-180" />
        </button>
        <button
          type="button"
          aria-label={ar ? "التالي" : "Next"}
          onClick={() => scrollByCard(1)}
          className="grid size-10 place-items-center rounded-full border border-blue-100 bg-white text-[#0b3fa8] shadow-sm transition hover:bg-blue-50"
        >
          <ChevronRight className="size-5 rtl:rotate-180" />
        </button>
      </div>

      <div
        ref={trackRef}
        className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-3 pe-4 ps-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        dir={ar ? "rtl" : "ltr"}
      >
        {items.map((s) => (
          <button
            key={s.id}
            type="button"
            data-fb-card
            onClick={() => onZoom(s.imageUrl)}
            className="group w-[min(78vw,280px)] shrink-0 snap-start overflow-hidden rounded-2xl border border-[#1877F2]/15 bg-white text-start shadow-md ring-1 ring-black/5 transition hover:-translate-y-1 hover:shadow-xl sm:w-[300px]"
          >
            <div className="relative aspect-[4/5] overflow-hidden bg-slate-100">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={s.imageUrl}
                alt={s.caption || s.studentName || "Facebook recommendation"}
                loading="lazy"
                className="size-full object-cover object-top transition duration-500 group-hover:scale-[1.03]"
              />
              <span className="absolute start-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-[#1877F2] px-2.5 py-1 text-[0.65rem] font-bold text-white shadow">
                <span className="grid size-4 place-items-center rounded-full bg-white/20 text-[0.55rem]">
                  f
                </span>
                Facebook
              </span>
            </div>
            <div className="space-y-1.5 p-4">
              <p className="inline-flex items-center gap-1 text-[0.7rem] font-semibold text-[#1877F2]">
                <BadgeCheck className="size-3.5" />
                {ar ? "توصية موثّقة" : "Verified recommendation"}
              </p>
              {s.studentName ? (
                <p className="truncate font-heading text-sm font-bold text-[#0a2f7a]">
                  {s.studentName}
                </p>
              ) : null}
              {s.caption ? (
                <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                  {s.caption}
                </p>
              ) : null}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

function WhatsAppPrivacyGrid({
  shots,
  onZoom,
  locale,
}: {
  shots: StudentReview[];
  onZoom: (src: string) => void;
  locale: string;
}) {
  const ar = locale === "ar";

  return (
    <div className="mt-6 columns-2 gap-4 sm:columns-3 lg:columns-4 [&>*]:mb-4">
      {shots.map((s) => (
        <button
          key={s.id}
          type="button"
          onClick={() => onZoom(s.imageUrl)}
          className="group relative block w-full break-inside-avoid overflow-hidden rounded-2xl border border-[#25D366]/25 bg-card text-start shadow-sm ring-1 ring-black/5 transition-transform hover:-translate-y-0.5"
        >
          <div className="relative overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={s.imageUrl}
              alt={s.caption || s.studentName || "WhatsApp conversation"}
              loading="lazy"
              className="w-full blur-[6px] scale-105 transition duration-500 group-hover:blur-[4px]"
            />
            {/* Soften top strip (names / avatars) a bit more */}
            <div
              className="pointer-events-none absolute inset-x-0 top-0 h-1/4 bg-gradient-to-b from-white/40 to-transparent backdrop-blur-[2px]"
              aria-hidden
            />
            <span className="absolute start-2.5 top-2.5 inline-flex max-w-[calc(100%-1.25rem)] items-center gap-1.5 rounded-full bg-[#25D366] px-2.5 py-1 text-[0.65rem] font-bold leading-tight text-white shadow-md">
              <BadgeCheck className="size-3.5 shrink-0" />
              <span className="truncate">
                {ar ? "محادثة واتساب موثّقة" : "Verified WhatsApp Conversation"}
              </span>
            </span>
          </div>
          <div className="flex items-start gap-2 border-t border-[#25D366]/15 bg-[#25D366]/5 p-3">
            <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-[#25D366] text-white">
              <MessageCircle className="size-3" />
            </span>
            <div className="min-w-0">
              <p className="text-[0.7rem] font-semibold text-[#128C7E]">
                {ar ? "خصوصية الخريج محمية" : "Graduate privacy protected"}
              </p>
              {s.caption ? (
                <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
                  {s.caption}
                </p>
              ) : (
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {ar
                    ? "اضغط لعرض المحادثة"
                    : "Tap to view conversation"}
                </p>
              )}
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}

export function ReviewsShowcase({
  reviews,
  locale,
}: {
  reviews: StudentReview[];
  locale: string;
}) {
  const ar = locale === "ar";
  const tr = (en: string, arText: string) => (ar ? arText : en);
  const [zoom, setZoom] = React.useState<string | null>(null);

  const byRank = (a: StudentReview, b: StudentReview) => a.rank - b.rank;
  const videos = reviews
    .filter((r) => r.kind === "video" && r.videoUrl)
    .sort(byRank);
  const portraitVids = videos.filter((v) => v.orientation === "portrait");
  const landscapeVids = videos.filter((v) => v.orientation !== "portrait");
  const grad = reviews
    .filter((r) => r.kind === "graduation" && r.videoUrl)
    .sort(byRank);
  const facebook = reviews
    .filter((r) => r.kind === "facebook" && r.imageUrl)
    .sort(byRank);
  const whatsapp = reviews
    .filter((r) => r.kind === "whatsapp" && r.imageUrl)
    .sort(byRank);

  const empty =
    !videos.length && !grad.length && !facebook.length && !whatsapp.length;

  return (
    <div className="space-y-16">
      {empty && (
        <p className="rounded-2xl border border-dashed border-border py-16 text-center text-muted-foreground">
          {tr("Student stories are coming soon.", "قصص طلابنا قريبًا.")}
        </p>
      )}

      {/* Video testimonials */}
      {videos.length > 0 && (
        <section>
          <SectionHead
            icon={Quote}
            eyebrow={tr("Real success stories", "قصص نجاح حقيقية")}
            title={tr("Graduate Stories", "قصص الخريجين")}
            subtitle={tr(
              "Hear it straight from our graduates — in their own words.",
              "استمع مباشرةً من خريجينا بكلماتهم.",
            )}
          />
          {portraitVids.length > 0 && (
            <div className="mt-6 flex snap-x gap-4 overflow-x-auto pb-3">
              {portraitVids.map((v) => (
                <div
                  key={v.id}
                  className="w-[220px] shrink-0 snap-start sm:w-[240px]"
                >
                  <VideoCard r={v} portrait />
                </div>
              ))}
            </div>
          )}
          {landscapeVids.length > 0 && (
            <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {landscapeVids.map((v) => (
                <VideoCard key={v.id} r={v} />
              ))}
            </div>
          )}
        </section>
      )}

      {/* Graduation projects */}
      {grad.length > 0 && (
        <section>
          <SectionHead
            icon={GraduationCap}
            eyebrow={tr("Capstone projects", "مشاريع التخرج")}
            title={tr(
              "Graduation Project Discussions",
              "مناقشات مشاريع التخرج",
            )}
            subtitle={tr(
              "Watch our graduates present and defend their final projects.",
              "شاهد خريجينا يعرضون ويناقشون مشاريعهم النهائية.",
            )}
          />
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {grad.map((v) => (
              <VideoCard key={v.id} r={v} />
            ))}
          </div>
        </section>
      )}

      {/* Facebook */}
      {facebook.length > 0 && (
        <section>
          <SectionHead
            icon={ThumbsUp}
            eyebrow={tr("From Facebook", "من فيسبوك")}
            title={tr("Verified Facebook Recommendations", "توصيات فيسبوك موثّقة")}
            subtitle={tr(
              "Swipe through real public recommendations from our graduates.",
              "تصفّح توصيات عامة حقيقية من خريجينا.",
            )}
          />
          <FacebookCarousel shots={facebook} onZoom={setZoom} locale={locale} />
        </section>
      )}

      {/* WhatsApp */}
      {whatsapp.length > 0 && (
        <section>
          <SectionHead
            icon={MessageCircle}
            eyebrow={tr("From WhatsApp", "من واتساب")}
            title={tr("Messages From Healthcare Professionals", "رسائل من متخصصي الرعاية الصحية")}
            subtitle={tr(
              "Real graduate messages — names and faces are blurred to protect privacy.",
              "رسائل حقيقية من الخريجين — الأسماء والصور مطموسة لحماية الخصوصية.",
            )}
          />
          <WhatsAppPrivacyGrid shots={whatsapp} onZoom={setZoom} locale={locale} />
        </section>
      )}

      {/* Graduation Gallery — strongest social proof */}
      <section>
        <SectionHead
          icon={GraduationCap}
          eyebrow={tr("Capstone & ceremonies", "المشاريع والاحتفالات")}
          title={tr("Graduation Gallery", "معرض التخرج")}
          subtitle={tr(
            "Ceremonies, certificates, and group moments — our strongest social proof.",
            "احتفالات وشهادات ولحظات جماعية — أقوى دليل اجتماعي لدينا.",
          )}
        />
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {GALLERY_PLACEHOLDERS.map((g) => {
            const title = ar ? g.ar : g.en;
            return (
              <button
                key={g.key}
                type="button"
                onClick={() => setZoom(g.img)}
                className="group overflow-hidden rounded-2xl border border-blue-100 bg-white text-start shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="relative aspect-[4/3] overflow-hidden">
                  <Image
                    src={g.img}
                    alt={title}
                    fill
                    sizes="(max-width:768px) 100vw, 33vw"
                    className="object-cover transition duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#051a4a]/70 via-transparent to-transparent opacity-80" />
                  <p className="absolute inset-x-0 bottom-0 px-4 py-3 font-heading text-base font-bold text-white">
                    {title}
                  </p>
                </div>
              </button>
            );
          })}
          {grad
            .filter((g) => g.imageUrl)
            .map((g) => (
              <button
                key={g.id}
                type="button"
                onClick={() => setZoom(g.imageUrl)}
                className="group overflow-hidden rounded-2xl border border-blue-100 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={g.imageUrl}
                  alt={g.caption || g.studentName || "Graduation"}
                  className="aspect-[4/3] w-full object-cover transition duration-500 group-hover:scale-105"
                />
              </button>
            ))}
        </div>
      </section>

      {/* Lightbox */}
      {zoom && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={() => setZoom(null)}
          className="fixed inset-0 z-[60] grid place-items-center bg-black/85 p-4 backdrop-blur-sm"
        >
          <button
            type="button"
            aria-label="Close"
            className="absolute right-4 top-4 grid size-10 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20"
          >
            <X className="size-5" />
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={zoom}
            alt=""
            className="max-h-[90vh] max-w-[95vw] rounded-lg shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}
