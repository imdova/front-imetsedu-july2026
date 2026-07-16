"use client";

import { ArrowRight } from "lucide-react";

import { cn } from "@/lib/utils";
import type { CourseAboutData } from "@/features/marketing/lib/course-about";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const tr = (locale: string, en: string, ar: string) => (locale === "ar" ? ar : en);

/**
 * About — short on-page summary + Learn More modal for the longer story.
 */
export function CourseAbout({
  locale,
  about,
  imageUrl,
  imageAlt,
  heading,
}: {
  locale: string;
  about: CourseAboutData;
  imageUrl?: string;
  imageAlt?: string;
  /** Override the section title (the page picks "Diploma" vs "Program"). */
  heading?: string;
}) {
  return (
    <section id="overview" className="scroll-mt-32" dir={locale === "ar" ? "rtl" : "ltr"}>
      <div
        className={cn(
          "grid items-center gap-8 lg:gap-12",
          imageUrl && "lg:grid-cols-2",
        )}
      >
        {imageUrl ? (
          <div className="relative aspect-[5/4] overflow-hidden rounded-[1.75rem] bg-muted shadow-lg ring-1 ring-border/50 lg:order-1">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={imageUrl} alt={imageAlt ?? ""} loading="lazy" decoding="async" className="size-full object-cover" />
          </div>
        ) : null}
        <div className={cn(imageUrl && "lg:order-2")}>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
            {tr(locale, "The program", "البرنامج")}
          </p>
          {/* h2: this is a section title and the page's heading order is
              load-bearing for SEO. */}
          <h2 className="mt-2 font-heading text-2xl font-bold tracking-tight sm:text-3xl">
            {heading ?? tr(locale, "About This Diploma", "عن هذه الدبلومة")}
          </h2>
          <p className="mt-5 text-base leading-relaxed text-muted-foreground sm:text-lg sm:leading-relaxed">
            {about.summary}
          </p>

          {about.more.length > 0 && (
            <Dialog>
              <DialogTrigger asChild>
                <Button
                  type="button"
                  variant="link"
                  className="mt-4 h-auto gap-1.5 px-0 text-base font-semibold text-primary"
                >
                  {tr(locale, "Learn More", "اعرف المزيد")}
                  <ArrowRight className="size-4 rtl:rotate-180" />
                </Button>
              </DialogTrigger>
              <DialogContent className="max-h-[min(85vh,36rem)] gap-0 overflow-hidden p-0 sm:max-w-lg">
                <DialogHeader className="border-b border-border/60 px-6 py-5 text-start">
                  <DialogTitle className="font-heading text-xl">
                    {tr(locale, "About This Diploma", "عن هذه الدبلومة")}
                  </DialogTitle>
                  <DialogDescription className="sr-only">
                    {tr(locale, "More detail about the program", "المزيد عن البرنامج")}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 overflow-y-auto px-6 py-5">
                  {about.more.map((p) => (
                    <p key={p.slice(0, 40)} className="text-sm leading-relaxed text-muted-foreground sm:text-[0.9375rem]">
                      {p}
                    </p>
                  ))}
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>
    </section>
  );
}
