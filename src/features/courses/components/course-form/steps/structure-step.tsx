"use client";

import { useFormContext } from "react-hook-form";
import { useTranslations } from "next-intl";
import { CheckCircle2, HelpCircle, Lightbulb, Plus, Trash2 } from "lucide-react";

import type {
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
