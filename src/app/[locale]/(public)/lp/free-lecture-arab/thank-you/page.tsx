import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";

import { CphqThankYou } from "@/features/marketing/components/cphq-thank-you";

export const metadata: Metadata = {
  title: "تم تسجيلك بنجاح | محاضرة IMETS المجانية",
  robots: { index: false },
};

/** Shared thank-you for the Arabic free-lecture landings (course name comes from
 *  the stored lead in the browser). */
export default async function ArabThankYouPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <CphqThankYou whatsappNumber="201142293143" dialect="arab" region="Arab" />;
}
