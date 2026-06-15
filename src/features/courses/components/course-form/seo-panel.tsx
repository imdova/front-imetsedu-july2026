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
import { TagsInput } from "@/components/shared/tags-input";
import { FormSection } from "./form-section";

/** Compact SEO + webhook panel for the step-1 sidebar. */
export function SeoPanel() {
  const { control } = useFormContext<CourseFormValues>();
  const t = useTranslations("CourseForm");
  const metaTitle = useWatch({ control, name: "seo.metaTitleEn" }) ?? "";
  const slug = useWatch({ control, name: "slug" });

  return (
    <>
      <FormSection title={t("secSeo")} description={t("secSeoDesc")}>
        <div className="space-y-4">
          <CountedField
            name="seo.metaTitleEn"
            label={t("fMetaTitleEn")}
            max={60}
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
          <p className="text-lg text-primary">
            {metaTitle || t("metaTitlePreview")}
          </p>
          <p className="line-clamp-2 text-sm text-muted-foreground">
            <SeoDescriptionPreview />
          </p>
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
}

function CountedField({ name, label, max, textarea }: CountedFieldProps) {
  const { control } = useFormContext<CourseFormValues>();
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => {
        const len = (field.value as string)?.length ?? 0;
        return (
          <FormItem>
            <div className="flex items-center justify-between">
              <FormLabel>{label}</FormLabel>
              <span
                className={cn(
                  "text-xs tabular-nums",
                  len > max ? "text-destructive" : "text-muted-foreground",
                )}
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
