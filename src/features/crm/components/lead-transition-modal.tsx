"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Phone, MessageCircle, Mail, MessageSquare, Paperclip, Flame, Clock, Trophy, Ghost, Ban, XCircle, HelpCircle } from "lucide-react";

import type { Lead } from "@/lib/db/crm";
import { cn, getInitials } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PriorityBadge } from "./lead-badges";

const TITLE_EMOJI: Record<string, string> = { contacted: "📞", enrolled: "✨", lost: "✖️" };

export function LeadTransitionModal({
  lead, targetStage, onConfirm, onCancel, groupOptions = [],
}: {
  lead: Lead;
  targetStage: "contacted" | "enrolled" | "lost";
  /** On enrolled, the chosen group id is passed back so the lead can be added to it. */
  onConfirm: (data?: { groupId?: string }) => void;
  onCancel: () => void;
  /** Real groups for the "enrolled" group selector. */
  groupOptions?: { value: string; label: string }[];
}) {
  const t = useTranslations("Crm");

  const titleKey = targetStage === "contacted" ? "moveToContacted" : targetStage === "enrolled" ? "moveToEnrolled" : "moveToLost";
  const descKey = targetStage === "contacted" ? "contactedDesc" : targetStage === "enrolled" ? "enrolledDesc" : "lostDesc";

  // contacted state
  const [channel, setChannel] = React.useState<"call" | "whatsapp" | "email" | "sms">("whatsapp");
  // lost state
  const [reason, setReason] = React.useState<string>("ghosted");
  // enrolled state
  const [verified, setVerified] = React.useState(false);
  const [group, setGroup] = React.useState("");

  const channels = [
    { key: "call", label: t("channelCall"), icon: Phone },
    { key: "whatsapp", label: t("channelWhatsapp"), icon: MessageCircle },
    { key: "email", label: t("channelEmail"), icon: Mail },
    { key: "sms", label: t("channelSms"), icon: MessageSquare },
  ] as const;

  const lossReasons = [
    { key: "price", label: t("lossPrice"), icon: Flame },
    { key: "timing", label: t("lossTiming"), icon: Clock },
    { key: "competitor", label: t("lossCompetitor"), icon: Trophy },
    { key: "ghosted", label: t("lossGhosted"), icon: Ghost },
    { key: "notqualified", label: t("lossNotQualified"), icon: Ban },
    { key: "wrongfit", label: t("lossWrongFit"), icon: XCircle },
    { key: "other", label: t("lossOther"), icon: HelpCircle },
  ];

  return (
    <Dialog open onOpenChange={(o) => !o && onCancel()}>
      <DialogContent className="flex max-h-[88vh] max-w-5xl flex-col gap-0 overflow-hidden p-0">
        <DialogHeader className="border-b px-6 py-4">
          <DialogTitle className="flex items-center gap-2">
            <span>{TITLE_EMOJI[targetStage]}</span>{t(titleKey)}
          </DialogTitle>
          <DialogDescription>{t(descKey)}</DialogDescription>
        </DialogHeader>

        <div className="grid flex-1 gap-6 overflow-y-auto p-6 md:grid-cols-[1fr_300px]">
          <div className="space-y-4">
            {targetStage === "contacted" && (
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5 sm:col-span-2">
                  <Label>{t("contactChannel")} <span className="text-destructive">*</span></Label>
                  <div className="flex flex-wrap gap-2">
                    {channels.map((c) => (
                      <button key={c.key} type="button" onClick={() => setChannel(c.key)}
                        className={cn("inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-medium transition-colors",
                          channel === c.key ? "border-primary bg-primary text-primary-foreground" : "hover:bg-muted/40")}>
                        <c.icon className="size-4" />{c.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label>{t("outcomeLabel")} <span className="text-destructive">*</span></Label>
                  <Select defaultValue="interested">
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="interested">{t("outcomeInterested")}</SelectItem>
                      <SelectItem value="callback">{t("outcomeCallback")}</SelectItem>
                      <SelectItem value="not">{t("outcomeNotInterested")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>{t("qualifiedLabel")}</Label>
                  <Select defaultValue="no">
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="yes">{t("yesLabel")}</SelectItem>
                      <SelectItem value="no">{t("noLabel")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5 sm:col-span-2">
                  <Label>{t("notesLabel")}</Label>
                  <Textarea placeholder={t("contactedNotesPlaceholder")} className="min-h-20" />
                </div>
              </div>
            )}

            {targetStage === "enrolled" && (
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label>{t("categoryLabel")} <span className="text-destructive">*</span></Label>
                  <Select><SelectTrigger><SelectValue placeholder={t("selectCategoryPh")} /></SelectTrigger>
                    <SelectContent>{["Healthcare", "Business", "Finance"].map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>{t("subCategoryLabel")} <span className="text-destructive">*</span></Label>
                  <Select><SelectTrigger><SelectValue placeholder={t("selectSubCategoryPh")} /></SelectTrigger>
                    <SelectContent>{["Healthcare Quality", "Infection Control"].map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>{t("groupLabelField")} <span className="text-destructive">*</span></Label>
                  <Select value={group} onValueChange={setGroup}>
                    <SelectTrigger><SelectValue placeholder={t("selectGroupPh")} /></SelectTrigger>
                    <SelectContent>
                      {(groupOptions.length ? groupOptions : [{ value: "CPHQ-G42", label: "CPHQ-G42" }, { value: "CPHQ-G41", label: "CPHQ-G41" }, { value: "CIC-2026", label: "CIC-2026" }])
                        .map((g) => <SelectItem key={g.value} value={g.value}>{g.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>{t("priceLabel")}</Label>
                  <div className="flex gap-2">
                    <Input type="number" defaultValue={0} className="flex-1" dir="ltr" />
                    <Select defaultValue="EGP"><SelectTrigger className="w-24"><SelectValue /></SelectTrigger>
                      <SelectContent>{["EGP", "SAR", "USD"].map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-1.5 sm:col-span-2">
                  <Label>{t("paymentVerification")} <span className="text-destructive">*</span></Label>
                  <label className="flex cursor-pointer items-center gap-2 rounded-lg border p-3 text-sm">
                    <Checkbox checked={verified} onCheckedChange={(c) => setVerified(Boolean(c))} />{t("paymentVerifiedCheck")}
                  </label>
                </div>
                <div className="space-y-1.5 sm:col-span-2">
                  <Label>{t("paymentReceipt")}</Label>
                  <Button type="button" variant="outline" className="gap-1.5"><Paperclip className="size-4" />{t("attachReceipt")}</Button>
                </div>
              </div>
            )}

            {targetStage === "lost" && (
              <>
                <div className="space-y-1.5">
                  <Label>{t("lossReason")} <span className="text-destructive">*</span></Label>
                  <div className="flex flex-wrap gap-2">
                    {lossReasons.map((r) => (
                      <button key={r.key} type="button" onClick={() => setReason(r.key)}
                        className={cn("inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-medium transition-colors",
                          reason === r.key ? "border-primary bg-primary text-primary-foreground" : "hover:bg-muted/40")}>
                        <r.icon className="size-4" />{r.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label>{t("whatHappened")}</Label>
                  <Textarea placeholder={t("lostObjectionPlaceholder")} className="min-h-20" />
                </div>
                <p className="rounded-lg border border-destructive/30 bg-destructive/8 p-3 text-xs text-destructive">{t("lostWarning")}</p>
              </>
            )}
          </div>

          {/* Lead summary */}
          <div className="h-fit rounded-xl border bg-muted/30 p-4">
            <div className="flex items-center gap-2.5">
              <Avatar className="size-9 border"><AvatarFallback className="bg-primary/10 text-xs text-primary">{getInitials(lead.fullName)}</AvatarFallback></Avatar>
              <p className="font-medium">{lead.fullName}</p>
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-1.5">
              <Badge variant="secondary" className="font-normal">Circle {lead.stageKey}</Badge>
              <PriorityBadge priority={lead.priority} />
            </div>
            <Badge variant="outline" className="mt-1.5">{t("scoreLabel", { score: lead.score })}</Badge>
            <dl className="mt-3 space-y-1.5 text-xs">
              <Row label={t("sumCourse")} value={lead.coursesOfInterest[0] ?? "—"} />
              <Row label={t("sumCategory")} value="Healthcare" />
              <Row label={t("sumSubcategory")} value="Healthcare Quality" />
              <Row label={t("sumCountry")} value={lead.country || "—"} />
              <Row label={t("sumOwner")} value={lead.counselorName} />
              <Row label={t("sumSource")} value={lead.source} />
            </dl>
          </div>
        </div>

        <DialogFooter className="border-t bg-muted/20 px-6 py-4">
          <Button variant="outline" onClick={onCancel}>{t("cancelBtn")}</Button>
          <Button
            onClick={() => onConfirm(targetStage === "enrolled" && groupOptions.length > 0 ? { groupId: group || undefined } : undefined)}
            disabled={targetStage === "enrolled" && (!verified || (groupOptions.length > 0 && !group))}
          >
            {t("confirmMove")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <dt className="uppercase tracking-wide text-muted-foreground">{label}</dt>
      <dd className="truncate text-end font-medium">{value}</dd>
    </div>
  );
}
