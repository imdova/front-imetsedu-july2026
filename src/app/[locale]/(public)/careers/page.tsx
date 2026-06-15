import { MapPin, ArrowRight } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Pages" });
  return { title: t("careersTitle") };
}

const ROLES = [
  { title: "Senior Frontend Engineer", dept: "Engineering", location: "Cairo / Remote" },
  { title: "Curriculum Designer — Finance", dept: "Academics", location: "Riyadh" },
  { title: "Admissions Counselor (Arabic)", dept: "Admissions", location: "Cairo" },
  { title: "Growth Marketing Lead", dept: "Marketing", location: "Remote" },
  { title: "Student Success Manager", dept: "Operations", location: "Dubai" },
];

export default async function CareersPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Pages");

  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="text-center">
        <h1 className="font-heading text-4xl font-bold tracking-tight sm:text-5xl">{t("careersTitle")}</h1>
        <p className="mx-auto mt-5 max-w-2xl text-lg text-muted-foreground">{t("careersLead")}</p>
      </div>

      <h2 className="mt-14 font-heading text-xl font-bold tracking-tight">{t("openRoles")}</h2>
      <ul className="mt-6 space-y-3">
        {ROLES.map((r) => (
          <li
            key={r.title}
            className="flex flex-col gap-4 rounded-2xl border border-border/70 bg-card p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <h3 className="font-heading text-base font-semibold">{r.title}</h3>
              <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                <Badge variant="secondary">{r.dept}</Badge>
                <span className="inline-flex items-center gap-1"><MapPin className="size-3.5" />{r.location}</span>
              </div>
            </div>
            <Button variant="outline" className="gap-1.5 self-start sm:self-center">
              {t("applyNow")}<ArrowRight className="size-4 rtl:rotate-180" />
            </Button>
          </li>
        ))}
      </ul>
    </div>
  );
}
