import { Star } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { Link } from "@/i18n/navigation";
import { dal } from "@/lib/dal";
import { getInitials } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Marketing" });
  return { title: t("instructorsHeroTitle") };
}

export default async function InstructorsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Marketing");

  const res = await dal.lookups.fetchInstructors();
  const instructors = res.ok ? res.data : [];

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-10 space-y-2">
        <h1 className="font-heading text-3xl font-bold tracking-tight">
          {t("instructorsHeroTitle")}
        </h1>
        <p className="text-muted-foreground">{t("instructorsHeroSubtitle")}</p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {instructors.map((ins, i) => (
          <Link
            key={ins.id}
            href={`/instructors/${ins.id}`}
            className="flex items-center gap-4 rounded-2xl border border-border/70 bg-card p-5 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md"
          >
            <Avatar className="size-16 border">
              <AvatarFallback className="bg-primary/10 text-lg font-semibold text-primary">
                {getInitials(ins.label)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="font-medium">{ins.label}</p>
              <p className="truncate text-sm text-muted-foreground">{ins.title}</p>
              <p className="mt-1 inline-flex items-center gap-1 text-xs text-muted-foreground">
                <Star className="size-3.5 fill-warning text-warning" />
                {(4.5 + (i % 5) * 0.1).toFixed(1)} · {t("yearsExperience", { count: 6 + i })}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
