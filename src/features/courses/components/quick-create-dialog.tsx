"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Wand2 } from "lucide-react";
import { toast } from "sonner";

import { useRouter } from "@/i18n/navigation";
import { slugify } from "@/lib/utils";
import { makeDefaultCourseValues } from "@/validations/course-defaults";
import { toCoursePayload } from "../lib/to-course-payload";
import { dal } from "@/lib/dal";
import { DIFFICULTY_OPTIONS } from "@/constants/course-options";
import type { CategoryLookup } from "@/types";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const quickSchema = z.object({
  titleEn: z.string().trim().min(3, "Title is required"),
  titleAr: z.string().trim().min(3, "العنوان مطلوب"),
  category: z.string().min(1, "Select a category"),
  difficulty: z.enum(["Beginner", "Intermediate", "Advanced"]),
});
type QuickValues = z.infer<typeof quickSchema>;

interface Props {
  categories: CategoryLookup[];
  onCreated?: () => void;
}

/**
 * Lightweight "new draft" modal — demonstrates the reusable shadcn Form +
 * react-hook-form + Zod pattern. For the full 44-field builder it links out to
 * the dedicated wizard at /courses/new.
 */
export function QuickCreateDialog({ categories, onCreated }: Props) {
  const router = useRouter();
  const t = useTranslations("Courses");
  const [open, setOpen] = React.useState(false);

  const form = useForm<QuickValues>({
    resolver: zodResolver(quickSchema),
    defaultValues: {
      titleEn: "",
      titleAr: "",
      category: "",
      difficulty: "Beginner",
    },
  });

  async function onSubmit(values: QuickValues) {
    const draft = {
      ...makeDefaultCourseValues(),
      titleEn: values.titleEn,
      titleAr: values.titleAr,
      slug: slugify(values.titleEn),
      category: values.category,
      subcategory:
        categories.find((c) => c.id === values.category)?.subcategories[0]?.id ??
        "",
      difficulty: values.difficulty,
    };
    const res = await dal.courses.createCourse(toCoursePayload(draft));
    if (res.ok) {
      toast.success(t("draftCreated", { title: res.data.titleEn }));
      setOpen(false);
      form.reset();
      onCreated?.();
      router.refresh();
    } else {
      toast.error(res.error);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-1.5">
          <Plus className="size-4" />
          {t("quickDraft")}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{t("quickCreateTitle")}</DialogTitle>
          <DialogDescription>{t("quickCreateDesc")}</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4"
            id="quick-create-form"
          >
            <FormField
              control={form.control}
              name="titleEn"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("titleEn")}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g. Advanced Financial Modeling"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="titleAr"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("titleAr")}</FormLabel>
                  <FormControl>
                    <Input dir="rtl" placeholder="مثال: النمذجة المالية" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("colCategory")}</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={t("colCategory")} />
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
                control={form.control}
                name="difficulty"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("colLevel")}</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                    >
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
          </form>
        </Form>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="button"
            variant="ghost"
            onClick={() => router.push("/admin/courses/new")}
            className="gap-1.5"
          >
            <Wand2 className="size-4" />
            {t("openFullBuilder")}
          </Button>
          <Button
            type="submit"
            form="quick-create-form"
            disabled={form.formState.isSubmitting}
          >
            {form.formState.isSubmitting ? t("creating") : t("createDraft")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
