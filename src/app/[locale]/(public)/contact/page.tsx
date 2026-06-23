import type { Metadata } from "next";
import { Mail, MapPin, Phone } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { ContactForm } from "@/features/marketing/components/contact-form";
import { staticPageMeta } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Marketing" });
  return staticPageMeta({ title: t("contactTitle"), description: t("contactSubtitle"), path: "/contact", locale });
}

export default async function ContactPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Marketing");

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-10 space-y-2">
        <h1 className="font-heading text-3xl font-bold tracking-tight">
          {t("contactTitle")}
        </h1>
        <p className="text-muted-foreground">{t("contactSubtitle")}</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
        <ContactForm />
        <aside className="space-y-4">
          <h2 className="font-heading text-lg font-semibold">{t("contactInfo")}</h2>
          <ul className="space-y-4 text-sm">
            <li className="flex items-start gap-3">
              <Mail className="mt-0.5 size-5 text-primary" />
              <span>hello@imetsedu.com</span>
            </li>
            <li className="flex items-start gap-3">
              <Phone className="mt-0.5 size-5 text-primary" />
              <span dir="ltr">+966 11 000 0000</span>
            </li>
            <li className="flex items-start gap-3">
              <MapPin className="mt-0.5 size-5 text-primary" />
              <span>{t("contactAddress")}</span>
            </li>
          </ul>
        </aside>
      </div>
    </div>
  );
}
