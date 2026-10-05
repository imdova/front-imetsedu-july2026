"use client";

import * as React from "react";
import Image from "next/image";
import { ShieldCheck, Lock, GraduationCap, Receipt, Loader2, CreditCard } from "lucide-react";
import { toast } from "sonner";

import { dal } from "@/lib/dal";
import type { PublicPaymentLink, PaymentType } from "@/lib/dal/payment-links";
import { useRouter } from "@/i18n/navigation";
import { formatCurrency } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { PAYPAL_CLIENT_ID, PAYPAL_CURRENCY } from "@/lib/paypal";
import { Button } from "@/components/ui/button";
import { PaypalButton, type PayPalCapture } from "./paypal-button";

const TYPE_LABELS: Record<PaymentType, [string, string]> = {
  cash: ["Cash / Full payment", "دفعة كاملة"],
  installment_1: ["1st installment", "القسط الأول"],
  installment_2: ["2nd installment", "القسط الثاني"],
  installment_3: ["3rd installment", "القسط الثالث"],
};

export function PayLinkView({ link, locale }: { link: PublicPaymentLink; locale: string }) {
  const t = (en: string, ar: string) => (locale === "ar" ? ar : en);
  const router = useRouter();
  const [redirecting, setRedirecting] = React.useState(false);
  const [stripeReady, setStripeReady] = React.useState(false);
  const [stripeBusy, setStripeBusy] = React.useState(false);

  // The card button only appears where the server actually has Stripe keys, so
  // a half-configured environment shows PayPal alone instead of a button that
  // fails on click.
  React.useEffect(() => {
    let alive = true;
    dal.stripe.fetchStripeStatus().then((res) => {
      if (alive && res.ok) setStripeReady(res.data.configured);
    });
    return () => {
      alive = false;
    };
  }, []);

  /**
   * Stripe is a redirect, not an in-page capture: the session is created and
   * priced server-side, and the payment is recorded by the webhook. Nothing
   * about the money passes through this component.
   */
  const payWithCard = async () => {
    setStripeBusy(true);
    const res = await dal.stripe.createStripeCheckout(link.token);
    if (!res.ok) {
      setStripeBusy(false);
      toast.error(res.error || t("Could not start the card payment.", "تعذّر بدء الدفع بالبطاقة."));
      return;
    }
    window.location.href = res.data.url;
  };

  const typeLabel = (TYPE_LABELS[link.paymentType] ?? TYPE_LABELS.cash)[locale === "ar" ? 1 : 0];

  const onPaid = React.useCallback(async (cap: PayPalCapture) => {
    const txn = cap?.purchase_units?.[0]?.payments?.captures?.[0]?.id || cap?.id || "";
    const payerName = [cap?.payer?.name?.given_name, cap?.payer?.name?.surname].filter(Boolean).join(" ");
    setRedirecting(true);
    try {
      await dal.paymentLinks.markPaymentLinkPaid(link.token, {
        transactionId: txn,
        payerName,
        payerEmail: cap?.payer?.email_address,
      });
    } catch {
      /* payment already captured — record best-effort, still show success */
    }
    const params = new URLSearchParams({
      course: link.courseTitle,
      txn,
      amount: String(link.total),
      currency: link.currency,
      token: link.token,
    });
    router.push(`/pay/success?${params.toString()}`);
  }, [link, router]);

  const onError = React.useCallback(() => {
    toast.error(t("Payment could not be completed. Please try again.", "تعذّر إتمام الدفع. يرجى المحاولة مرة أخرى."));
  }, [locale]); // eslint-disable-line react-hooks/exhaustive-deps

  if (redirecting) {
    return (
      <div className="flex min-h-[300px] flex-col items-center justify-center gap-3 text-center">
        <Loader2 className="size-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">{t("Confirming your payment…", "جارٍ تأكيد عملية الدفع…")}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="font-heading text-2xl font-bold sm:text-3xl">{t("Complete your payment", "أكمل عملية الدفع")}</h1>
        <p className="text-sm text-muted-foreground">{t("Secure payment by card or PayPal.", "دفع آمن بالبطاقة أو عبر PayPal.")}</p>
      </div>

      <div className="rounded-2xl border border-border/70 bg-card p-5 shadow-sm sm:p-6">
        <div className="flex items-center gap-3 border-b border-border/60 pb-4">
          {link.courseImage ? (
            <span className="relative h-[73px] w-[140px] shrink-0 overflow-hidden rounded-xl bg-muted">
              <Image src={link.courseImage} alt="" fill sizes="140px" className="object-cover" />
            </span>
          ) : (
            <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary"><GraduationCap className="size-5" /></span>
          )}
          <div className="min-w-0">
            <p className="font-semibold leading-snug">{link.courseTitle}</p>
            <p className="text-xs text-muted-foreground">{typeLabel}</p>
          </div>
        </div>

        <dl className="space-y-2 py-4 text-sm">
          <div className="flex justify-between"><dt className="text-muted-foreground">{t("Amount", "المبلغ")}</dt><dd className="tabular-nums">{formatCurrency(link.amount, link.currency)}</dd></div>
          {link.discount > 0 && (
            <div className="flex justify-between text-success"><dt>{t("Discount", "الخصم")}</dt><dd className="tabular-nums">−{formatCurrency(link.discount, link.currency)}</dd></div>
          )}
          <div className="flex justify-between"><dt className="text-muted-foreground">{t("Subtotal", "الإجمالي الفرعي")}</dt><dd className="tabular-nums">{formatCurrency(link.subtotal, link.currency)}</dd></div>
          <div className="flex justify-between"><dt className="text-muted-foreground">{t("Taxes", "الضرائب")}</dt><dd className="tabular-nums">{formatCurrency(link.tax, link.currency)}</dd></div>
        </dl>
        <Separator />
        <div className="flex items-baseline justify-between py-4">
          <span className="flex items-center gap-1.5 font-semibold"><Receipt className="size-4 text-primary" /> {t("Total due", "الإجمالي المستحق")}</span>
          <span className="font-heading text-2xl font-bold tabular-nums text-primary">{formatCurrency(link.total, link.currency)}</span>
        </div>

        {link.total > 0 ? (
          <div className="space-y-3">
            {stripeReady && (
              <>
                <Button
                  type="button"
                  size="lg"
                  className="w-full gap-2"
                  disabled={stripeBusy}
                  onClick={payWithCard}
                >
                  {stripeBusy ? <Loader2 className="size-4 animate-spin" /> : <CreditCard className="size-4" />}
                  {t("Pay by card", "ادفع بالبطاقة")}
                </Button>
                <div className="flex items-center gap-3 text-[11px] uppercase tracking-wide text-muted-foreground">
                  <span className="h-px flex-1 bg-border" />
                  {t("or", "أو")}
                  <span className="h-px flex-1 bg-border" />
                </div>
              </>
            )}
            <PaypalButton
              clientId={PAYPAL_CLIENT_ID}
              currency={PAYPAL_CURRENCY}
              amount={link.total}
              description={link.courseTitle}
              label="buynow"
              labels={{
                loading: t("Loading PayPal…", "جارٍ تحميل PayPal…"),
                failed: t("Couldn’t load PayPal. Check your connection and try again.", "تعذّر تحميل PayPal. تحقق من اتصالك وحاول مجددًا."),
              }}
              onPaid={onPaid}
              onError={onError}
            />
          </div>
        ) : (
          <p className="rounded-xl border border-dashed border-border/70 p-4 text-center text-sm text-muted-foreground">
            {t("This link has no payable amount.", "لا يوجد مبلغ مستحق لهذا الرابط.")}
          </p>
        )}

        <p className="mt-4 flex items-center justify-center gap-3 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1"><Lock className="size-3.5" /> {t("SSL secured", "اتصال آمن")}</span>
          <span className="inline-flex items-center gap-1"><ShieldCheck className="size-3.5" /> {t("Buyer protection", "حماية المشتري")}</span>
        </p>
      </div>
    </div>
  );
}
