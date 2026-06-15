"use client";

import { useTranslations } from "next-intl";
import { Award, Download, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

import { Link } from "@/i18n/navigation";
import type { Certificate } from "@/lib/db/student";
import { formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export function CertificatesGrid({ certificates }: { certificates: Certificate[] }) {
  const t = useTranslations("Student");

  return (
    <div className="grid gap-6 sm:grid-cols-2">
      {certificates.map((c) => (
        <div key={c.id} className="overflow-hidden rounded-2xl border border-border/70 bg-card shadow-sm">
          <div className="flex items-center gap-3 bg-gradient-to-br from-primary to-[oklch(0.46_0.2_286)] p-5 text-white">
            <Award className="size-8" />
            <div>
              <p className="font-heading text-base font-semibold">{c.course}</p>
              <p className="text-sm text-white/80">{t("issuedOn")} {formatDate(c.issuedAt)}</p>
            </div>
          </div>
          <div className="flex items-center justify-between gap-3 p-4">
            <span className="font-mono text-xs text-muted-foreground">{t("certCode")}: {c.code}</span>
            <div className="flex gap-2">
              <Button asChild size="sm" variant="outline" className="gap-1.5">
                <Link href={`/verify-certificate?code=${encodeURIComponent(c.code)}`}>
                  <ShieldCheck className="size-4" /> {t("verifyCert")}
                </Link>
              </Button>
              <Button
                size="sm"
                className="gap-1.5"
                disabled={!c.link}
                onClick={() => {
                  if (!c.link) { toast.error(t("certNoFile")); return; }
                  window.open(c.link, "_blank", "noopener");
                }}
              >
                <Download className="size-4" /> {t("downloadCert")}
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
