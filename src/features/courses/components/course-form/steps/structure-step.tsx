"use client";

import { useFormContext } from "react-hook-form";
import { useTranslations } from "next-intl";
import { Lightbulb } from "lucide-react";

import type { CourseFormValues } from "@/validations/course-schema";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
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
    </>
  );
}
