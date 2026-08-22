"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Award, Download, ShieldCheck, Share2, BadgeCheck, Eye, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Link } from "@/i18n/navigation";
import type { Certificate } from "@/lib/db/student";
import { formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { CertificateShareModal } from "./certificate-share-modal";

export function CertificatesGrid({ certificates, holderName }: { certificates: Certificate[]; holderName?: string }) {
  const t = useTranslations("Student");
  const [share, setShare] = React.useState<Certificate | null>(null);
  const [downloading, setDownloading] = React.useState<string | null>(null);

  /** Save the PDF to the device (blob download); falls back to opening it if the host blocks fetch. */
  const download = async (c: Certificate) => {
    if (!c.link) { toast.error(t("certNoFile")); return; }
    setDownloading(c.id);
    try {
      const res = await fetch(c.link);
      if (!res.ok) throw new Error("fetch failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = `IMETS-Certificate-${c.code}.pdf`; a.click();
      URL.revokeObjectURL(url);
      toast.success(t("certDownloadStarted"));
    } catch {
      window.open(c.link, "_blank", "noopener");
    } finally {
      setDownloading(null);
    }
  };

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
            <div className="mt-3 grid grid-cols-3 gap-2">
              <Button size="sm" variant="outline" className="gap-1.5" disabled={!c.link}
                onClick={() => { if (!c.link) { toast.error(t("certNoFile")); return; } window.open(c.link, "_blank", "noopener"); }}>
                <Eye className="size-4" /> {t("certView")}
              </Button>
              <Button size="sm" variant="outline" className="gap-1.5" disabled={!c.link || downloading === c.id} onClick={() => download(c)}>
                {downloading === c.id ? <Loader2 className="size-4 animate-spin" /> : <Download className="size-4" />} {t("certDownload")}
              </Button>
              <Button size="sm" className="gap-1.5" onClick={() => setShare(c)}>
                <Share2 className="size-4" /> {t("certShare")}
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
