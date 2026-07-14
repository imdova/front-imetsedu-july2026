import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { CheckCircle2, BadgeCheck } from "lucide-react";

import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";

export const metadata: Metadata = { title: "Payment successful", robots: { index: false } };

export default async function PaySuccessPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ course?: string; txn?: string; amount?: string; currency?: string; token?: string }>;
}) {
  const { locale } = await params;
  const { course, txn, amount, currency, token } = await searchParams;
  setRequestLocale(locale);
  const ar = locale === "ar";
  const t = (en: string, arText: string) => (ar ? arText : en);

  const amountNum = amount ? Number(amount) : 0;

  return (
    <div className="mx-auto w-full max-w-lg px-4 py-14 text-center sm:py-20">
      <div className="mx-auto mb-6 grid size-20 place-items-center rounded-full bg-success/10 text-success">
        <CheckCircle2 className="size-11" />
      </div>
      <h1 className="font-heading text-2xl font-bold sm:text-3xl">{t("Payment successful", "تم الدفع بنجاح")}</h1>
      <p className="mt-3 text-muted-foreground">
        {course ? (
          <>
            {t("Thank you! Your payment for ", "شكرًا لك! تم استلام دفعتك لـ ")}
            <span className="font-medium text-foreground">{course}</span>
            {t(" has been received.", " بنجاح.")}
          </>
        ) : (
          t("Thank you! Your payment has been received.", "شكرًا لك! تم استلام دفعتك بنجاح.")
        )}
      </p>

      {(amountNum > 0 || txn) && (
        <div className="mx-auto mt-6 max-w-xs space-y-2 rounded-2xl border border-border/70 bg-card p-4 text-sm shadow-sm">
          {amountNum > 0 && (
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">{t("Amount paid", "المبلغ المدفوع")}</span>
              <span className="font-semibold tabular-nums">{formatCurrency(amountNum, currency || "USD")}</span>
            </div>
          )}
          {txn && (
            <div className="flex items-center justify-between gap-2">
              <span className="text-muted-foreground">{t("Transaction", "رقم العملية")}</span>
              <span className="inline-flex items-center gap-1 truncate font-mono text-xs">
                <BadgeCheck className="size-3.5 shrink-0 text-success" />{txn}
              </span>
            </div>
          )}
        </div>
      )}

      <p className="mt-6 text-sm text-muted-foreground">
        {t("A receipt and access details are on their way to your email.", "سيصلك الإيصال وتفاصيل الدخول على بريدك الإلكتروني.")}
      </p>

      <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
        {token && (
          <Button asChild variant="outline">
            <Link href={`/pay/${token}`}>{t("Make another payment", "إجراء دفعة أخرى")}</Link>
          </Button>
        )}
        <Button asChild>
          <Link href="/courses">{t("Browse courses", "تصفّح الكورسات")}</Link>
        </Button>
      </div>
    </div>
  );
}
