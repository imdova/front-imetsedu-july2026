"use client";

import Image from "next/image";
import { useFormContext } from "react-hook-form";
import { useTranslations } from "next-intl";
import {
  PlayCircle,
  MessageSquareQuote,
  Plus,
  Trash2,
  Star,
} from "lucide-react";

import type { CourseFormValues, TextReviewValues } from "@/validations/course-schema";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ImageUpload } from "@/components/shared/image-upload";
import { FormSection } from "../form-section";

const GALLERY_SLOTS = 8;
const VIDEO_SLOTS = 7;
const RESULT_SLOTS = 7;

interface MediaReviewsStepProps {
  column?: "main" | "sidebar";
}

export function MediaReviewsStep({ column = "main" }: MediaReviewsStepProps) {
  if (column === "sidebar") return null;
  return <MediaReviewsMain />;
}

function MediaReviewsMain() {
  const t = useTranslations("CourseForm");

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-lg font-semibold">{t("stepMediaTitle")}</h2>
        <p className="text-sm text-muted-foreground">{t("stepMediaDesc")}</p>
      </div>

      <AlumniPhotosSection />
      <VideoReviewsSection />
      <StudentResultsSection />
      <TextTestimonialsSection />
    </div>
  );
}

function AlumniPhotosSection() {
  const { watch, setValue } = useFormContext<CourseFormValues>();
  const t = useTranslations("CourseForm");
  const gallery = watch("gallery") ?? [];
  const slots = padArray(gallery, GALLERY_SLOTS);

  const setSlot = (index: number, url: string) => {
    const next = [...slots];
    next[index] = url;
    setValue(
      "gallery",
      next.filter(Boolean),
      { shouldDirty: true },
    );
  };

  return (
    <FormSection
      title={t("secAlumniPhotos")}
      description={t("secAlumniPhotosDesc")}
      action={
        <Button type="button" variant="outline" size="sm" className="gap-1.5">
          <Plus className="size-4" />
          {t("addPhotos")}
        </Button>
      }
    >
      <div className="space-y-3">
        <MediaSlot
          label={t("headerPhoto")}
          value={slots[0]}
          onChange={(url) => setSlot(0, url)}
          className="aspect-[3/1] min-h-24"
        />
        <div className="grid gap-3 sm:grid-cols-[1fr_2fr]">
          <MediaSlot
            label={t("featurePhoto")}
            value={slots[1]}
            onChange={(url) => setSlot(1, url)}
            className="min-h-48 sm:row-span-2"
          />
          <div className="grid grid-cols-3 gap-3">
            {Array.from({ length: 6 }, (_, i) => (
              <MediaSlot
                key={i}
                label={t("photoN", { n: i + 3 })}
                value={slots[i + 2]}
                onChange={(url) => setSlot(i + 2, url)}
                className="aspect-square min-h-20"
                compact
              />
            ))}
          </div>
        </div>
      </div>
    </FormSection>
  );
}

function VideoReviewsSection() {
  const { watch, setValue } = useFormContext<CourseFormValues>();
  const t = useTranslations("CourseForm");
  const reviews = watch("videosReviews") ?? [];
  const urls = padArray(
    reviews.map((r) => r.url),
    VIDEO_SLOTS,
  );

  const setUrl = (index: number, url: string) => {
    const next = urls.map((u, i) => (i === index ? url : u));
    setValue(
      "videosReviews",
      next.filter(Boolean).map((url) => ({ url })),
      { shouldDirty: true },
    );
  };

  return (
    <FormSection
      title={t("secVideoReviews")}
      description={t("secVideoReviewsDesc")}
    >
      <div className="grid gap-3 sm:grid-cols-[1fr_2fr]">
        <VideoSlot
          label={t("featureVideo")}
          value={urls[0]}
          onChange={(url) => setUrl(0, url)}
          className="min-h-48"
        />
        <div className="grid grid-cols-3 gap-3">
          {Array.from({ length: 6 }, (_, i) => (
            <VideoSlot
              key={i}
              label={t("videoN", { n: i + 2 })}
              value={urls[i + 1]}
              onChange={(url) => setUrl(i + 1, url)}
              className="aspect-square min-h-20"
              compact
            />
          ))}
        </div>
      </div>
    </FormSection>
  );
}

function StudentResultsSection() {
  const { watch, setValue } = useFormContext<CourseFormValues>();
  const t = useTranslations("CourseForm");
  const reviews = watch("imagesReviews") ?? [];
  const urls = padArray(
    reviews.map((r) => r.url),
    RESULT_SLOTS,
  );

  const setUrl = (index: number, url: string) => {
    const next = urls.map((u, i) => (i === index ? url : u));
    setValue(
      "imagesReviews",
      next.filter(Boolean).map((url) => ({ url })),
      { shouldDirty: true },
    );
  };

  return (
    <FormSection
      title={t("secResultPhotos")}
      description={t("secResultPhotosDesc")}
    >
      <div className="grid gap-3 sm:grid-cols-[1fr_2fr]">
        <MediaSlot
          label={t("featurePhoto")}
          value={urls[0]}
          onChange={(url) => setUrl(0, url)}
          className="min-h-48"
        />
        <div className="grid grid-cols-3 gap-3">
          {Array.from({ length: 6 }, (_, i) => (
            <MediaSlot
              key={i}
              label={t("photoN", { n: i + 2 })}
              value={urls[i + 1]}
              onChange={(url) => setUrl(i + 1, url)}
              className="aspect-square min-h-20"
              compact
            />
          ))}
        </div>
      </div>
    </FormSection>
  );
}

function TextTestimonialsSection() {
  const { watch, setValue } = useFormContext<CourseFormValues>();
  const t = useTranslations("CourseForm");
  const reviews = watch("textReviews") ?? [];

  const addReview = () => {
    const item: TextReviewValues = {
      reviewerName: "",
      title: "",
      reviewerImage: "",
      rating: 5,
      comment: "",
    };
    setValue("textReviews", [...reviews, item], { shouldDirty: true });
  };

  const updateReview = (index: number, patch: Partial<TextReviewValues>) => {
    setValue(
      "textReviews",
      reviews.map((r, i) => (i === index ? { ...r, ...patch } : r)),
      { shouldDirty: true },
    );
  };

  const removeReview = (index: number) => {
    setValue(
      "textReviews",
      reviews.filter((_, i) => i !== index),
      { shouldDirty: true },
    );
  };

  return (
    <FormSection
      title={t("secTestimonials")}
      description={t("secTestimonialsDesc")}
      action={
        <Button
          type="button"
          size="sm"
          className="gap-1.5"
          onClick={addReview}
        >
          <Plus className="size-4" />
          {t("addTestimonial")}
        </Button>
      }
    >
      {reviews.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed py-10 text-center text-muted-foreground">
          <MessageSquareQuote className="size-8 opacity-50" />
          <p className="text-sm">{t("noTestimonials")}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review, index) => (
            <div
              key={index}
              className="space-y-4 rounded-xl border bg-card p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="grid flex-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      {t("reviewerName")}
                    </label>
                    <Input
                      value={review.reviewerName}
                      onChange={(e) =>
                        updateReview(index, { reviewerName: e.target.value })
                      }
                      placeholder={t("reviewerNamePh")}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      {t("reviewerTitle")}
                    </label>
                    <Input
                      value={review.title}
                      onChange={(e) =>
                        updateReview(index, { title: e.target.value })
                      }
                      placeholder={t("reviewerTitlePh")}
                    />
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeReview(index)}
                  aria-label={t("removeTestimonial")}
                >
                  <Trash2 className="size-4 text-destructive" />
                </Button>
              </div>

              <div className="grid gap-4 sm:grid-cols-[120px_1fr]">
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    {t("reviewerPhoto")}
                  </label>
                  <ImageUpload
                    value={review.reviewerImage}
                    onChange={(url) =>
                      updateReview(index, { reviewerImage: url })
                    }
                    className="aspect-square"
                    hint={t("imageHint")}
                  />
                </div>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">{t("rating")}</label>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => updateReview(index, { rating: star })}
                          className="rounded p-0.5 transition-colors hover:bg-muted"
                        >
                          <Star
                            className={cn(
                              "size-5",
                              star <= review.rating
                                ? "fill-amber-400 text-amber-400"
                                : "text-muted-foreground/40",
                            )}
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      {t("reviewComment")}
                    </label>
                    <Textarea
                      rows={3}
                      value={review.comment}
                      onChange={(e) =>
                        updateReview(index, { comment: e.target.value })
                      }
                      placeholder={t("reviewCommentPh")}
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </FormSection>
  );
}

function MediaSlot({
  label,
  value,
  onChange,
  className,
  compact,
}: {
  label: string;
  value: string;
  onChange: (url: string) => void;
  className?: string;
  compact?: boolean;
}) {
  const t = useTranslations("CourseForm");

  if (value) {
    return (
      <div
        className={cn(
          "relative overflow-hidden rounded-lg border",
          className,
        )}
      >
        <Image src={value} alt={label} fill className="object-cover" />
        <Button
          type="button"
          variant="secondary"
          size="sm"
          className="absolute bottom-2 end-2"
          onClick={() => onChange("")}
        >
          {t("remove")}
        </Button>
      </div>
    );
  }

  return (
    <ImageUpload
      value=""
      onChange={onChange}
      label={compact ? label : t("dropOrBrowse")}
      hint={compact ? undefined : t("imageHint")}
      className={className}
    />
  );
}

function VideoSlot({
  label,
  value,
  onChange,
  className,
  compact,
}: {
  label: string;
  value: string;
  onChange: (url: string) => void;
  className?: string;
  compact?: boolean;
}) {
  const t = useTranslations("CourseForm");

  return (
    <div
      className={cn(
        "flex flex-col gap-2 rounded-lg border bg-muted/20 p-3",
        className,
      )}
    >
      {!compact && (
        <div className="flex items-center gap-2 text-sm font-medium">
          <PlayCircle className="size-4 text-red-500" />
          {label}
        </div>
      )}
      <Input
        dir="ltr"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={compact ? label : t("videoUrlPh")}
        className={compact ? "h-8 text-xs" : undefined}
      />
    </div>
  );
}

function padArray(values: string[], length: number): string[] {
  return Array.from({ length }, (_, i) => values[i] ?? "");
}
