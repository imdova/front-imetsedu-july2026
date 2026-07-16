"use client";

import * as React from "react";
import { useFormContext } from "react-hook-form";
import { useTranslations } from "next-intl";
import {
  ArrowDown,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  GraduationCap,
  HelpCircle,
  Lightbulb,
  Plus,
  Route,
  Trash2,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { dal } from "@/lib/dal";
import type {
  CareerRoleValues,
  CourseFinalCtaValues,
  CourseFormValues,
  CourseFaqValues,
  WhyChooseItemValues,
} from "@/validations/course-schema";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FormSection } from "../form-section";
import { CurriculumBuilder } from "../curriculum-builder";

/** Converts between a one-item-per-line textarea and a string[] form value. */
function linesToArray(text: string): string[] {
  return text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
}

interface StructureStepProps {
  column?: "main" | "sidebar";
}

export function StructureStep({ column = "main" }: StructureStepProps) {
  if (column === "sidebar") {
    return null;
  }

  return <StructureMain />;
}

function StructureMain() {
  const { control } = useFormContext<CourseFormValues>();
  const t = useTranslations("CourseForm");

  return (
    <>
      <FormSection title={t("secLearning")} description={t("secLearningDesc")}>
        <div className="grid gap-5 lg:grid-cols-2">
          <FormField
            control={control}
            name="whatYouWillLearnEn"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2">
                  <Lightbulb className="size-4 text-amber-500" />
                  {t("fLearnEn")} <span className="text-destructive">*</span>
                </FormLabel>
                <FormControl>
                  <Textarea
                    rows={6}
                    placeholder={t("learnPlaceholderEn")}
                    defaultValue={field.value.join("\n")}
                    onChange={(e) => field.onChange(linesToArray(e.target.value))}
                  />
                </FormControl>
                <FormDescription>{t("learnHint")}</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="whatYouWillLearnAr"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("fLearnAr")}</FormLabel>
                <FormControl>
                  <Textarea
                    dir="rtl"
                    rows={6}
                    placeholder={t("learnPlaceholderAr")}
                    defaultValue={field.value.join("\n")}
                    onChange={(e) => field.onChange(linesToArray(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </FormSection>

      <FormSection title={t("secAudience")} description={t("secAudienceDesc")}>
        <div className="grid gap-5 lg:grid-cols-2">
          <FormField
            control={control}
            name="whoCanAttendEn"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("fAudienceEn")}</FormLabel>
                <FormControl>
                  <Textarea
                    rows={4}
                    placeholder={t("audiencePlaceholderEn")}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="whoCanAttendAr"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("fAudienceAr")}</FormLabel>
                <FormControl>
                  <Textarea
                    dir="rtl"
                    rows={4}
                    placeholder={t("audiencePlaceholderAr")}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </FormSection>

      <FormSection
        title={t("secCurriculum")}
        description={t("secCurriculumDesc")}
      >
        <CurriculumBuilder />
        <FormField
          control={control}
          name="modules"
          render={() => (
            <FormItem>
              <FormMessage />
            </FormItem>
          )}
        />
      </FormSection>

      <WhyChooseSection />
      <FaqsSection />
      <CareerRolesSection />
      <FinalCtaSection />
      <RelatedCoursesSection />
    </>
  );
}

/**
 * "Why Professionals Choose <course>" reason cards. Left empty, the public page
 * falls back to the shared IMETS reasons — so this is an override, not a
 * requirement, and the empty state says so.
 */
function WhyChooseSection() {
  const { watch, setValue } = useFormContext<CourseFormValues>();
  const t = useTranslations("CourseForm");
  const reasons = watch("whyChoose") ?? [];
  // The public heading is built from the course title, so show the real one here.
  const courseTitle = watch("titleEn") || t("whyChooseTitleFallback");

  const add = () => {
    const item: WhyChooseItemValues = { titleEn: "", titleAr: "", bodyEn: "", bodyAr: "" };
    setValue("whyChoose", [...reasons, item], { shouldDirty: true });
  };

  const update = (index: number, patch: Partial<WhyChooseItemValues>) =>
    setValue(
      "whyChoose",
      reasons.map((r, i) => (i === index ? { ...r, ...patch } : r)),
      { shouldDirty: true },
    );

  const remove = (index: number) =>
    setValue(
      "whyChoose",
      reasons.filter((_, i) => i !== index),
      { shouldDirty: true },
    );

  return (
    <FormSection
      title={t("secWhyChoose", { title: courseTitle })}
      description={t("secWhyChooseDesc")}
      action={
        <Button type="button" size="sm" className="gap-1.5" onClick={add}>
          <Plus className="size-4" />
          {t("addReason")}
        </Button>
      }
    >
      {reasons.length === 0 ? (
        <EmptyState icon={<CheckCircle2 className="size-8 opacity-50" />} text={t("noReasons")} />
      ) : (
        <div className="space-y-4">
          {reasons.map((reason, index) => (
            <div key={index} className="space-y-4 rounded-xl border bg-card p-4">
              <div className="flex items-start gap-3">
                <div className="grid flex-1 gap-4 sm:grid-cols-2">
                  <Field label={t("reasonTitleEn")}>
                    <Input
                      value={reason.titleEn}
                      onChange={(e) => update(index, { titleEn: e.target.value })}
                      placeholder={t("reasonTitleEnPh")}
                    />
                  </Field>
                  <Field label={t("reasonTitleAr")}>
                    <Input
                      dir="rtl"
                      value={reason.titleAr}
                      onChange={(e) => update(index, { titleAr: e.target.value })}
                      placeholder={t("reasonTitleArPh")}
                    />
                  </Field>
                </div>
                <RemoveButton onClick={() => remove(index)} label={t("removeReason")} />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label={t("reasonBodyEn")}>
                  <Textarea
                    rows={3}
                    value={reason.bodyEn}
                    onChange={(e) => update(index, { bodyEn: e.target.value })}
                    placeholder={t("reasonBodyEnPh")}
                  />
                </Field>
                <Field label={t("reasonBodyAr")}>
                  <Textarea
                    dir="rtl"
                    rows={3}
                    value={reason.bodyAr}
                    onChange={(e) => update(index, { bodyAr: e.target.value })}
                    placeholder={t("reasonBodyArPh")}
                  />
                </Field>
              </div>
            </div>
          ))}
        </div>
      )}
    </FormSection>
  );
}

/** FAQ accordion entries. Empty ⇒ the public page shows the shared defaults. */
function FaqsSection() {
  const { watch, setValue } = useFormContext<CourseFormValues>();
  const t = useTranslations("CourseForm");
  const faqs = watch("faqs") ?? [];

  const add = () => {
    const item: CourseFaqValues = { questionEn: "", questionAr: "", answerEn: "", answerAr: "" };
    setValue("faqs", [...faqs, item], { shouldDirty: true });
  };

  const update = (index: number, patch: Partial<CourseFaqValues>) =>
    setValue(
      "faqs",
      faqs.map((f, i) => (i === index ? { ...f, ...patch } : f)),
      { shouldDirty: true },
    );

  const remove = (index: number) =>
    setValue(
      "faqs",
      faqs.filter((_, i) => i !== index),
      { shouldDirty: true },
    );

  return (
    <FormSection
      title={t("secFaqs")}
      description={t("secFaqsDesc")}
      action={
        <Button type="button" size="sm" className="gap-1.5" onClick={add}>
          <Plus className="size-4" />
          {t("addFaq")}
        </Button>
      }
    >
      {faqs.length === 0 ? (
        <EmptyState icon={<HelpCircle className="size-8 opacity-50" />} text={t("noFaqs")} />
      ) : (
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div key={index} className="space-y-4 rounded-xl border bg-card p-4">
              <div className="flex items-start gap-3">
                <div className="grid flex-1 gap-4 sm:grid-cols-2">
                  <Field label={t("faqQuestionEn")}>
                    <Input
                      value={faq.questionEn}
                      onChange={(e) => update(index, { questionEn: e.target.value })}
                      placeholder={t("faqQuestionEnPh")}
                    />
                  </Field>
                  <Field label={t("faqQuestionAr")}>
                    <Input
                      dir="rtl"
                      value={faq.questionAr}
                      onChange={(e) => update(index, { questionAr: e.target.value })}
                      placeholder={t("faqQuestionArPh")}
                    />
                  </Field>
                </div>
                <RemoveButton onClick={() => remove(index)} label={t("removeFaq")} />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label={t("faqAnswerEn")}>
                  <Textarea
                    rows={3}
                    value={faq.answerEn}
                    onChange={(e) => update(index, { answerEn: e.target.value })}
                    placeholder={t("faqAnswerEnPh")}
                  />
                </Field>
                <Field label={t("faqAnswerAr")}>
                  <Textarea
                    dir="rtl"
                    rows={3}
                    value={faq.answerAr}
                    onChange={(e) => update(index, { answerAr: e.target.value })}
                    placeholder={t("faqAnswerArPh")}
                  />
                </Field>
              </div>
            </div>
          ))}
        </div>
      )}
    </FormSection>
  );
}

/**
 * "Career Outcomes" ladder. Array order IS the progression rendered on the
 * public page (entry level first), which is why entries move up/down rather
 * than carrying a rank field. Empty ⇒ the page falls back to its bundled ladder.
 */
function CareerRolesSection() {
  const { watch, setValue } = useFormContext<CourseFormValues>();
  const t = useTranslations("CourseForm");
  const roles = watch("careerRoles") ?? [];

  const commit = (next: CareerRoleValues[]) =>
    setValue("careerRoles", next, { shouldDirty: true });

  const add = () => commit([...roles, { titleEn: "", titleAr: "" }]);

  const update = (index: number, patch: Partial<CareerRoleValues>) =>
    commit(roles.map((r, i) => (i === index ? { ...r, ...patch } : r)));

  const remove = (index: number) => commit(roles.filter((_, i) => i !== index));

  const move = (index: number, dir: -1 | 1) => {
    const to = index + dir;
    if (to < 0 || to >= roles.length) return;
    const next = [...roles];
    [next[index], next[to]] = [next[to], next[index]];
    commit(next);
  };

  return (
    <FormSection
      title={t("secCareerRoles")}
      description={t("secCareerRolesDesc")}
      action={
        <Button type="button" size="sm" className="gap-1.5" onClick={add}>
          <Plus className="size-4" />
          {t("addCareerRole")}
        </Button>
      }
    >
      {roles.length === 0 ? (
        <EmptyState icon={<Route className="size-8 opacity-50" />} text={t("noCareerRoles")} />
      ) : (
        <div className="space-y-2">
          {roles.map((role, index) => (
            <div key={index}>
              <div className="flex items-start gap-3 rounded-xl border bg-card p-4">
                <span className="mt-2 grid size-7 shrink-0 place-items-center rounded-full bg-primary/10 text-xs font-bold tabular-nums text-primary">
                  {index + 1}
                </span>
                <div className="grid flex-1 gap-4 sm:grid-cols-2">
                  <Field label={t("careerRoleEn")}>
                    <Input
                      value={role.titleEn}
                      onChange={(e) => update(index, { titleEn: e.target.value })}
                      placeholder={t("careerRoleEnPlaceholder")}
                    />
                  </Field>
                  <Field label={t("careerRoleAr")}>
                    <Input
                      dir="rtl"
                      value={role.titleAr}
                      onChange={(e) => update(index, { titleAr: e.target.value })}
                      placeholder={t("careerRoleArPlaceholder")}
                    />
                  </Field>
                </div>
                <div className="flex shrink-0 flex-col gap-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="size-7"
                    disabled={index === 0}
                    aria-label={t("moveUp")}
                    onClick={() => move(index, -1)}
                  >
                    <ChevronUp className="size-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="size-7"
                    disabled={index === roles.length - 1}
                    aria-label={t("moveDown")}
                    onClick={() => move(index, 1)}
                  >
                    <ChevronDown className="size-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="size-7 text-destructive"
                    aria-label={t("removeCareerRole")}
                    onClick={() => remove(index)}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </div>
              {index < roles.length - 1 && (
                <div className="flex justify-center py-0.5">
                  <ArrowDown className="size-3.5 text-muted-foreground/50" aria-hidden />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </FormSection>
  );
}

/**
 * The closing CTA. Leave the heading blank and the page uses its bundled line —
 * that fallback is why the heading, not the body, is what decides whether this
 * counts as "set".
 */
function FinalCtaSection() {
  const { watch, setValue } = useFormContext<CourseFormValues>();
  const t = useTranslations("CourseForm");
  const cta = watch("finalCta") ?? { headingEn: "", headingAr: "", bodyEn: "", bodyAr: "" };

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
        <p className="mt-3 text-[11px] text-muted-foreground">{t("ctaFallbackNote")}</p>
      )}
    </FormSection>
  );
}

/**
 * "Continue Your Professional Journey" — curated by slug, because the slug is
 * the link target. Empty ⇒ the public page falls back to same-category courses,
 * which is the behaviour every existing course keeps until someone picks here.
 */
function RelatedCoursesSection() {
  const { watch, setValue } = useFormContext<CourseFormValues>();
  const t = useTranslations("CourseForm");
  const selected = watch("relatedCourseSlugs") ?? [];
  const ownSlug = watch("slug");
  const [options, setOptions] = React.useState<{ slug: string; title: string }[]>([]);

  // Published only: a draft has no public page to link to.
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
      selected.includes(slug) ? selected.filter((x) => x !== slug) : [...selected, slug],
      { shouldDirty: true },
    );

  return (
    <FormSection title={t("secRelatedCourses")} description={t("secRelatedCoursesDesc")}>
      {pickable.length === 0 ? (
        <EmptyState
          icon={<GraduationCap className="size-8 opacity-50" />}
          text={t("noRelatedOptions")}
        />
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
                    on ? "border-primary bg-primary text-primary-foreground" : "border-border",
                  )}
                >
                  {on && <CheckCircle2 className="size-3" />}
                </span>
                <span className="min-w-0 flex-1 truncate font-medium">{o.title}</span>
                <span className="shrink-0 text-[11px] text-muted-foreground/70">/{o.slug}</span>
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

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">{label}</label>
      {children}
    </div>
  );
}

function RemoveButton({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <Button type="button" variant="ghost" size="icon" onClick={onClick} aria-label={label}>
      <Trash2 className="size-4 text-destructive" />
    </Button>
  );
}

function EmptyState({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed py-10 text-center text-muted-foreground">
      {icon}
      <p className="text-sm">{text}</p>
    </div>
  );
}
