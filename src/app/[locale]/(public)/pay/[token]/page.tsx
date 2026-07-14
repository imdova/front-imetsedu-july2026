import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { LinkIcon } from "lucide-react";

import { Link } from "@/i18n/navigation";
import { dal } from "@/lib/dal";
import { Button } from "@/components/ui/button";
import { PayLinkView } from "@/features/checkout/components/pay-link-view";

export const metadata: Metadata = { title: "Payment", robots: { index: false } };

export default async function PayPage({
  params,
}: {
  params: Promise<{ locale: string; token: string }>;
}) {
  const { locale, token } = await params;
  setRequestLocale(locale);
  const ar = locale === "ar";

  const res = await dal.paymentLinks.fetchPublicPaymentLink(token);

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-8 sm:py-12">
      {res.ok ? (
        <PayLinkView link={res.data} locale={locale} />
      ) : (
        <div className="mx-auto max-w-md py-16 text-center">
          <div className="mx-auto mb-4 grid size-14 place-items-center rounded-2xl bg-muted text-muted-foreground">
            <LinkIcon className="size-7" />
          </div>
          <h1 className="font-heading text-xl font-bold">
            {ar ? "الرابط غير صالح" : "Payment link not found"}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {ar
              ? "هذا الرابط غير صحيح أو تم حذفه. يرجى التواصل معنا للحصول على رابط جديد."
              : "This link is invalid or has been removed. Please contact us for a new one."}
          </p>
          <Button asChild className="mt-5">
            <Link href="/courses">{ar ? "تصفّح الكورسات" : "Browse courses"}</Link>
          </Button>
        </div>
      )}
    </div>
  );
}
