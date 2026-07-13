"use client";

import * as React from "react";
import { Quote, GraduationCap, MessageCircle, ThumbsUp, X } from "lucide-react";

import { cn } from "@/lib/utils";
import type { StudentReview } from "@/lib/db/student-reviews";
import { VideoFacade } from "./video-facade";
import { extractYouTubeVideoId } from "@/features/marketing/lib/youtube-id";

const poster = (id: string) => `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;

function SectionHead({ icon: Icon, eyebrow, title, subtitle }: { icon: React.ElementType; eyebrow: string; title: string; subtitle: string }) {
  return (
    <div className="max-w-2xl">
      <p className="inline-flex items-center gap-2 text-sm font-semibold text-[#B8860B]">
        <Icon className="size-4" /> {eyebrow}
      </p>
      <h2 className="mt-2 font-heading text-2xl font-bold tracking-tight text-[#0a2f7a] sm:text-3xl">{title}</h2>
      <p className="mt-2 text-muted-foreground">{subtitle}</p>
    </div>
  );
}

function VideoCard({ r, portrait }: { r: StudentReview; portrait?: boolean }) {
  const id = extractYouTubeVideoId(r.videoUrl) || "";
  if (!id) return null;
  return (
    <figure className="w-full">
      <div className={cn("relative overflow-hidden rounded-2xl bg-muted shadow-sm ring-1 ring-border/60", portrait ? "aspect-[9/16]" : "aspect-video")}>
        <VideoFacade videoId={id} thumbnail={poster(id)} title={r.studentName || "Student review"} />
      </div>
      {(r.studentName || r.role || r.country) && (
        <figcaption className="mt-2.5">
          {r.studentName && <p className="text-sm font-semibold">{r.studentName}</p>}
          {(r.role || r.country) && (
            <p className="text-xs text-muted-foreground">{[r.role, r.country].filter(Boolean).join(" · ")}</p>
          )}
        </figcaption>
      )}
    </figure>
  );
}

function ScreenshotGrid({
  shots, onZoom, accent,
}: {
  shots: StudentReview[];
  onZoom: (src: string) => void;
  accent: "facebook" | "whatsapp";
}) {
  return (
    <div className="mt-6 columns-2 gap-4 sm:columns-3 lg:columns-4 [&>*]:mb-4">
      {shots.map((s) => (
        <button
          key={s.id}
          type="button"
          onClick={() => onZoom(s.imageUrl)}
          className="group block w-full break-inside-avoid overflow-hidden rounded-xl border border-border/70 bg-card text-start shadow-sm transition-transform hover:-translate-y-0.5"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={s.imageUrl} alt={s.caption || s.studentName || "Student review"} loading="lazy" className="w-full" />
          {(s.studentName || s.caption) && (
            <div className="flex items-start gap-2 p-3">
              <span
                className={cn(
                  "mt-0.5 grid size-5 shrink-0 place-items-center rounded-full text-[0.6rem] font-bold text-white",
                  accent === "facebook" ? "bg-[#1877F2]" : "bg-[#25D366]",
                )}
              >
                {accent === "facebook" ? "f" : <MessageCircle className="size-3" />}
              </span>
              <div className="min-w-0">
                {s.studentName && <p className="truncate text-xs font-semibold">{s.studentName}</p>}
                {s.caption && <p className="line-clamp-2 text-xs text-muted-foreground">{s.caption}</p>}
              </div>
            </div>
          )}
        </button>
      ))}
    </div>
  );
}

export function ReviewsShowcase({ reviews, locale }: { reviews: StudentReview[]; locale: string }) {
  const ar = locale === "ar";
  const tr = (en: string, arText: string) => (ar ? arText : en);
  const [zoom, setZoom] = React.useState<string | null>(null);

  const byRank = (a: StudentReview, b: StudentReview) => a.rank - b.rank;
  const videos = reviews.filter((r) => r.kind === "video" && r.videoUrl).sort(byRank);
  const portraitVids = videos.filter((v) => v.orientation === "portrait");
  const landscapeVids = videos.filter((v) => v.orientation !== "portrait");
  const grad = reviews.filter((r) => r.kind === "graduation" && r.videoUrl).sort(byRank);
  const facebook = reviews.filter((r) => r.kind === "facebook" && r.imageUrl).sort(byRank);
  const whatsapp = reviews.filter((r) => r.kind === "whatsapp" && r.imageUrl).sort(byRank);

  const empty = !videos.length && !grad.length && !facebook.length && !whatsapp.length;

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
          <SectionHead icon={Quote} eyebrow={tr("Real success stories", "قصص نجاح حقيقية")} title={tr("Video Testimonials", "آراء طلابنا بالفيديو")} subtitle={tr("Hear it straight from our graduates — in their own words.", "استمع مباشرةً من خريجينا بكلماتهم.")} />
          {portraitVids.length > 0 && (
            <div className="mt-6 flex snap-x gap-4 overflow-x-auto pb-3">
              {portraitVids.map((v) => (
                <div key={v.id} className="w-[220px] shrink-0 snap-start sm:w-[240px]">
                  <VideoCard r={v} portrait />
                </div>
              ))}
            </div>
          )}
          {landscapeVids.length > 0 && (
            <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {landscapeVids.map((v) => <VideoCard key={v.id} r={v} />)}
            </div>
          )}
        </section>
      )}

      {/* Graduation projects */}
      {grad.length > 0 && (
        <section>
          <SectionHead icon={GraduationCap} eyebrow={tr("Capstone projects", "مشاريع التخرج")} title={tr("Graduation Project Discussions", "مناقشات مشاريع التخرج")} subtitle={tr("Watch our graduates present and defend their final projects.", "شاهد خريجينا يعرضون ويناقشون مشاريعهم النهائية.")} />
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {grad.map((v) => <VideoCard key={v.id} r={v} />)}
          </div>
        </section>
      )}

      {/* Facebook */}
      {facebook.length > 0 && (
        <section>
          <SectionHead icon={ThumbsUp} eyebrow={tr("From Facebook", "من فيسبوك")} title={tr("Recommendations on Facebook", "توصيات على فيسبوك")} subtitle={tr("Real recommendations our graduates shared publicly.", "توصيات حقيقية شاركها خريجونا علنًا.")} />
          <ScreenshotGrid shots={facebook} onZoom={setZoom} accent="facebook" />
        </section>
      )}

      {/* WhatsApp */}
      {whatsapp.length > 0 && (
        <section>
          <SectionHead icon={MessageCircle} eyebrow={tr("From WhatsApp", "من واتساب")} title={tr("Messages on WhatsApp", "رسائل على واتساب")} subtitle={tr("What students tell us directly after their programs.", "ما يخبرنا به الطلاب مباشرةً بعد برامجهم.")} />
          <ScreenshotGrid shots={whatsapp} onZoom={setZoom} accent="whatsapp" />
        </section>
      )}

      {/* Lightbox */}
      {zoom && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={() => setZoom(null)}
          className="fixed inset-0 z-[60] grid place-items-center bg-black/85 p-4 backdrop-blur-sm"
        >
          <button type="button" aria-label="Close" className="absolute right-4 top-4 grid size-10 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20">
            <X className="size-5" />
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={zoom} alt="" className="max-h-[90vh] max-w-[95vw] rounded-lg shadow-2xl" onClick={(e) => e.stopPropagation()} />
        </div>
      )}
    </div>
  );
}
