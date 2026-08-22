"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Award, Download, Share2, BadgeCheck, Loader2 } from "lucide-react";
import { toast } from "sonner";

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
            {/* Certificate preview (actual file) — falls back to the ribbon when no file */}
            <CertificatePreview link={c.link} title={c.course} onOpen={() => c.link && window.open(c.link, "_blank", "noopener")} />
            {/* Meta */}
            <div className="mt-3 flex items-center gap-1.5">
              <p className="truncate font-heading text-base font-bold">{c.course}</p>
              <BadgeCheck className="size-5 shrink-0 text-warning" />
            </div>
            <p className="mt-0.5 text-sm text-muted-foreground">{formatDate(c.issuedAt)}</p>
            <p className="font-mono text-xs text-muted-foreground/70">{c.code}</p>
            {/* Actions */}
            <div className="mt-3 grid grid-cols-2 gap-2">
              <Button size="sm" variant="outline" className="gap-1.5" disabled={!c.link || downloading === c.id} onClick={() => download(c)}>
                {downloading === c.id ? <Loader2 className="size-4 animate-spin" /> : <Download className="size-4" />} {t("certDownload")}
              </Button>
              <Button size="sm" className="gap-1.5" onClick={() => setShare(c)}>
                <Share2 className="size-4" /> {t("certShare")}
              </Button>
            </div>
          </div>
        ))}
      </div>
      <CertificateShareModal cert={share} holderName={holderName} open={!!share} onOpenChange={(o) => !o && setShare(null)} />
    </>
  );
}

/**
 * Renders the real certificate file as the card thumbnail: PDFs through an
 * inline viewer (first page, toolbar hidden), images directly. Clicking opens
 * the file; the ribbon placeholder shows only when there is no file yet.
 */
function CertificatePreview({ link, title, onOpen }: { link?: string; title: string; onOpen: () => void }) {
  const isPdf = !!link && /\.pdf(\?|$)/i.test(link);
  const isImage = !!link && /\.(png|jpe?g|webp|gif)(\?|$)/i.test(link);
  if (!link || (!isPdf && !isImage)) {
    return (
      <div className="grid h-44 place-items-center rounded-xl bg-gradient-to-br from-emerald-200/70 to-emerald-100 text-emerald-700 dark:from-emerald-900/40 dark:to-emerald-950/30 dark:text-emerald-300">
        <Award className="size-14" strokeWidth={1.5} />
      </div>
    );
  }
  return (
    <button type="button" onClick={onOpen} title={title}
      className="group relative block h-44 w-full overflow-hidden rounded-xl border border-border/70 bg-muted/30 text-left">
      {isPdf ? (
        <iframe
          src={`${link}#toolbar=0&navpanes=0&scrollbar=0&view=FitH`}
          title={title}
          className="pointer-events-none h-[calc(100%+4px)] w-[calc(100%+4px)] -translate-x-[2px] -translate-y-[2px] border-0 bg-white"
          loading="lazy"
        />
      ) : (
        // eslint-disable-next-line @next/next/no-img-element -- S3-hosted certificate image
        <img src={link} alt={title} className="h-full w-full object-cover" loading="lazy" />
      )}
      <span className="absolute inset-0 grid place-items-center bg-black/0 text-xs font-medium text-white opacity-0 transition group-hover:bg-black/35 group-hover:opacity-100">
        Open certificate
      </span>
    </button>
  );
}
