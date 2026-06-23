import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { LegalPage } from "@/features/public/components/legal-page";
import { staticPageMeta } from "@/lib/seo";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Pages" });
  return staticPageMeta({ title: t("termsTitle"), description: t("termsMeta"), path: "/terms", locale });
}

export default async function TermsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Pages");
  const sections = [1, 2, 3, 4].map((i) => ({
    title: t(`term${i}Title` as never),
    text: t(`term${i}Text` as never),
  }));
  return <LegalPage title={t("termsTitle")} sections={sections} />;
}
