"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { ShieldCheck, CreditCard, Loader2 } from "lucide-react";
import { toast } from "sonner";

import type { CourseRow } from "@/types";
import { useRouter } from "@/i18n/navigation";
import { ROUTES } from "@integration/constants";
import { cn, formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function CheckoutView({ course }: { course: CourseRow }) {
  const t = useTranslations("Student");
  const router = useRouter();
  const [plan, setPlan] = React.useState<"full" | "installments">("full");
  const [submitting, setSubmitting] = React.useState(false);

  const price = course.priceEGP;
  const sale = course.salePriceEGP > 0 ? course.salePriceEGP : price;
  const discount = price - sale;

  const onPay = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      toast.success(t("enrolledToast"));
      router.push(ROUTES.STUDENT.COURSE_OVERVIEW(course.id));
    }, 700);
  };

  return (
    <form onSubmit={onPay} className="grid gap-6 lg:grid-cols-[1fr_380px]">
      <div className="space-y-6">
        <Card>
          <CardHeader><CardTitle className="text-base">{t("billingInfo")}</CardTitle></CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="name">{t("fullNameLabel")}</Label>
              <Input id="name" required defaultValue="Student User" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email">{t("emailLabel")}</Label>
              <Input id="email" type="email" required defaultValue="student@imetsedu.com" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">{t("payWith")}</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              {(["full", "installments"] as const).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPlan(p)}
                  className={cn(
                    "rounded-xl border p-4 text-start text-sm transition-colors",
                    plan === p ? "border-primary bg-primary/5 ring-1 ring-primary/20" : "border-border/70 hover:bg-muted/40",
                  )}
                >
                  <span className="font-medium">{p === "full" ? t("fullPayOption") : t("installmentsOption")}</span>
                </button>
              ))}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="card">{t("payWith")}</Label>
              <div className="relative">
                <CreditCard className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input id="card" inputMode="numeric" placeholder="4242 4242 4242 4242" className="ps-9" required />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="h-fit">
        <CardHeader><CardTitle className="text-base">{t("orderSummary")}</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-3 border-b border-border/60 pb-3">
            <span className="grid size-11 shrink-0 place-items-center rounded-lg bg-primary/10 font-heading font-semibold text-primary">
              {course.titleEn.slice(0, 1)}
            </span>
            <p className="text-sm font-medium leading-snug">{course.titleEn}</p>
          </div>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between"><dt className="text-muted-foreground">{t("subtotal")}</dt><dd className="tabular-nums">{formatCurrency(price, "EGP")}</dd></div>
            {discount > 0 && (
              <div className="flex justify-between text-success"><dt>{t("discount")}</dt><dd className="tabular-nums">−{formatCurrency(discount, "EGP")}</dd></div>
            )}
            <div className="flex justify-between border-t border-border/60 pt-2 text-base font-semibold"><dt>{t("total")}</dt><dd className="tabular-nums">{formatCurrency(sale, "EGP")}</dd></div>
          </dl>
          <Button type="submit" className="w-full gap-1.5" disabled={submitting}>
            {submitting ? <Loader2 className="size-4 animate-spin" /> : null}
            {t("payNow")}
          </Button>
          <p className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
            <ShieldCheck className="size-3.5" />{t("securePayment")}
          </p>
        </CardContent>
      </Card>
    </form>
  );
}
