import { FileText, ArrowRight, GraduationCap } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { Link } from "@/i18n/navigation";
import { dal } from "@/lib/dal";
import { ROUTES } from "@integration/constants";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";

export default async function StudentTranscriptsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Student");
  const res = await dal.student.fetchTranscript();
  const rows = res.ok ? res.data : [];

  return (
    <div className="mx-auto max-w-[1000px] space-y-6">
      <PageHeader title={t("transcriptsTitle")} description={t("transcriptsSubtitle")}>
        <Button asChild variant="outline" className="gap-1.5">
          <Link href={ROUTES.STUDENT.TRANSCRIPT}>
            <FileText className="size-4" />
            {t("transcriptsViewFull")}
          </Link>
        </Button>
      </PageHeader>

      {rows.length === 0 ? (
        <div className="grid place-items-center rounded-2xl border border-dashed border-border/70 bg-card py-20 text-center">
          <GraduationCap className="size-12 text-muted-foreground/40" />
          <p className="mt-3 font-semibold">{t("transcriptsEmpty")}</p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {rows.map((r, i) => (
            <Link
              key={`${r.course}-${i}`}
              href={ROUTES.STUDENT.TRANSCRIPT}
              className="group flex items-center gap-4 rounded-2xl border border-border/70 bg-card p-5 shadow-sm transition-colors hover:border-primary/40"
            >
              <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                <FileText className="size-6" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate font-heading font-semibold">{r.course}</p>
                <p className="text-sm text-muted-foreground tabular-nums">
                  {t("transcriptsCourseAverage", { avg: r.average })}
                  {r.credits ? ` · ${r.credits} ${t("transcriptsCredits")}` : ""}
                </p>
              </div>
              <ArrowRight className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 rtl:rotate-180 rtl:group-hover:-translate-x-0.5" />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
