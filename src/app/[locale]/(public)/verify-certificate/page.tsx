import { CheckCircle2, XCircle, ShieldCheck, Calendar, GraduationCap, Search } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { dal } from "@/lib/dal";
import { formatDate } from "@/lib/utils";
import { VerifyForm } from "@/features/marketing/components/verify-form";

const ISSUER = "IMETS School of Business";

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
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ code?: string | string[] }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Marketing");
  const sp = await searchParams;
  const code = (Array.isArray(sp.code) ? sp.code[0] : sp.code)?.trim();

  // With a code: resolve it against the signed-in student's certificate registry.
  if (code) {
    const [certsRes, profileRes] = await Promise.all([
      dal.student.fetchCertificates(),
      dal.student.fetchProfile(),
    ]);
    const cert = (certsRes.ok ? certsRes.data : []).find(
      (c) => c.code.trim().toLowerCase() === code.toLowerCase(),
    );
    const recipient = profileRes.ok ? profileRes.data.name : undefined;

    return (
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-6 text-center">
          <h1 className="font-heading text-4xl font-bold tracking-tight">{t("verifyPageTitle")}</h1>
          <p className="mx-auto mt-2 max-w-md text-muted-foreground">{t("verifyPageSubtitle")}</p>
          <p className="mt-3 text-sm text-muted-foreground">
            {t("verifyCode")}: <span className="font-mono">{code}</span>
          </p>
        </div>

        {cert ? (
          <div className="rounded-2xl border border-success/30 bg-success/[0.04] p-6 sm:p-8">
            <div className="flex items-center gap-4">
              <span className="grid size-12 shrink-0 place-items-center rounded-full bg-success/15 text-success">
                <CheckCircle2 className="size-6" />
              </span>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-success">{t("verifyVerifiedLabel")}</p>
                <p className="font-heading text-2xl font-bold">{t("verifyAuthentic")}</p>
              </div>
            </div>

            <dl className="mt-6 grid gap-6 sm:grid-cols-2">
              <Field label={t("verifyRecipient")}>{recipient ?? "—"}</Field>
              <Field label={t("verifyProgramme")}>
                <span className="inline-flex items-center gap-1.5"><GraduationCap className="size-4 text-primary" />{cert.course}</span>
              </Field>
              <Field label={t("verifyIssued")}>
                <span className="inline-flex items-center gap-1.5"><Calendar className="size-4 text-muted-foreground" />{formatDate(cert.issuedAt)}</span>
              </Field>
              <Field label={t("verifyIssuer")}>{ISSUER}</Field>
            </dl>

            <div className="mt-6 overflow-hidden rounded-xl border border-border/70 bg-card">
              {cert.link ? (
                // eslint-disable-next-line jsx-a11y/iframe-has-title
                <iframe src={cert.link} className="h-[460px] w-full" />
              ) : (
                <div className="grid h-[200px] place-items-center text-sm text-muted-foreground">{t("verifyNoPreview")}</div>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-5 rounded-2xl border border-destructive/30 bg-destructive/[0.04] p-6 text-center">
            <p className="flex items-center justify-center gap-2 font-medium text-destructive">
              <XCircle className="size-5" /> {t("verifyNotFound")}
            </p>
            <p className="text-sm text-muted-foreground">{t("verifyNotFoundHint")}</p>
          </div>
        )}

        <div className="mt-8">
          <p className="mb-3 flex items-center gap-2 text-sm font-semibold"><Search className="size-4" />{t("verifySearchAgain")}</p>
          <VerifyForm />
        </div>
      </div>
    );
  }

  // No code: show the lookup form.
  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mb-8 text-center">
        <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-primary/10 text-primary">
          <ShieldCheck className="size-7" />
        </span>
        <h1 className="mt-4 font-heading text-3xl font-bold tracking-tight">{t("verifyPageTitle")}</h1>
        <p className="mt-2 text-muted-foreground">{t("verifyPageSubtitle")}</p>
      </div>
      <VerifyForm />
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</dt>
      <dd className="mt-1 font-semibold">{children}</dd>
    </div>
  );
}
