"use client";

import * as React from "react";
import Image from "next/image";
import {
  ShoppingBag, Wallet, CreditCard, ShieldCheck, CheckCircle2, ChevronRight,
  Lock, BadgeCheck, Mail, User, Phone, Globe, Sparkles,
} from "lucide-react";
import { toast } from "sonner";

import type { CourseRow } from "@/types";
import { Link } from "@/i18n/navigation";
import { cn, formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { PAYPAL_CLIENT_ID } from "@/lib/paypal";
import { PaypalButton, type PayPalCapture } from "./paypal-button";

const CLIENT_ID = PAYPAL_CLIENT_ID;
const EGP_PER_USD = Number(process.env.NEXT_PUBLIC_EGP_PER_USD) || 50;
const CURRENCY = "USD";

type Method = "paypal" | "card";
type Step = 1 | 2 | 3;

/** Resolve the amount to charge in USD. Falls back to an EGP→USD conversion. */
function resolvePricing(course: CourseRow) {
  const conv = (n: number) => Math.round((n / EGP_PER_USD) * 100) / 100;
  if ((course.priceUSD ?? 0) > 0 || (course.salePriceUSD ?? 0) > 0) {
    const base = (course.priceUSD ?? 0) > 0 ? (course.priceUSD as number) : (course.salePriceUSD as number);
    const total = (course.salePriceUSD ?? 0) > 0 ? (course.salePriceUSD as number) : base;
    return { base, total, approx: false };
  }
  const egpBase = course.priceEGP || 0;
  const egpSale = course.salePriceEGP > 0 ? course.salePriceEGP : egpBase;
  return { base: conv(egpBase), total: conv(egpSale), approx: true };
}

export function PaypalCheckout({ course, locale }: { course: CourseRow; locale: string }) {
  const t = React.useCallback((en: string, ar: string) => (locale === "ar" ? ar : en), [locale]);
  const title = (locale === "ar" ? course.titleAr : course.titleEn) || course.titleEn;

  const { base, total, approx } = React.useMemo(() => resolvePricing(course), [course]);
  const discount = base > total ? base - total : 0;
  const payable = total > 0;

  const [step, setStep] = React.useState<Step>(1);
  const [method, setMethod] = React.useState<Method>("paypal");
  const [form, setForm] = React.useState({ fullName: "", email: "", phone: "", country: "" });
  const [status, setStatus] = React.useState<"idle" | "paid">("idle");
  const [orderId, setOrderId] = React.useState("");

  const emailOk = /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email);
  const formValid = form.fullName.trim().length > 1 && emailOk && form.country.trim().length > 0;

  const onPaid = React.useCallback((cap: PayPalCapture) => {
    const txn = cap?.purchase_units?.[0]?.payments?.captures?.[0]?.id || cap?.id || "";
    setOrderId(txn);
    setStatus("paid");
    toast.success(t("Payment successful", "تم الدفع بنجاح"));
    // Backend hook: record the order / enroll the customer via a capture endpoint here.
  }, [t]);

  const onPayError = React.useCallback(() => {
    toast.error(t("Payment could not be completed. Please try again.", "تعذّر إتمام الدفع. يرجى المحاولة مرة أخرى."));
  }, [t]);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  // ---- Success screen -----------------------------------------------------
  if (status === "paid") {
    return (
      <div className="mx-auto max-w-lg py-8 text-center">
        <div className="mx-auto mb-5 grid size-16 place-items-center rounded-full bg-success/10 text-success">
          <CheckCircle2 className="size-9" />
        </div>
        <h1 className="font-heading text-2xl font-bold">{t("Payment successful", "تم الدفع بنجاح")}</h1>
        <p className="mt-2 text-muted-foreground">
          {t(
            "Thank you! Your enrollment in ",
            "شكرًا لك! تم استلام اشتراكك في ",
          )}
          <span className="font-medium text-foreground">{title}</span>
          {t(" is confirmed. A receipt and access details are on their way to your email.", " بنجاح. سيصلك الإيصال وتفاصيل الدخول على بريدك الإلكتروني.")}
        </p>
        {orderId && (
          <p className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground">
            <BadgeCheck className="size-3.5" /> {t("Transaction", "رقم العملية")}: <span className="font-mono">{orderId}</span>
          </p>
        )}
        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          <Button asChild><Link href="/courses">{t("Browse more courses", "تصفّح المزيد من الكورسات")}</Link></Button>
          <Button asChild variant="outline"><Link href={`/courses/${course.slug}`}>{t("Back to course", "العودة إلى الكورس")}</Link></Button>
        </div>
      </div>
    );
  }

  const steps = [
    { id: 1 as Step, label: t("Order", "الطلب"), icon: ShoppingBag },
    { id: 2 as Step, label: t("Payment method", "طريقة الدفع"), icon: Wallet },
    { id: 3 as Step, label: t("Your details", "بياناتك"), icon: CreditCard },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl font-bold sm:text-3xl">{t("Checkout", "إتمام الشراء")}</h1>
          <p className="text-sm text-muted-foreground">{t("Secure payment powered by PayPal.", "دفع آمن عبر PayPal.")}</p>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-success/10 px-3 py-1 text-xs font-medium text-success">
          <Lock className="size-3.5" /> {t("SSL secured", "اتصال آمن")}
        </span>
      </div>

      {/* Stepper */}
      <ol className="flex items-center gap-2 sm:gap-3">
        {steps.map((s, i) => {
          const active = step === s.id;
          const done = step > s.id;
          return (
            <li key={s.id} className="flex flex-1 items-center gap-2 sm:gap-3">
              <button
                type="button"
                onClick={() => (s.id < step ? setStep(s.id) : undefined)}
                className={cn(
                  "flex items-center gap-2 rounded-full px-3 py-1.5 text-sm transition-colors",
                  active && "bg-primary text-primary-foreground",
                  done && "bg-primary/10 text-primary hover:bg-primary/15",
                  !active && !done && "text-muted-foreground",
                  s.id < step ? "cursor-pointer" : "cursor-default",
                )}
              >
                <span className={cn(
                  "grid size-6 shrink-0 place-items-center rounded-full text-xs font-semibold",
                  active ? "bg-primary-foreground/20" : done ? "bg-primary/15" : "bg-muted",
                )}>
                  {done ? <CheckCircle2 className="size-4" /> : s.id}
                </span>
                <span className="hidden font-medium sm:inline">{s.label}</span>
              </button>
              {i < steps.length - 1 && <span className={cn("h-px flex-1", done ? "bg-primary/40" : "bg-border")} />}
            </li>
          );
        })}
      </ol>

      <div className="grid items-start gap-6 lg:grid-cols-[1fr_360px]">
        {/* Main column */}
        <div className="space-y-6">
          {/* STEP 1 — Order */}
          {step === 1 && (
            <section className="rounded-2xl border border-border/70 bg-card p-5 shadow-sm">
              <h2 className="mb-4 flex items-center gap-2 text-base font-semibold">
                <ShoppingBag className="size-4 text-primary" /> {t("Your order", "طلبك")}
              </h2>
              <div className="flex gap-4">
                <div className="relative size-20 shrink-0 overflow-hidden rounded-xl bg-muted">
                  <Image src={course.thumbnailUrl} alt={title} fill sizes="80px" className="object-cover" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium leading-snug">{title}</p>
                  <p className="mt-0.5 text-sm text-muted-foreground">{course.category}</p>
                  <div className="mt-2 flex flex-wrap gap-2 text-xs text-muted-foreground">
                    {course.lectures > 0 && <span className="rounded-full bg-muted px-2 py-0.5">{course.lectures} {t("lectures", "محاضرة")}</span>}
                    {course.duration && <span className="rounded-full bg-muted px-2 py-0.5">{course.duration}</span>}
                    <span className="rounded-full bg-muted px-2 py-0.5">{course.difficulty}</span>
                  </div>
                </div>
                <div className="text-end">
                  <p className="font-heading text-lg font-bold text-primary tabular-nums">{formatCurrency(total, CURRENCY)}</p>
                  {discount > 0 && <p className="text-xs text-muted-foreground line-through tabular-nums">{formatCurrency(base, CURRENCY)}</p>}
                </div>
              </div>
              <Button className="mt-5 w-full gap-1.5" onClick={() => setStep(2)} disabled={!payable}>
                {payable ? t("Continue to payment method", "متابعة لاختيار طريقة الدفع") : t("Pricing unavailable", "السعر غير متاح")}
                <ChevronRight className="size-4 rtl:rotate-180" />
              </Button>
              {!payable && (
                <p className="mt-2 text-center text-xs text-muted-foreground">
                  {t("Online pricing isn’t set for this course — please contact us to enroll.", "لم يتم ضبط سعر الدفع الإلكتروني لهذا الكورس — يرجى التواصل معنا للاشتراك.")}
                </p>
              )}
            </section>
          )}

          {/* STEP 2 — Method */}
          {step === 2 && (
            <section className="rounded-2xl border border-border/70 bg-card p-5 shadow-sm">
              <h2 className="mb-4 flex items-center gap-2 text-base font-semibold">
                <Wallet className="size-4 text-primary" /> {t("Choose a payment method", "اختر طريقة الدفع")}
              </h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {([
                  { id: "paypal" as Method, icon: Wallet, title: "PayPal", sub: t("Pay with your PayPal balance or bank.", "ادفع من رصيد PayPal أو حسابك البنكي.") },
                  { id: "card" as Method, icon: CreditCard, title: t("Debit / Credit card", "بطاقة سحب أو ائتمان"), sub: t("Visa, Mastercard & more — via PayPal.", "فيزا وماستركارد وغيرها — عبر PayPal.") },
                ]).map((m) => {
                  const selected = method === m.id;
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setMethod(m.id)}
                      className={cn(
                        "flex items-start gap-3 rounded-xl border p-4 text-start transition-colors",
                        selected ? "border-primary bg-primary/5 ring-1 ring-primary/20" : "border-border/70 hover:bg-muted/40",
                      )}
                    >
                      <span className={cn("grid size-10 shrink-0 place-items-center rounded-lg", selected ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground")}>
                        <m.icon className="size-5" />
                      </span>
                      <span className="min-w-0">
                        <span className="flex items-center gap-1.5 font-medium">
                          {m.title}
                          {selected && <CheckCircle2 className="size-4 text-primary" />}
                        </span>
                        <span className="mt-0.5 block text-xs text-muted-foreground">{m.sub}</span>
                      </span>
                    </button>
                  );
                })}
              </div>
              <div className="mt-5 flex items-center justify-between gap-3">
                <Button variant="ghost" onClick={() => setStep(1)}>{t("Back", "رجوع")}</Button>
                <Button className="gap-1.5" onClick={() => setStep(3)}>
                  {t("Continue", "متابعة")} <ChevronRight className="size-4 rtl:rotate-180" />
                </Button>
              </div>
            </section>
          )}

          {/* STEP 3 — Details + Pay */}
          {step === 3 && (
            <section className="space-y-5 rounded-2xl border border-border/70 bg-card p-5 shadow-sm">
              <h2 className="flex items-center gap-2 text-base font-semibold">
                <CreditCard className="size-4 text-primary" /> {t("Your details", "بياناتك")}
              </h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field icon={User} label={t("Full name", "الاسم بالكامل")} required>
                  <Input value={form.fullName} onChange={set("fullName")} className="ps-9" placeholder={t("e.g. Ahmed Habib", "مثال: أحمد حبيب")} required />
                </Field>
                <Field icon={Mail} label={t("Email", "البريد الإلكتروني")} required>
                  <Input type="email" value={form.email} onChange={set("email")} className="ps-9" placeholder="you@email.com" required />
                </Field>
                <Field icon={Phone} label={t("Phone", "رقم الهاتف")}>
                  <Input value={form.phone} onChange={set("phone")} className="ps-9" placeholder="+20 1XX XXX XXXX" inputMode="tel" />
                </Field>
                <Field icon={Globe} label={t("Country", "الدولة")} required>
                  <Input value={form.country} onChange={set("country")} className="ps-9" placeholder={t("e.g. Egypt", "مثال: مصر")} required />
                </Field>
              </div>

              <Separator />

              <div>
                <div className="mb-2 flex items-center justify-between">
                  <h3 className="flex items-center gap-2 text-sm font-semibold">
                    <Sparkles className="size-4 text-primary" /> {t("Proceed to payment", "إتمام الدفع")}
                  </h3>
                  <span className="text-sm font-semibold tabular-nums text-primary">{formatCurrency(total, CURRENCY)}</span>
                </div>
                {formValid ? (
                  <PaypalButton
                    key={method}
                    clientId={CLIENT_ID}
                    currency={CURRENCY}
                    amount={total}
                    description={title}
                    funding={method}
                    labels={{
                      loading: t("Loading PayPal…", "جارٍ تحميل PayPal…"),
                      failed: t("Couldn’t load PayPal. Check your connection and try again.", "تعذّر تحميل PayPal. تحقق من اتصالك وحاول مجددًا."),
                    }}
                    onPaid={onPaid}
                    onError={onPayError}
                  />
                ) : (
                  <div className="rounded-xl border border-dashed border-border/70 bg-muted/30 p-4 text-center text-sm text-muted-foreground">
                    {t("Fill in your name, a valid email and country to continue.", "أدخل اسمك وبريدًا صحيحًا والدولة للمتابعة.")}
                  </div>
                )}
                {CLIENT_ID === "test" && (
                  <p className="mt-2 text-center text-[11px] text-muted-foreground">
                    {t("Sandbox mode — set NEXT_PUBLIC_PAYPAL_CLIENT_ID to accept live payments.", "وضع الاختبار — عيّن NEXT_PUBLIC_PAYPAL_CLIENT_ID لاستقبال مدفوعات حقيقية.")}
                  </p>
                )}
              </div>

              <Button variant="ghost" onClick={() => setStep(2)}>{t("Back", "رجوع")}</Button>
            </section>
          )}
        </div>

        {/* Order summary (sticky) */}
        <aside className="lg:sticky lg:top-24">
          <div className="rounded-2xl border border-border/70 bg-card p-5 shadow-sm">
            <h2 className="mb-4 text-base font-semibold">{t("Order summary", "ملخّص الطلب")}</h2>
            <div className="flex items-center gap-3 border-b border-border/60 pb-4">
              <div className="relative size-12 shrink-0 overflow-hidden rounded-lg bg-muted">
                <Image src={course.thumbnailUrl} alt={title} fill sizes="48px" className="object-cover" />
              </div>
              <p className="text-sm font-medium leading-snug">{title}</p>
            </div>
            <dl className="space-y-2 py-4 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">{t("Subtotal", "الإجمالي الفرعي")}</dt>
                <dd className="tabular-nums">{formatCurrency(base, CURRENCY)}</dd>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-success">
                  <dt>{t("Discount", "الخصم")}</dt>
                  <dd className="tabular-nums">−{formatCurrency(discount, CURRENCY)}</dd>
                </div>
              )}
            </dl>
            <Separator />
            <div className="flex items-baseline justify-between pt-4">
              <span className="font-semibold">{t("Total", "الإجمالي")}</span>
              <span className="font-heading text-xl font-bold tabular-nums text-primary">{formatCurrency(total, CURRENCY)}</span>
            </div>
            {approx && total > 0 && (
              <p className="mt-1 text-end text-[11px] text-muted-foreground">
                ≈ {formatCurrency(course.salePriceEGP > 0 ? course.salePriceEGP : course.priceEGP, "EGP")} · {t("charged in USD", "يُحصّل بالدولار")}
              </p>
            )}
            <p className="mt-4 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
              <ShieldCheck className="size-3.5" /> {t("Buyer protection by PayPal", "حماية المشتري من PayPal")}
            </p>
          </div>

          <ul className="mt-4 space-y-2 px-1 text-xs text-muted-foreground">
            {[
              t("Lifetime access to course materials", "وصول مدى الحياة لمحتوى الكورس"),
              t("Accredited certificate on completion", "شهادة معتمدة عند الإتمام"),
              t("Instant confirmation by email", "تأكيد فوري عبر البريد"),
            ].map((line) => (
              <li key={line} className="flex items-center gap-2">
                <CheckCircle2 className="size-3.5 shrink-0 text-success" /> {line}
              </li>
            ))}
          </ul>
        </aside>
      </div>
    </div>
  );
}

function Field({
  icon: Icon, label, required, children,
}: {
  icon: React.ElementType;
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label>{label} {required && <span className="text-destructive">*</span>}</Label>
      <div className="relative">
        <Icon className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        {children}
      </div>
    </div>
  );
}
