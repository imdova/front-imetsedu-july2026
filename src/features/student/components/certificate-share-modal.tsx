"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { ShieldCheck, Info, Share2, Copy, GraduationCap, X, Download } from "lucide-react";
import { toast } from "sonner";

import type { Certificate } from "@/lib/db/student";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useResetOnChange } from "@/hooks/use-reset-on-change";

const ORG = "IMETS Medical School";

export function CertificateShareModal({
  cert, holderName, open, onOpenChange,
}: {
  cert: Certificate | null;
  holderName?: string;
  open: boolean;
  onOpenChange: (o: boolean) => void;
}) {
  const t = useTranslations("Student");

  /** Branded, verifiable public page — what we share (social cards + QR-proof), never the raw PDF host. */
  const credentialUrl = React.useMemo(() => {
    const path = `/verify-certificate?code=${encodeURIComponent(cert?.code ?? "")}`;
    if (typeof window !== "undefined") return `${window.location.origin}${path}`;
    return `https://imetsedu.com${path}`;
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
  const openWin = (url: string) => window.open(url, "_blank", "noopener,width=680,height=640");
  const fullText = `${message}\n${credentialUrl}`;

  /* ── Platforms ── */
  const addToLinkedIn = () => {
    const params = new URLSearchParams({
      startTask: "CERTIFICATION_NAME", name: cert.course, organizationName: ORG, certUrl: credentialUrl, certId: cert.code,
    });
    openWin(`https://www.linkedin.com/profile/add?${params.toString()}`);
  };
  const shareLinkedInFeed = () => {
    navigator.clipboard?.writeText(message);
    openWin(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(credentialUrl)}`);
    toast.success(t("certSharePosted"));
  };
  const shareFacebook = () => {
    openWin(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(credentialUrl)}&quote=${encodeURIComponent(message)}`);
  };
  const shareWhatsApp = () => {
    openWin(`https://wa.me/?text=${encodeURIComponent(fullText)}`);
  };
  const shareInstagram = async () => {
    // Instagram has no web share intent. On phones the native share sheet can hand the
    // caption + link to the Instagram app; on desktop we copy the caption and open Instagram.
    if (typeof navigator !== "undefined" && navigator.share) {
      try { await navigator.share({ title: cert.course, text: message, url: credentialUrl }); return; } catch { /* user cancelled */ }
    }
    navigator.clipboard?.writeText(fullText);
    toast.info(t("certShareInstagramHint"), { duration: 6000 });
    openWin("https://www.instagram.com/");
  };
  const shareNative = async () => {
    if (!navigator.share) { copy(fullText); return; }
    try { await navigator.share({ title: cert.course, text: message, url: credentialUrl }); } catch { /* cancelled */ }
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
            {cert.link && (
              <Button asChild variant="outline" size="sm" className="gap-1.5">
                <a href={`/api/certificates/file?${new URLSearchParams({ url: cert.link, name: `IMETS-Certificate-${cert.code}.pdf` })}`} download><Download className="size-4" /> {t("certDownload")}</a>
              </Button>
            )}
            <p className="flex items-start gap-2 text-xs leading-relaxed text-muted-foreground">
              <Info className="mt-0.5 size-4 shrink-0" /> {t("certShareVerifiable")}
            </p>
          </div>

          {/* Right — sharing */}
          <div className="relative flex flex-col gap-5 overflow-y-auto p-6">
            <button type="button" onClick={() => onOpenChange(false)} className="absolute end-5 top-5 text-muted-foreground hover:text-foreground" aria-label={t("quizCancel")}><X className="size-5" /></button>
            <div>
              <h2 className="pe-10 font-heading text-xl font-bold leading-snug">{t("certShareConfig")}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{t("certShareFeed")}</p>
            </div>
            <Textarea rows={4} value={message} onChange={(e) => setMessage(e.target.value)} className="min-h-[100px]" />

            {/* Share on… */}
            <div className="space-y-2">
              <p className="text-xs font-semibold">{t("certShareOn")}</p>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                <Button onClick={shareLinkedInFeed} className="gap-2 bg-[#0a66c2] text-white hover:bg-[#004182]" title="LinkedIn">
                  <span className="grid size-5 place-items-center rounded-sm bg-white text-xs font-bold text-[#0a66c2]">in</span> LinkedIn
                </Button>
                <Button onClick={shareFacebook} className="gap-2 bg-[#1877f2] text-white hover:bg-[#0f5fcc]" title="Facebook">
                  <span className="grid size-5 place-items-center rounded-sm bg-white text-sm font-black text-[#1877f2]">f</span> Facebook
                </Button>
                <Button onClick={shareWhatsApp} className="gap-2 bg-[#25d366] text-white hover:bg-[#1da851]" title="WhatsApp">
                  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden className="size-4"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.149-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.885-9.885 9.885M20.52 3.449C18.24 1.245 15.24 0 12.045 0 5.463 0 .104 5.359.101 11.892c0 2.096.549 4.14 1.595 5.945L0 24l6.335-1.652a11.882 11.882 0 005.71 1.453h.006c6.585 0 11.946-5.359 11.949-11.945a11.821 11.821 0 00-3.48-8.417z" /></svg>
                  WhatsApp
                </Button>
                <Button onClick={shareInstagram} className="gap-2 bg-gradient-to-tr from-[#f58529] via-[#dd2a7b] to-[#8134af] text-white hover:opacity-90" title="Instagram">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden className="size-4"><rect x="2" y="2" width="20" height="20" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" /></svg>
                  Instagram
                </Button>
              </div>
              <p className="text-[11px] leading-relaxed text-muted-foreground">{t("certShareInstagramNote")}</p>
            </div>

            <CopyField label={t("certShareCredId")} value={cert.code} onCopy={copy} />
            <CopyField label={t("certShareCredUrl")} value={credentialUrl} onCopy={copy} />

            <div className="space-y-2 border-t border-border/60 pt-4">
              <Button onClick={addToLinkedIn} variant="outline" className="w-full gap-2">
                <span className="grid size-5 place-items-center rounded-sm bg-[#0a66c2] text-xs font-bold text-white">in</span>
                {t("certShareLinkedIn")}
              </Button>
              <div className="flex items-center gap-2">
                <Button variant="outline" className="gap-2" onClick={shareNative}><Share2 className="size-4" />{t("certShareNative")}</Button>
                <Button variant="ghost" onClick={() => onOpenChange(false)}>{t("certShareSkip")}</Button>
              </div>
              <p className="text-xs leading-relaxed text-muted-foreground">{t("certShareLinkedInNote")}</p>
            </div>
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
