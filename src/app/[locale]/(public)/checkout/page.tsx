import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { ShoppingBag } from "lucide-react";

import { Link } from "@/i18n/navigation";
import { dal } from "@/lib/dal";
import { Button } from "@/components/ui/button";
import { PaypalCheckout } from "@/features/checkout/components/paypal-checkout";

export const metadata: Metadata = { title: "Checkout", robots: { index: false } };

export default async function CheckoutPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ course?: string }>;
}) {
  const { locale } = await params;
  const { course: courseParam } = await searchParams;
  setRequestLocale(locale);

  const res = await dal.courses.fetchCourses();
  const list = res.ok ? res.data : [];
  const course = courseParam
    ? list.find((c) => c.slug === courseParam) ?? list.find((c) => c.id === courseParam) ?? null
    : null;

  const ar = locale === "ar";

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:py-12">
      {course ? (
        <PaypalCheckout course={course} locale={locale} />
      ) : (
        <div className="mx-auto max-w-md py-16 text-center">
          <div className="mx-auto mb-4 grid size-14 place-items-center rounded-2xl bg-muted text-muted-foreground">
            <ShoppingBag className="size-7" />
          </div>
          <h1 className="font-heading text-xl font-bold">
            {ar ? "لم يتم تحديد كورس" : "No course selected"}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {ar
              ? "اختر كورسًا أولًا ثم تابع لإتمام الشراء."
              : "Pick a course first, then continue to checkout."}
          </p>
          <Button asChild className="mt-5">
            <Link href="/courses">{ar ? "تصفّح الكورسات" : "Browse courses"}</Link>
          </Button>
        </div>
      )}
    </div>
  );
}
