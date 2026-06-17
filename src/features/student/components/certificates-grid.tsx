"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Award, Download, ShieldCheck, Share2, BadgeCheck } from "lucide-react";
import { toast } from "sonner";

import { Link } from "@/i18n/navigation";
import type { Certificate } from "@/lib/db/student";
import { formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { CertificateShareModal } from "./certificate-share-modal";

export function CertificatesGrid({ certificates, holderName }: { certificates: Certificate[]; holderName?: string }) {
  const t = useTranslations("Student");
  const [share, setShare] = React.useState<Certificate | null>(null);

  return (
    <>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {certificates.map((c) => (
          <div key={c.id} className="flex flex-col rounded-2xl border border-border/70 bg-card p-4 shadow-sm">
            {/* Ribbon thumbnail */}
            <div className="grid h-40 place-items-center rounded-xl bg-gradient-to-br from-emerald-200/70 to-emerald-100 text-emerald-700 dark:from-emerald-900/40 dark:to-emerald-950/30 dark:text-emerald-300">
              <Award className="size-14" strokeWidth={1.5} />
            </div>
            {/* Meta */}
            <div className="mt-3 flex items-center gap-1.5">
              <p className="truncate font-heading text-base font-bold">{c.course}</p>
              <BadgeCheck className="size-5 shrink-0 text-warning" />
            </div>
            <p className="mt-0.5 text-sm text-muted-foreground">{formatDate(c.issuedAt)}</p>
            <p className="font-mono text-xs text-muted-foreground/70">{c.code}</p>
            {/* Actions */}
            <div className="mt-3 grid grid-cols-2 gap-2">
              <Button size="sm" variant="outline" className="gap-1.5" disabled={!c.link}
                onClick={() => { if (!c.link) { toast.error(t("certNoFile")); return; } window.open(c.link, "_blank", "noopener"); }}>
                <Download className="size-4" /> {t("certPdf")}
              </Button>
              <Button size="sm" variant="outline" className="gap-1.5" onClick={() => setShare(c)}>
                <Share2 className="size-4" /> {t("certLinkedIn")}
              </Button>
            </div>
            <Button asChild size="sm" variant="outline" className="mt-2 w-full gap-1.5">
              <Link href={`/verify-certificate?code=${encodeURIComponent(c.code)}`}>
                <ShieldCheck className="size-4" /> {t("verifyCert")}
              </Link>
            </Button>
          </div>
        ))}
      </div>
      <CertificateShareModal cert={share} holderName={holderName} open={!!share} onOpenChange={(o) => !o && setShare(null)} />
    </>
  );
}
