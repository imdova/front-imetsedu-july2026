import { CheckCircle2 } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { BecomeForm } from "@/features/marketing/components/become-form";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Marketing" });
  return { title: t("becomeTitle") };
}

export default async function BecomeInstructorPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Marketing");

  const perks = [t("feature1Desc"), t("feature3Desc"), t("feature4Desc")];

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
        <div className="space-y-5">
          <h1 className="font-heading text-3xl font-bold tracking-tight sm:text-4xl">
            {t("becomeTitle")}
          </h1>
          <p className="text-lg text-muted-foreground">{t("becomeSubtitle")}</p>
          <ul className="space-y-3">
            {perks.map((p) => (
              <li key={p} className="flex items-start gap-2.5 text-sm">
                <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-success" />
                {p}
              </li>
            ))}
          </ul>
        </div>
        <BecomeForm />
      </div>
    </div>
  );
}
