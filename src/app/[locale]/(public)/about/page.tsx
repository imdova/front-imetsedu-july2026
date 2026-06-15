import { Target, Languages, ShieldCheck, Users, ArrowRight } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Pages" });
  return { title: t("aboutTitle") };
}

export default async function AboutPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Pages");
  const tm = await getTranslations("Marketing");

  const values = [
    { icon: Target, title: t("value1Title"), text: t("value1Text") },
    { icon: Languages, title: t("value2Title"), text: t("value2Text") },
    { icon: ShieldCheck, title: t("value3Title"), text: t("value3Text") },
    { icon: Users, title: t("value4Title"), text: t("value4Text") },
  ];
  const stats = [
    { value: "18.4K", label: t("statLearners") },
    { value: "38", label: t("statInstructors") },
    { value: "64", label: t("statCourses") },
    { value: "6", label: t("statCountries") },
  ];

  return (
    <>
      <section className="border-b border-border/70 bg-grid">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-background to-background" />
        <div className="relative mx-auto max-w-4xl px-4 py-20 text-center sm:px-6 lg:px-8">
          <h1 className="font-heading text-4xl font-bold tracking-tight sm:text-5xl">{t("aboutTitle")}</h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-muted-foreground">{t("aboutLead")}</p>
          <div className="mx-auto mt-12 grid max-w-2xl grid-cols-2 gap-6 sm:grid-cols-4">
            {stats.map((s) => (
              <div key={s.label}>
                <p className="font-heading text-3xl font-bold text-primary tabular-nums">{s.value}</p>
                <p className="mt-1 text-sm text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        <h2 className="font-heading text-2xl font-bold tracking-tight">{t("aboutMission")}</h2>
        <p className="mt-4 text-lg leading-relaxed text-muted-foreground">{t("aboutMissionText")}</p>
      </section>

      <section className="border-y border-border/70 bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <h2 className="text-center font-heading text-2xl font-bold tracking-tight">{t("aboutValuesTitle")}</h2>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {values.map((v) => (
              <div key={v.title} className="rounded-2xl border border-border/70 bg-card p-6 shadow-sm">
                <span className="grid size-11 place-items-center rounded-xl bg-primary/10 text-primary"><v.icon className="size-5" /></span>
                <h3 className="mt-4 font-heading text-base font-semibold">{v.title}</h3>
                <p className="mt-1.5 text-sm text-muted-foreground">{v.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-16 text-center sm:px-6 lg:px-8">
        <Button asChild size="lg" className="gap-1.5">
          <Link href="/courses">{tm("browseCourses")}<ArrowRight className="size-4 rtl:rotate-180" /></Link>
        </Button>
      </section>
    </>
  );
}
