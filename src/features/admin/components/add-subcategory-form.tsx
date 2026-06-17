"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { ListChecks, Plus, X, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { useRouter } from "@/i18n/navigation";
import { dal } from "@/lib/dal";
import type { CreateSubCategoryInput } from "@integration/services/sub-categories";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { IconUploadField } from "./icon-upload-field";

const slugify = (s: string) =>
  s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

export interface SubcategoryInitial {
  nameEn?: string;
  nameAr?: string;
  slug?: string;
  icon?: string;
  parentCategory?: string;
  headlineEn?: string;
  headlineAr?: string;
  descriptionEn?: string;
  descriptionAr?: string;
  metaTitleEn?: string;
  metaTitleAr?: string;
  metaDescriptionEn?: string;
  metaDescriptionAr?: string;
  metaKeywordsEn?: string[];
  metaKeywordsAr?: string[];
  faqs?: { questionEn?: string; questionAr?: string; answerEn?: string; answerAr?: string }[];
}

interface AddSubcategoryFormProps {
  subcategoryId?: string;
  initial?: SubcategoryInitial;
  parentCategories: { id: string; name: string }[];
}

export function AddSubcategoryForm({ subcategoryId, initial, parentCategories }: AddSubcategoryFormProps) {
  const t = useTranslations("Admin");
  const router = useRouter();
  const isEdit = Boolean(subcategoryId);

  const [nameEn, setNameEn] = React.useState(initial?.nameEn ?? "");
  const [nameAr, setNameAr] = React.useState(initial?.nameAr ?? "");
  const [slug, setSlug] = React.useState(initial?.slug ?? "");
  const [slugEdited, setSlugEdited] = React.useState(Boolean(initial?.slug));
  const [icon, setIcon] = React.useState(initial?.icon ?? "");
  const [parentId, setParentId] = React.useState(initial?.parentCategory ?? "");
  const [headlineEn, setHeadlineEn] = React.useState(initial?.headlineEn ?? "");
  const [headlineAr, setHeadlineAr] = React.useState(initial?.headlineAr ?? "");
  const [descEn, setDescEn] = React.useState(initial?.descriptionEn ?? "");
  const [descAr, setDescAr] = React.useState(initial?.descriptionAr ?? "");
  const [metaTitleEn, setMetaTitleEn] = React.useState(initial?.metaTitleEn ?? "");
  const [metaTitleAr, setMetaTitleAr] = React.useState(initial?.metaTitleAr ?? "");
  const [metaDescEn, setMetaDescEn] = React.useState(initial?.metaDescriptionEn ?? "");
  const [metaDescAr, setMetaDescAr] = React.useState(initial?.metaDescriptionAr ?? "");
  const [kwEn, setKwEn] = React.useState<string[]>(initial?.metaKeywordsEn ?? []);
  const [kwAr, setKwAr] = React.useState<string[]>(initial?.metaKeywordsAr ?? []);
  const [kwEnInput, setKwEnInput] = React.useState("");
  const [kwArInput, setKwArInput] = React.useState("");
  const [faqs, setFaqs] = React.useState<{ q: string; a: string }[]>(
    (initial?.faqs ?? []).map((f) => ({ q: f.questionEn ?? "", a: f.answerEn ?? "" })),
  );
  const [submitting, setSubmitting] = React.useState(false);

  const onNameEn = (v: string) => {
    setNameEn(v);
    if (!slugEdited) setSlug(slugify(v));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();

    const seo: CreateSubCategoryInput["seo"] = {};
    if (metaTitleEn.trim()) seo.metaTitleEn = metaTitleEn.trim();
    if (metaTitleAr.trim()) seo.metaTitleAr = metaTitleAr.trim();
    if (metaDescEn.trim()) seo.metaDescriptionEn = metaDescEn.trim();
    if (metaDescAr.trim()) seo.metaDescriptionAr = metaDescAr.trim();
    if (kwEn.length) seo.metaKeywordsEn = kwEn;
    if (kwAr.length) seo.metaKeywordsAr = kwAr;

    const cleanFaqs = faqs
      .filter((f) => f.q.trim() || f.a.trim())
      .map((f) => ({
        questionEn: f.q.trim(), questionAr: f.q.trim(),
        answerEn: f.a.trim(), answerAr: f.a.trim(),
      }));

    const input: CreateSubCategoryInput = {
      nameEn: nameEn.trim(),
      nameAr: nameAr.trim(),
      slug: slug.trim() || slugify(nameEn),
      parentCategory: parentId,
      ...(icon.trim() ? { icon: icon.trim() } : {}),
      ...(headlineEn.trim() ? { headlineEn: headlineEn.trim() } : {}),
      ...(headlineAr.trim() ? { headlineAr: headlineAr.trim() } : {}),
      ...(descEn.trim() ? { descriptionEn: descEn.trim() } : {}),
      ...(descAr.trim() ? { descriptionAr: descAr.trim() } : {}),
      ...(Object.keys(seo).length ? { seo } : {}),
      ...(cleanFaqs.length ? { faqs: cleanFaqs } : {}),
      isActive: true,
    };

    setSubmitting(true);
    let res;
    if (isEdit && subcategoryId) {
      res = await dal.courseTaxonomy.updateCourseSubcategory(subcategoryId, input);
    } else {
      res = await dal.courseTaxonomy.createCourseSubcategory(input);
    }
    setSubmitting(false);
    if (res.ok) {
      toast.success(isEdit ? t("csUpdated", { name: nameEn }) : t("categorySaved"));
      router.push("/admin/courses/settings");
    } else {
      toast.error(res.error);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-6 pb-8">
      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        {/* Left column */}
        <div className="space-y-6">
          {/* Setup */}
          <Card>
            <CardContent className="space-y-5 pt-6">
              <h2 className="inline-flex items-center gap-2 font-heading text-lg font-bold">
                <span className="grid size-9 place-items-center rounded-lg bg-primary/10 text-primary">
                  <ListChecks className="size-5" />
                </span>
                {t("categorySetup")}
              </h2>

              <div className="space-y-1.5">
                <Label>{t("csColParent")} <span className="text-destructive">*</span></Label>
                <Select value={parentId} onValueChange={setParentId}>
                  <SelectTrigger><SelectValue placeholder={t("csColParent")} /></SelectTrigger>
                  <SelectContent>
                    {parentCategories.map((p) => (
                      <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label>{t("catNameAr")} <span className="text-destructive">*</span></Label>
                  <Input dir="rtl" value={nameAr} onChange={(e) => setNameAr(e.target.value)} placeholder={t("catNameArPh")} />
                </div>
                <div className="space-y-1.5">
                  <Label>{t("catNameEn")} <span className="text-destructive">*</span></Label>
                  <Input value={nameEn} onChange={(e) => onNameEn(e.target.value)} placeholder={t("catNameEnPh")} />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>{t("catSlug")}</Label>
                <Input
                  value={slug}
                  onChange={(e) => { setSlug(e.target.value); setSlugEdited(true); }}
                  placeholder={t("catSlugPh")}
                />
                <p className="text-xs text-muted-foreground">{t("catSlugHint")}</p>
              </div>
              <IconUploadField label={t("catIcon")} hint={t("catIconHint")} value={icon} onChange={setIcon} />
            </CardContent>
          </Card>

          {/* SEO */}
          <Card>
            <CardContent className="space-y-5 pt-6">
              <div>
                <h2 className="font-heading text-lg font-bold">{t("catSeoTitle")}</h2>
                <p className="text-sm text-muted-foreground">{t("catSeoHint")}</p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label dir="rtl" className="block text-end">{t("catMetaTitleAr")}</Label>
                  <Input dir="rtl" value={metaTitleAr} onChange={(e) => setMetaTitleAr(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label>{t("catMetaTitleEn")}</Label>
                  <Input value={metaTitleEn} onChange={(e) => setMetaTitleEn(e.target.value)} placeholder={t("catMetaTitleEnPh")} />
                </div>
                <div className="space-y-1.5">
                  <Label dir="rtl" className="block text-end">{t("catMetaDescAr")}</Label>
                  <Textarea dir="rtl" value={metaDescAr} onChange={(e) => setMetaDescAr(e.target.value)} className="min-h-24" />
                </div>
                <div className="space-y-1.5">
                  <Label>{t("catMetaDescEn")}</Label>
                  <Textarea value={metaDescEn} onChange={(e) => setMetaDescEn(e.target.value)} placeholder={t("catMetaDescEnPh")} className="min-h-24" />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <KeywordField label={t("catKeywordsAr")} placeholder={t("catKeywordsArPh")} dir="rtl"
                  value={kwAr} input={kwArInput} setInput={setKwArInput}
                  onAdd={(k) => setKwAr((p) => [...p, k])}
                  onRemove={(i) => setKwAr((p) => p.filter((_, idx) => idx !== i))} />
                <KeywordField label={t("catKeywordsEn")} placeholder={t("catKeywordsEnPh")}
                  value={kwEn} input={kwEnInput} setInput={setKwEnInput}
                  onAdd={(k) => setKwEn((p) => [...p, k])}
                  onRemove={(i) => setKwEn((p) => p.filter((_, idx) => idx !== i))} />
              </div>
            </CardContent>
          </Card>

          {/* FAQ */}
          <Card>
            <CardContent className="space-y-4 pt-6">
              <div>
                <h2 className="font-heading text-lg font-bold">{t("catFaqTitle")}</h2>
                <p className="text-sm text-muted-foreground">{t("catFaqHint")}</p>
              </div>
              {faqs.map((f, i) => (
                <div key={i} className="grid gap-2 rounded-lg border p-3 sm:grid-cols-2">
                  <Input value={f.q} placeholder="Q" onChange={(e) => setFaqs((p) => p.map((x, idx) => (idx === i ? { ...x, q: e.target.value } : x)))} />
                  <div className="flex gap-2">
                    <Input value={f.a} placeholder="A" onChange={(e) => setFaqs((p) => p.map((x, idx) => (idx === i ? { ...x, a: e.target.value } : x)))} />
                    <Button type="button" variant="ghost" size="icon" className="size-9 shrink-0 text-destructive"
                      onClick={() => setFaqs((p) => p.filter((_, idx) => idx !== i))}>
                      <X className="size-4" />
                    </Button>
                  </div>
                </div>
              ))}
              <Button type="button" variant="ghost" size="sm" className="gap-1.5 text-primary"
                onClick={() => setFaqs((p) => [...p, { q: "", a: "" }])}>
                <Plus className="size-4" />{t("catAddFaq")}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Right column */}
        <div className="space-y-6">
          <Card>
            <CardContent className="space-y-3 pt-6">
              <p className="font-semibold">{t("catHeadlines")}</p>
              <Input dir="rtl" value={headlineAr} onChange={(e) => setHeadlineAr(e.target.value)} placeholder={t("catHeadlineAr")} />
              <Input value={headlineEn} onChange={(e) => setHeadlineEn(e.target.value)} placeholder={t("catHeadlineEn")} />
            </CardContent>
          </Card>
          <Card>
            <CardContent className="space-y-4 pt-6">
              <p className="font-semibold">{t("catDescription")}</p>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">AR</Label>
                <Textarea dir="rtl" value={descAr} onChange={(e) => setDescAr(e.target.value)} placeholder={t("catDescAr")} className="min-h-28" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">EN</Label>
                <Textarea value={descEn} onChange={(e) => setDescEn(e.target.value)} placeholder={t("catDescEn")} className="min-h-28" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="flex items-center justify-end gap-3">
        <Button type="reset" variant="outline" disabled={submitting}>{t("catReset")}</Button>
        <Button type="submit" disabled={submitting} className="gap-1.5">
          {submitting && <Loader2 className="size-4 animate-spin" />}
          {isEdit ? t("csSaveChanges") : t("catCreate")}
        </Button>
      </div>
    </form>
  );
}

function KeywordField({
  label, placeholder, dir, value, input, setInput, onAdd, onRemove,
}: {
  label: string; placeholder: string; dir?: "rtl" | "ltr"; value: string[]; input: string;
  setInput: (v: string) => void; onAdd: (k: string) => void; onRemove: (i: number) => void;
}) {
  const add = () => { if (input.trim()) { onAdd(input.trim()); setInput(""); } };
  return (
    <div className="space-y-1.5">
      <Label dir={dir} className={dir === "rtl" ? "block text-end" : undefined}>{label}</Label>
      <div className="flex gap-2">
        <Input dir={dir} value={input} placeholder={placeholder} onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); add(); } }} />
        <Button type="button" variant="outline" size="icon" className="size-9 shrink-0" onClick={add}>
          <Plus className="size-4" />
        </Button>
      </div>
      {value.length > 0 && (
        <div className="flex flex-wrap gap-1.5 pt-1">
          {value.map((k, i) => (
            <span key={i} className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-xs">
              {k}<button type="button" onClick={() => onRemove(i)}><X className="size-3" /></button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
