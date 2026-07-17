"use client";

import * as React from "react";
import { useFormContext } from "react-hook-form";
import { useTranslations } from "next-intl";
import { CheckCircle2, GraduationCap } from "lucide-react";

import { cn } from "@/lib/utils";
import { dal } from "@/lib/dal";
import type {
  CourseFinalCtaValues,
  CourseFormValues,
  CourseHeadingsValues,
} from "@/validations/course-schema";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FormSection } from "./form-section";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">{label}</label>
      {children}
    </div>
  );
}

/**
 * The closing CTA. Leave the heading blank and the page uses its bundled line —
 * that fallback is why the heading, not the body, is what decides whether this
 * counts as "set".
 */
export function FinalCtaSection() {
  const { watch, setValue } = useFormContext<CourseFormValues>();
  const t = useTranslations("CourseForm");
  const cta = watch("finalCta") ?? {
    headingEn: "",
    headingAr: "",
    bodyEn: "",
    bodyAr: "",
  };

  const set = (patch: Partial<CourseFinalCtaValues>) =>
    setValue("finalCta", { ...cta, ...patch }, { shouldDirty: true });

  return (
    <FormSection title={t("secFinalCta")} description={t("secFinalCtaDesc")}>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label={t("ctaHeadingEn")}>
          <Input
            value={cta.headingEn}
            onChange={(e) => set({ headingEn: e.target.value })}
            placeholder={t("ctaHeadingEnPlaceholder")}
          />
        </Field>
        <Field label={t("ctaHeadingAr")}>
          <Input
            dir="rtl"
            value={cta.headingAr}
            onChange={(e) => set({ headingAr: e.target.value })}
            placeholder={t("ctaHeadingArPlaceholder")}
          />
        </Field>
        <Field label={t("ctaBodyEn")}>
          <Textarea
            rows={2}
            value={cta.bodyEn}
            onChange={(e) => set({ bodyEn: e.target.value })}
            placeholder={t("ctaBodyEnPlaceholder")}
          />
        </Field>
        <Field label={t("ctaBodyAr")}>
          <Textarea
            dir="rtl"
            rows={2}
            value={cta.bodyAr}
            onChange={(e) => set({ bodyAr: e.target.value })}
            placeholder={t("ctaBodyArPlaceholder")}
          />
        </Field>
      </div>
      {!cta.headingEn && !cta.headingAr && (
        <p className="mt-3 text-[11px] text-muted-foreground">
          {t("ctaFallbackNote")}
        </p>
      )}
    </FormSection>
  );
}

/**
 * Section H2s. Each blank field falls back on its own to the page's generic
 * heading, so filling one in does not commit you to filling the rest.
 */
export function HeadingsSection() {
  const { watch, setValue } = useFormContext<CourseFormValues>();
  const t = useTranslations("CourseForm");
  const h = watch("headings");
  const program = watch("titleEn") || t("whyChooseTitleFallback");

  const set = (patch: Partial<CourseHeadingsValues>) =>
    setValue("headings", { ...h, ...patch }, { shouldDirty: true });

  const rows: {
    key: keyof CourseHeadingsValues;
    arKey: keyof CourseHeadingsValues;
    label: string;
    ph: string;
  }[] = [
    {
      key: "whyChooseEn",
      arKey: "whyChooseAr",
      label: t("hWhyChoose"),
      ph: t("hWhyChoosePh", { program }),
    },
    {
      key: "audienceEn",
      arKey: "audienceAr",
      label: t("hAudience"),
      ph: t("hAudiencePh", { program }),
    },
    {
      key: "aboutEn",
      arKey: "aboutAr",
      label: t("hAbout"),
      ph: t("hAboutPh"),
    },
    {
      key: "learnEn",
      arKey: "learnAr",
      label: t("hLearn"),
      ph: t("hLearnPh", { program }),
    },
    {
      key: "careersEn",
      arKey: "careersAr",
      label: t("hCareers"),
      ph: t("hCareersPh", { program }),
    },
    {
      key: "faqEn",
      arKey: "faqAr",
      label: t("hFaq"),
      ph: t("hFaqPh"),
    },
  ];

  return (
    <FormSection title={t("secHeadings")} description={t("secHeadingsDesc")}>
      <div className="space-y-3">
        {rows.map((r) => (
          <div
            key={r.key}
            className="grid gap-3 sm:grid-cols-[10rem_1fr_1fr] sm:items-center"
          >
            <span className="text-xs font-medium text-muted-foreground">
              {r.label}
            </span>
            <Input
              value={h?.[r.key] ?? ""}
              onChange={(e) =>
                set({ [r.key]: e.target.value } as Partial<CourseHeadingsValues>)
              }
              placeholder={r.ph}
            />
            <Input
              dir="rtl"
              value={h?.[r.arKey] ?? ""}
              onChange={(e) =>
                set({
                  [r.arKey]: e.target.value,
                } as Partial<CourseHeadingsValues>)
              }
              placeholder={t("hArabicPh")}
            />
          </div>
        ))}
      </div>
    </FormSection>
  );
}

/**
 * "Continue Your Professional Journey" — curated by slug. Empty ⇒ same-category
 * courses on the public page.
 */
export function RelatedCoursesSection() {
  const { watch, setValue } = useFormContext<CourseFormValues>();
  const t = useTranslations("CourseForm");
  const selected = watch("relatedCourseSlugs") ?? [];
  const ownSlug = watch("slug");
  const [options, setOptions] = React.useState<
    { slug: string; title: string }[]
  >([]);

  React.useEffect(() => {
    let alive = true;
    (async () => {
      const res = await dal.courses.fetchCourses({ status: "published" });
      if (!alive || !res.ok) return;
      setOptions(
        res.data
          .filter((c) => c.slug)
          .map((c) => ({ slug: c.slug, title: c.titleEn }))
          .sort((a, b) => a.title.localeCompare(b.title)),
      );
    })();
    return () => {
      alive = false;
    };
  }, []);

  const pickable = options.filter((o) => o.slug !== ownSlug);

  const toggle = (slug: string) =>
    setValue(
      "relatedCourseSlugs",
      selected.includes(slug)
        ? selected.filter((x) => x !== slug)
        : [...selected, slug],
      { shouldDirty: true },
    );

  return (
    <FormSection
      title={t("secRelatedCourses")}
      description={t("secRelatedCoursesDesc")}
    >
      {pickable.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed py-10 text-center text-muted-foreground">
          <GraduationCap className="size-8 opacity-50" />
          <p className="text-sm">{t("noRelatedOptions")}</p>
        </div>
      ) : (
        <div className="max-h-64 space-y-0.5 overflow-y-auto rounded-xl border p-1.5">
          {pickable.map((o) => {
            const on = selected.includes(o.slug);
            return (
              <button
                key={o.slug}
                type="button"
                onClick={() => toggle(o.slug)}
                className={cn(
                  "flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-start text-sm transition-colors",
                  on
                    ? "bg-primary/10 text-foreground ring-1 ring-primary/20"
                    : "text-muted-foreground hover:bg-muted/60",
                )}
              >
                <span
                  className={cn(
                    "grid size-4 shrink-0 place-items-center rounded border",
                    on
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border",
                  )}
                >
                  {on && <CheckCircle2 className="size-3" />}
                </span>
                <span className="min-w-0 flex-1 truncate font-medium">
                  {o.title}
                </span>
                <span className="shrink-0 text-[11px] text-muted-foreground/70">
                  /{o.slug}
                </span>
              </button>
            );
          })}
        </div>
      )}
      {selected.length > 0 && (
        <p className="mt-2 text-[11px] text-primary">
          {t("relatedSelected", { count: selected.length })}
        </p>
      )}
    </FormSection>
  );
}
