"use client";

import { useFormContext, useWatch } from "react-hook-form";
import { useTranslations } from "next-intl";
import { Globe } from "lucide-react";

import type { CourseFormValues } from "@/validations/course-schema";
import { cn } from "@/lib/utils";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TagsInput } from "@/components/shared/tags-input";
import { ImageUpload } from "@/components/shared/image-upload";
import { FormSection } from "./form-section";

/** What the public layout appends to every page title (`%s · <site name>`). */
const BRAND_SUFFIX = " · IMETS Medical School";

/** Google truncates desktop titles at roughly this width. */
const SERP_TITLE_PX = 580;

/**
 * Rough pixel width of a SERP title. Character counts mislead badly — "iii" and
 * "WWW" are the same length and nothing like the same width — so weight by
 * glyph class instead. Close enough to place the truncation warning honestly.
 */
function approxTitlePx(text: string): number {
  let px = 0;
  for (const ch of text) {
    if (/[ilj|!.,:;'`\-]/.test(ch)) px += 5;
    else if (/[A-Z@#%&WM]/.test(ch)) px += 13;
    else if (/[mw]/.test(ch)) px += 14;
    else if (ch === " ") px += 5;
    else px += 9.5;
  }
  return px;
}

/** Compact SEO + webhook panel for the step-1 sidebar. */
export function SeoPanel() {
  const { control } = useFormContext<CourseFormValues>();
  const t = useTranslations("CourseForm");
  const metaTitle = useWatch({ control, name: "seo.metaTitleEn" }) ?? "";
  const slug = useWatch({ control, name: "slug" });
  const suppressSuffix = useWatch({ control, name: "suppressBrandSuffix" });
  // The public layout renders `%s · IMETS Medical School`; the counter and the
  // preview must both reflect that, or they describe a title nobody will see.
  const suffix = suppressSuffix ? "" : BRAND_SUFFIX;
  const composedTitle = metaTitle ? `${metaTitle}${suffix}` : "";

  return (
    <>
      <FormSection title={t("secSeo")} description={t("secSeoDesc")}>
        <div className="space-y-4">
          <CountedField
            name="seo.metaTitleEn"
            label={t("fMetaTitleEn")}
            max={60}
            suffix={suffix}
          />
          <FormField
            control={control}
            name="suppressBrandSuffix"
            render={({ field }) => (
              <FormItem className="flex items-start gap-2.5 space-y-0 rounded-lg border border-border/70 p-3">
                <FormControl>
                  <Checkbox checked={field.value} onCheckedChange={field.onChange} className="mt-0.5" />
                </FormControl>
                <div className="space-y-0.5">
                  <FormLabel className="font-normal">{t("suppressBrandSuffix")}</FormLabel>
                  <FormDescription className="text-[11px]">{t("suppressBrandSuffixHint")}</FormDescription>
                </div>
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="seo.metaTitleAr"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("fMetaTitleAr")}</FormLabel>
                <FormControl>
                  <Input dir="rtl" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <CountedField
            name="seo.metaDescriptionEn"
            label={t("fMetaDescEn")}
            max={160}
            textarea
          />
          <FormField
            control={control}
            name="seo.metaDescriptionAr"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("fMetaDescAr")}</FormLabel>
                <FormControl>
                  <Textarea dir="rtl" rows={3} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="seo.metaKeywordsEn"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("fKeywordsEn")}</FormLabel>
                <FormControl>
                  <TagsInput value={field.value} onChange={field.onChange} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="seo.metaKeywordsAr"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("fKeywordsAr")}</FormLabel>
                <FormControl>
                  <TagsInput
                    value={field.value}
                    onChange={field.onChange}
                    dir="rtl"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </FormSection>

      <FormSection title={t("secSearchPreview")}>
        <div className="rounded-lg border bg-muted/30 p-4">
          <p className="text-xs text-muted-foreground" dir="ltr">
            imetsedu.com › courses › {slug || "course-slug"}
          </p>
          {/* Truncated at the real pixel budget (~580px desktop), showing the
              composed title — suffix included — so the preview can't flatter. */}
          <p
            className="overflow-hidden text-ellipsis whitespace-nowrap text-lg text-primary"
            style={{ maxWidth: SERP_TITLE_PX }}
            dir="ltr"
          >
            {composedTitle || t("metaTitlePreview")}
          </p>
          <p className="line-clamp-2 text-sm text-muted-foreground">
            <SeoDescriptionPreview />
          </p>
          {composedTitle && approxTitlePx(composedTitle) > SERP_TITLE_PX && (
            <p className="mt-2 text-[11px] font-medium text-destructive">{t("titleTooLong")}</p>
          )}
          {suffix && metaTitle && (
            <p className="mt-1 text-[11px] text-muted-foreground">
              {metaTitle.length} + {suffix.length} {t("withSuffix")} = {composedTitle.length}
            </p>
          )}
        </div>
      </FormSection>

      {/* ── Indexing & social ── */}
      <FormSection title={t("secIndexing")} description={t("secIndexingDesc")}>
        <div className="space-y-4">
          <FormField
            control={control}
            name="canonicalOverride"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("canonicalOverride")}</FormLabel>
                <FormControl>
                  <Input placeholder={`https://imetsedu.com/courses/${slug || "course-slug"}`} {...field} />
                </FormControl>
                <FormDescription>{t("canonicalOverrideHint")}</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="robotsDirective"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("robotsDirective")}</FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="index,follow">index, follow</SelectItem>
                    <SelectItem value="noindex,follow">noindex, follow</SelectItem>
                    <SelectItem value="noindex,nofollow">noindex, nofollow</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="ogImage"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("ogImage")}</FormLabel>
                <FormControl>
                  <ImageUpload value={field.value} onChange={field.onChange} className="aspect-[1200/630]" />
                </FormControl>
                <FormDescription>{t("ogImageHint")}</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="ogImageAlt"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("ogImageAlt")}</FormLabel>
                <FormControl><Input {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="imageAltEn"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("imageAlt")}</FormLabel>
                <FormControl><Input {...field} /></FormControl>
                <FormDescription>{t("imageAltHint")}</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="imageAltAr"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("imageAltArLabel")}</FormLabel>
                <FormControl><Input dir="rtl" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </FormSection>

      <FormSection title={t("secIntegrations")}>
        <FormField
          control={control}
          name="webhookUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("fWebhook")}</FormLabel>
              <FormControl>
                <div className="relative">
                  <Globe className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    className="ps-9"
                    placeholder="https://example.com/webhook"
                    {...field}
                  />
                </div>
              </FormControl>
              <FormDescription>{t("webhookHint")}</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </FormSection>
    </>
  );
}

function SeoDescriptionPreview() {
  const { control } = useFormContext<CourseFormValues>();
  const t = useTranslations("CourseForm");
  const desc = useWatch({ control, name: "seo.metaDescriptionEn" });
  return <>{desc || t("metaDescPreview")}</>;
}

interface CountedFieldProps {
  name: "seo.metaTitleEn" | "seo.metaDescriptionEn";
  label: string;
  max: number;
  textarea?: boolean;
  /** Appended by the site layout; counted so the number matches the real SERP title. */
  suffix?: string;
}

function CountedField({ name, label, max, textarea, suffix }: CountedFieldProps) {
  const { control } = useFormContext<CourseFormValues>();
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => {
        // Count what search engines will actually see: the site layout appends
        // the brand suffix, so measuring the raw field under-reports the title.
        const raw = (field.value as string) ?? "";
        const len = raw.length + (raw && suffix ? suffix.length : 0);
        return (
          <FormItem>
            <div className="flex items-center justify-between">
              <FormLabel>{label}</FormLabel>
              <span
                className={cn(
                  "text-xs tabular-nums",
                  len > max ? "text-destructive" : "text-muted-foreground",
                )}
                title={suffix ? `${raw.length} + ${suffix.length} (${suffix.trim()})` : undefined}
              >
                {len}/{max}
              </span>
            </div>
            <FormControl>
              {textarea ? (
                <Textarea rows={3} {...field} />
              ) : (
                <Input {...field} />
              )}
            </FormControl>
            <FormMessage />
          </FormItem>
        );
      }}
    />
  );
}
