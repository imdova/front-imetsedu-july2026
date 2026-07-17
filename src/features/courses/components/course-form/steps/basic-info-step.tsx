"use client";

import * as React from "react";
import { useFormContext } from "react-hook-form";
import { useTranslations } from "next-intl";
import { Wand2, ChevronDown } from "lucide-react";

import type { CourseFormValues } from "@/validations/course-schema";
import { slugify, cn } from "@/lib/utils";
import {
  DIFFICULTY_OPTIONS,
  PROGRAM_TYPE_OPTIONS,
  ATTENDANCE_MODE_OPTIONS,
  LANGUAGE_OPTIONS,
} from "@/constants/course-options";
import type {
  CategoryLookup,
  InstructorLookup,
  LanguageOption,
  LookupItem,
} from "@/types";

import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RichTextEditor } from "@/components/shared/rich-text-editor/editor";
import { ImageUpload } from "@/components/shared/image-upload";
import { FileUpload } from "@/components/shared/file-upload";
import { MultiSelect } from "@/components/shared/multi-select";
import { FormSection } from "../form-section";
import { PricingSection } from "../pricing-section";
import { SeoPanel } from "../seo-panel";
import { UPLOAD_LIMITS } from "@/constants/course-options";

interface Props {
  categories: CategoryLookup[];
  instructors: InstructorLookup[];
  tags: LookupItem[];
  /** Program-type options from live course variables (falls back to defaults). */
  programTypes?: { value: string; label: string }[];
  column?: "main" | "sidebar";
}

export function BasicInfoStep({
  categories,
  instructors,
  tags,
  programTypes,
  column = "main",
}: Props) {
  if (column === "sidebar") {
    return (
      <BasicInfoSidebar instructors={instructors} tags={tags} />
    );
  }

  return <BasicInfoMain categories={categories} programTypes={programTypes} />;
}

function BasicInfoMain({
  categories,
  programTypes,
}: {
  categories: CategoryLookup[];
  programTypes?: { value: string; label: string }[];
}) {
  const { control, setValue, getValues, watch } = useFormContext<CourseFormValues>();
  const t = useTranslations("CourseForm");
  // Prefer live program types; keep the static list as a fallback.
  const programOptions = programTypes?.length ? programTypes : PROGRAM_TYPE_OPTIONS;
  const [contentOpen, setContentOpen] = React.useState(true);
  const [showDescriptionAr, setShowDescriptionAr] = React.useState(false);
  const descriptionAr = watch("descriptionAr");
  const hasDescriptionAr = Boolean(
    typeof descriptionAr === "string" && descriptionAr.replace(/<[^>]*>/g, "").trim(),
  );

  const regenerateSlug = () =>
    setValue("slug", slugify(getValues("titleEn")), { shouldValidate: true });

  return (
    <>
      <FormSection
        title={t("secIdentification")}
        description={t("secIdentificationDesc")}
      >
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <FormField
            control={control}
            name="titleEn"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  {t("fTitleEn")} <Required />
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="e.g. Advanced Software Engineering"
                    {...field}
                    onBlur={(e) => {
                      field.onBlur();
                      if (!getValues("slug") && e.target.value) {
                        setValue("slug", slugify(e.target.value), {
                          shouldValidate: true,
                        });
                      }
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="titleAr"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  {t("fTitleAr")} <Required />
                </FormLabel>
                <FormControl>
                  <Input
                    dir="rtl"
                    placeholder="مثال: هندسة البرمجيات المتقدمة"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={control}
          name="slug"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                {t("fSlug")} <Required />
              </FormLabel>
              <div className="flex gap-2">
                <FormControl>
                  <Input
                    dir="ltr"
                    placeholder="advanced-software-engineering"
                    {...field}
                  />
                </FormControl>
                <Button
                  type="button"
                  variant="outline"
                  onClick={regenerateSlug}
                  className="shrink-0 gap-1.5"
                >
                  <Wand2 className="size-4" />
                  {t("generate")}
                </Button>
              </div>
              <FormDescription>{t("fSlugHint")}</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </FormSection>

      <FormSection
        title={t("secPricing")}
        description={t("secPricingDesc")}
        collapsible
        defaultOpen
      >
        <PricingSection />
      </FormSection>

      <FormSection
        title={t("secClassification")}
        description={t("secClassificationDesc")}
      >
        <div className="grid gap-5 sm:grid-cols-2">
          <FormField
            control={control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  {t("fCategory")} <Required />
                </FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={t("selectCategory")} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {categories.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="programType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  {t("fProgramType")} <Required />
                </FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={t("selectProgramType")} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {programOptions.map((p) => (
                      <SelectItem key={p.value} value={p.value}>
                        {p.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="difficulty"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  {t("fDifficulty")} <Required />
                </FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {DIFFICULTY_OPTIONS.map((d) => (
                      <SelectItem key={d.value} value={d.value}>
                        {d.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={control}
          name="attendanceMode"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                {t("fAttendance")} <Required />
              </FormLabel>
              <FormControl>
                <div className="flex flex-wrap gap-2">
                  {ATTENDANCE_MODE_OPTIONS.map((m) => {
                    const active = field.value === m.value;
                    return (
                      <button
                        key={m.value}
                        type="button"
                        onClick={() => field.onChange(m.value)}
                        className={cn(
                          "rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
                          active
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border text-muted-foreground hover:border-primary/40",
                        )}
                      >
                        {m.label}
                      </button>
                    );
                  })}
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </FormSection>

      <FormSection title={t("secHero")} description={t("secHeroDesc")}>
        <div className="grid gap-5 sm:grid-cols-2">
          <FormField
            control={control}
            name="headlineEn"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("fHeadlineEn")}</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. Become a Certified Healthcare Quality Professional" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="headlineAr"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("fHeadlineAr")}</FormLabel>
                <FormControl>
                  <Input dir="rtl" placeholder="مثال: كن متخصص جودة رعاية صحية معتمد" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="subHeadlineEn"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("fSubHeadlineEn")}</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. Prepare confidently through live instruction and expert mentorship" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="subHeadlineAr"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("fSubHeadlineAr")}</FormLabel>
                <FormControl>
                  <Input dir="rtl" placeholder="مثال: استعد للامتحان بثقة عبر التدريب المباشر" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormDescription>{t("fHeroHint")}</FormDescription>
      </FormSection>

      <FormSection
        title={t("secContent")}
        description={t("secContentDesc")}
        collapsible
        open={contentOpen}
        onOpenChange={setContentOpen}
      >
        <FormField
          control={control}
          name="descriptionEn"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                {t("fDescriptionEn")} <Required />
              </FormLabel>
              <FormControl>
                <RichTextEditor
                  value={field.value}
                  onChange={field.onChange}
                  placeholder={t("descPlaceholderEn")}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="rounded-lg border border-border/60 bg-muted/20">
          <button
            type="button"
            onClick={() => setShowDescriptionAr((v) => !v)}
            className="flex w-full items-center justify-between gap-3 px-3.5 py-2.5 text-start text-sm font-medium text-foreground transition-colors hover:bg-muted/40"
            aria-expanded={showDescriptionAr}
          >
            <span className="flex items-center gap-2">
              {t("fDescriptionAr")}
              {hasDescriptionAr && !showDescriptionAr ? (
                <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary">
                  {t("filled")}
                </span>
              ) : null}
            </span>
            <ChevronDown
              className={cn(
                "size-4 shrink-0 text-muted-foreground transition-transform",
                showDescriptionAr && "rotate-180",
              )}
            />
          </button>
          {showDescriptionAr ? (
            <div className="border-t border-border/60 px-3.5 pb-3.5 pt-3">
              <FormField
                control={control}
                name="descriptionAr"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <RichTextEditor
                        value={field.value}
                        onChange={field.onChange}
                        dir="rtl"
                        placeholder={t("descPlaceholderAr")}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          ) : null}
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
    </>
  );
}

function BasicInfoSidebar({
  instructors,
  tags,
}: {
  instructors: InstructorLookup[];
  tags: LookupItem[];
}) {
  const { control } = useFormContext<CourseFormValues>();
  const t = useTranslations("CourseForm");

  return (
    <>
      <FormSection title={t("secCoverPreview")}>
        <FormField
          control={control}
          name="image"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                {t("fImage")} <Required />
              </FormLabel>
              <FormControl>
                <ImageUpload
                  value={field.value}
                  onChange={field.onChange}
                  label={t("dropOrBrowse")}
                  hint={t("imageHint")}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </FormSection>

      <FormSection title={t("secMediaExtras")}>
        <FormField
          control={control}
          name="previewVideoUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("fPreviewVideo")}</FormLabel>
              <FormControl>
                <Input
                  dir="ltr"
                  placeholder="https://www.youtube.com/watch?v=…"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="courseOverviewFile"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("fCourseOverview")}</FormLabel>
              <FormControl>
                <FileUpload
                  value={field.value}
                  onChange={field.onChange}
                  label={t("dropOrBrowsePdf")}
                  hint={t("overviewPdfHint", {
                    size: UPLOAD_LIMITS.overviewPdfMb,
                  })}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </FormSection>

      <FormSection title={t("secDetails")}>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-1">
          <FormField
            control={control}
            name="students"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("fStudents")}</FormLabel>
                <FormControl>
                  <Input type="number" min={0} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="lectures"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("fLectures")}</FormLabel>
                <FormControl>
                  <Input type="number" min={0} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="duration"
            render={({ field }) => (
              <FormItem className="sm:col-span-2 lg:col-span-1">
                <FormLabel>
                  {t("fDuration")} <Required />
                </FormLabel>
                <FormControl>
                  <Input placeholder={t("durationPlaceholder")} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={control}
          name="language"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                {t("fLanguage")} <Required />
              </FormLabel>
              <FormControl>
                <div className="flex flex-wrap gap-2">
                  {LANGUAGE_OPTIONS.map((lang) => {
                    const active = field.value.includes(lang);
                    return (
                      <button
                        key={lang}
                        type="button"
                        onClick={() =>
                          field.onChange(
                            active
                              ? field.value.filter(
                                  (l: LanguageOption) => l !== lang,
                                )
                              : [...field.value, lang],
                          )
                        }
                        className={cn(
                          "rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
                          active
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border text-muted-foreground hover:border-primary/40",
                        )}
                      >
                        {lang}
                      </button>
                    );
                  })}
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="instructorIds"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("fInstructors")}</FormLabel>
              <FormControl>
                <MultiSelect
                  options={instructors.map((i) => ({
                    value: i.id,
                    label: i.label,
                    hint: i.title,
                  }))}
                  value={field.value}
                  onChange={field.onChange}
                  placeholder={t("searchInstructors")}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="tags"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("fTags")}</FormLabel>
              <FormControl>
                <MultiSelect
                  options={tags.map((tag) => ({
                    value: tag.id,
                    label: tag.label,
                  }))}
                  value={field.value}
                  onChange={field.onChange}
                  placeholder={t("searchTags")}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </FormSection>

      <FormSection title={t("secStatus")} description={t("secStatusDesc")}>
        <div className="grid gap-4">
          <ToggleField
            name="isActive"
            label={t("statusActive")}
            hint={t("statusActiveHint")}
          />
          <ToggleField
            name="isFeatured"
            label={t("statusFeatured")}
            hint={t("statusFeaturedHint")}
          />
          <ToggleField
            name="isBestseller"
            label={t("statusBestseller")}
            hint={t("statusBestsellerHint")}
          />
          <ToggleField
            name="isTopRated"
            label={t("statusTopRated")}
            hint={t("statusTopRatedHint")}
          />
        </div>
      </FormSection>

      <SeoPanel />
    </>
  );
}

function Required() {
  return <span className="text-destructive">*</span>;
}

function ToggleField({
  name,
  label,
  hint,
}: {
  name: "isActive" | "isFeatured" | "isBestseller" | "isTopRated";
  label: string;
  hint: string;
}) {
  const { control } = useFormContext<CourseFormValues>();
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className="flex items-center justify-between gap-3 rounded-lg border bg-card p-3.5">
          <div className="space-y-0.5">
            <FormLabel className="cursor-pointer">{label}</FormLabel>
            <FormDescription>{hint}</FormDescription>
          </div>
          <FormControl>
            <Switch checked={field.value} onCheckedChange={field.onChange} />
          </FormControl>
        </FormItem>
      )}
    />
  );
}
