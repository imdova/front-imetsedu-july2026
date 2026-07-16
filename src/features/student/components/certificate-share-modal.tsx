"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { ShieldCheck, Info, Share2, Copy, GraduationCap, X } from "lucide-react";
import { toast } from "sonner";

import type { Certificate } from "@/lib/db/student";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useResetOnChange } from "@/hooks/use-reset-on-change";

const ORG = "IMETS Academy";

export function CertificateShareModal({
  cert, holderName, open, onOpenChange,
}: {
  cert: Certificate | null;
  holderName?: string;
  open: boolean;
  onOpenChange: (o: boolean) => void;
}) {
  const t = useTranslations("Student");
  const credentialUrl = React.useMemo(() => {
    const path = cert?.link || `/verify-certificate?code=${encodeURIComponent(cert?.code ?? "")}`;
    if (/^https?:\/\//.test(path)) return path;
    if (typeof window !== "undefined") return `${window.location.origin}${path.startsWith("/") ? "" : "/"}${path}`;
    return path;
  }, [cert]);

  const [message, setMessage] = React.useState("");
  useResetOnChange([cert, t], () => {
    if (cert) setMessage(t("certSharePostDefault", { name: cert.course }));
  });

  if (!cert) return null;

  const copy = (text: string) => {
    navigator.clipboard?.writeText(text);
    toast.success(t("certShareCopied"));
  };

  const addToLinkedIn = () => {
    const params = new URLSearchParams({
      startTask: "CERTIFICATION_NAME",
      name: cert.course,
      organizationName: ORG,
      certUrl: credentialUrl,
      certId: cert.code,
    });
    window.open(`https://www.linkedin.com/profile/add?${params.toString()}`, "_blank", "noopener");
  };

  const postToFeed = () => {
    navigator.clipboard?.writeText(message);
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(credentialUrl)}`, "_blank", "noopener");
    toast.success(t("certSharePosted"));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="overflow-hidden p-0 sm:max-w-3xl" showCloseButton={false}>
        <div className="grid md:grid-cols-[40%_1fr]">
          {/* Left — credential preview */}
          <div className="flex flex-col gap-4 border-b border-border/70 bg-muted/30 p-6 md:border-b-0 md:border-e">
            <span className="inline-flex items-center gap-2 text-[0.68rem] font-bold uppercase tracking-wider text-muted-foreground">
              <ShieldCheck className="size-4 text-success" /> {t("certShareVerified")}
            </span>
            <h2 className="font-heading text-2xl font-bold leading-snug">{t("certShareTitle")}</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">{t("certShareCongrats", { name: cert.course })}</p>
            <div className="relative overflow-hidden rounded-2xl border border-border/70 bg-card p-6 text-center shadow-sm">
              <p className="mb-3 text-[0.68rem] font-semibold uppercase tracking-wider text-muted-foreground">{t("certShareCertOfCompletion")}</p>
              <p className="mb-2 text-sm italic text-muted-foreground">{t("certShareCertify")}</p>
              {holderName && <p className="mb-2 font-heading text-xl font-bold leading-tight">{holderName}</p>}
              <p className="mb-1.5 text-xs leading-normal text-muted-foreground">{t("certShareCompleted")}</p>
              <p className="mb-4 text-[0.95rem] font-bold leading-snug text-primary">{cert.course}</p>
              <span className="inline-flex items-center gap-2 text-[0.68rem] font-bold uppercase tracking-wider text-muted-foreground">
                <GraduationCap className="size-5 text-muted-foreground/70" /> {ORG}
              </span>
            </div>
            <p className="flex items-start gap-2 text-xs leading-relaxed text-muted-foreground">
              <Info className="mt-0.5 size-4 shrink-0" /> {t("certShareVerifiable")}
            </p>
          </div>

          {/* Right — sharing config */}
          <div className="relative flex flex-col gap-5 overflow-y-auto p-6">
            <button type="button" onClick={() => onOpenChange(false)} className="absolute end-5 top-5 text-muted-foreground hover:text-foreground" aria-label={t("quizCancel")}><X className="size-5" /></button>
            <div>
              <h2 className="pe-10 font-heading text-xl font-bold leading-snug">{t("certShareConfig")}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{t("certShareFeed")}</p>
            </div>
            <Textarea rows={5} value={message} onChange={(e) => setMessage(e.target.value)} className="min-h-[120px]" />

            <CopyField label={t("certShareCredId")} value={cert.code} onCopy={copy} />
            <CopyField label={t("certShareCredUrl")} value={credentialUrl} onCopy={copy} />

            <Button onClick={addToLinkedIn} className="gap-3 bg-[#0a66c2] text-white hover:bg-[#004182]">
              <span className="grid size-6 place-items-center rounded-sm bg-white text-sm font-bold text-[#0a66c2]">in</span>
              {t("certShareLinkedIn")}
            </Button>
            <div className="flex items-center gap-3">
              <Button variant="outline" className="gap-2" onClick={postToFeed}><Share2 className="size-4" />{t("certSharePostFeed")}</Button>
              <Button variant="ghost" onClick={() => onOpenChange(false)}>{t("certShareSkip")}</Button>
            </div>
            <p className="text-xs leading-relaxed text-muted-foreground">{t("certShareLinkedInNote")}</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function CopyField({ label, value, onCopy }: { label: string; value: string; onCopy: (v: string) => void }) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-xs font-semibold">{label}</label>
      <div className="flex items-center gap-2 overflow-hidden rounded-xl border border-border bg-card">
        <input readOnly value={value} className="min-w-0 flex-1 bg-transparent px-3.5 py-3 text-sm outline-none" />
        <button type="button" onClick={() => onCopy(value)} className="px-3 py-2.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground" aria-label="Copy"><Copy className="size-4" /></button>
      </div>
    </div>
  );
}
