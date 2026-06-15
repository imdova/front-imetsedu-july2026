import { ShieldCheck } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { VerifyForm } from "@/features/marketing/components/verify-form";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Marketing" });
  return { title: t("verifyTitle") };
}

export default async function VerifyCertificatePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Marketing");

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mb-8 text-center">
        <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-primary/10 text-primary">
          <ShieldCheck className="size-7" />
        </span>
        <h1 className="mt-4 font-heading text-3xl font-bold tracking-tight">
          {t("verifyTitle")}
        </h1>
        <p className="mt-2 text-muted-foreground">{t("verifySubtitle")}</p>
      </div>
      <VerifyForm />
    </div>
  );
}
