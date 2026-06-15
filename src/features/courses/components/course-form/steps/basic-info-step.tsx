"use client";

import { useFormContext, useWatch } from "react-hook-form";
import { useTranslations } from "next-intl";
import { Wand2 } from "lucide-react";

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
  column?: "main" | "sidebar";
}

export function BasicInfoStep({
  categories,
  instructors,
  tags,
  column = "main",
}: Props) {
  if (column === "sidebar") {
    return (
      <BasicInfoSidebar instructors={instructors} tags={tags} />
    );
  }

  return <BasicInfoMain categories={categories} />;
}

function BasicInfoMain({ categories }: { categories: CategoryLookup[] }) {
  const { control, setValue, getValues } = useFormContext<CourseFormValues>();
  const t = useTranslations("CourseForm");
  const selectedCategory = useWatch({ control, name: "category" });
  const subcategories =
    categories.find((c) => c.id === selectedCategory)?.subcategories ?? [];

  const regenerateSlug = () =>
    setValue("slug", slugify(getValues("titleEn")), { shouldValidate: true });

  return (
    <>
      <FormSection
        title={t("secIdentification")}
        description={t("secIdentificationDesc")}
      >
        <div className="grid gap-5 sm:grid-cols-2">
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
                <Select
                  value={field.value}
                  onValueChange={(v) => {
                    field.onChange(v);
                    setValue("subcategory", "");
                  }}
                >
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
            name="subcategory"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  {t("fSubcategory")} <Required />
                </FormLabel>
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                  disabled={!selectedCategory}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue
                        placeholder={
                          selectedCategory
                            ? t("selectSubcategory")
                            : t("selectCategoryFirst")
                        }
                      />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {subcategories.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.label}
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
                    {PROGRAM_TYPE_OPTIONS.map((p) => (
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

      <FormSection title={t("secContent")} description={t("secContentDesc")}>
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
        <FormField
          control={control}
          name="descriptionAr"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("fDescriptionAr")}</FormLabel>
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
      </FormSection>

      <FormSection title={t("secPricing")} description={t("secPricingDesc")}>
        <PricingSection />
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
