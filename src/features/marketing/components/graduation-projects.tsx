"use client";

import { GraduationCap } from "lucide-react";
import { cn } from "@/lib/utils";
import { VideoFacade } from "@/features/marketing/components/video-facade";

export interface GraduationProject {
  /** YouTube video id (or full URL — VideoFacade extracts the id). */
  id: string;
  title: string;
  student: string;
  jobTitle?: string;
  /** "portrait" for vertical clips, "landscape" (default) for normal videos. */
  orientation?: "portrait" | "landscape";
}

const poster = (id: string) => `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;

/**
 * Showcase of student graduation/capstone projects: each card plays a video and
 * shows the project title, the student's name and their job title. Click-to-play
 * facades keep the page light — the YouTube player loads only on click.
 */
export function GraduationProjects({
  projects,
  title = "Graduation Projects by Our Students",
  subtitle = "Real capstone projects presented by IMETS graduates.",
  className,
}: {
  projects: GraduationProject[];
  title?: string;
  subtitle?: string;
  className?: string;
}) {
  if (!projects.length) return null;

  return (
    <section dir="ltr" className={cn("mx-auto max-w-6xl px-4 py-16 text-left sm:px-6 lg:px-8", className)}>
      <div className="mx-auto mb-10 max-w-2xl text-center">
        <p className="inline-flex items-center gap-2 text-sm font-semibold text-[#B8860B]">
          <GraduationCap className="size-4" /> Real outcomes
        </p>
        <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-[#0b2545]">{title}</h2>
        <p className="mt-3 text-slate-600">{subtitle}</p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {projects.map((p, i) => (
          <article
            key={`${p.id}-${i}`}
            className="flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <div className={cn("relative bg-black", p.orientation === "portrait" ? "aspect-[9/16]" : "aspect-video")}>
              <VideoFacade videoId={p.id} thumbnail={poster(p.id)} title={p.title} />
            </div>
            <div className="flex flex-1 flex-col p-5">
              <h3 className="font-bold leading-snug text-[#0b2545]">{p.title}</h3>
              <div className="mt-4 flex items-center gap-3 border-t border-slate-100 pt-4">
                <span className="grid size-10 shrink-0 place-items-center rounded-full bg-[#0b2545]/10 font-bold text-[#0b2545]">
                  {p.student.charAt(0)}
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-[#0b2545]">{p.student}</p>
                  {p.jobTitle && <p className="truncate text-xs text-slate-500">{p.jobTitle}</p>}
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
