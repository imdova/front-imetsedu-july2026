"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Phone, MessageCircle, Mail, MessageSquare, Paperclip, Flame, Clock, Trophy, Ghost, Ban, XCircle, HelpCircle } from "lucide-react";

import type { Lead } from "@/lib/db/crm";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const TITLE_EMOJI: Record<string, string> = { contacted: "📞", enrolled: "✨", lost: "✖️" };

export interface TransitionLogData {
  groupId?: string;
  contactChannel?: string;
  contactOutcome?: string;
  notes?: string;
  lossReason?: string;
}

export function LeadTransitionModal({
  lead, targetStage, onConfirm, onCancel, groupOptions = [],
}: {
  lead: Lead;
  targetStage: "contacted" | "enrolled" | "lost";
  onConfirm: (data?: TransitionLogData) => void;
  onCancel: () => void;
  groupOptions?: { value: string; label: string }[];
}) {
  const t = useTranslations("Crm");

  const titleKey = targetStage === "contacted" ? "moveToContacted" : targetStage === "enrolled" ? "moveToEnrolled" : "moveToLost";
  const descKey = targetStage === "contacted" ? "contactedDesc" : targetStage === "enrolled" ? "enrolledDesc" : "lostDesc";

  // contacted state
  const [channel, setChannel] = React.useState<"call" | "whatsapp" | "email" | "sms">("whatsapp");
  const [outcome, setOutcome] = React.useState("interested");
  const [contactNotes, setContactNotes] = React.useState("");
  // lost state
  const [reason, setReason] = React.useState<string>("ghosted");
  const [lostNotes, setLostNotes] = React.useState("");
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
      <DialogContent className="flex max-h-[88vh] flex-col gap-0 overflow-hidden p-0">
        <DialogHeader className="border-b px-6 py-4">
          <DialogTitle className="flex items-center gap-2">
            <span>{TITLE_EMOJI[targetStage]}</span>{t(titleKey)}
          </DialogTitle>
          <DialogDescription>{t(descKey)}</DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-6">
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
                  <Select value={outcome} onValueChange={setOutcome}>
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
                  <Textarea value={contactNotes} onChange={(e) => setContactNotes(e.target.value)} placeholder={t("contactedNotesPlaceholder")} className="min-h-20" />
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
                <div className="space-y-1.5 sm:col-span-2">
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
                  <Textarea value={lostNotes} onChange={(e) => setLostNotes(e.target.value)} placeholder={t("lostObjectionPlaceholder")} className="min-h-20" />
                </div>
                <p className="rounded-lg border border-destructive/30 bg-destructive/8 p-3 text-xs text-destructive">{t("lostWarning")}</p>
              </>
            )}
          </div>

        </div>

        <DialogFooter className="border-t bg-muted/20 px-6 py-4">
          <Button variant="outline" onClick={onCancel}>{t("cancelBtn")}</Button>
          <Button
            onClick={() => {
              if (targetStage === "contacted") {
                onConfirm({ contactChannel: channel, contactOutcome: outcome, notes: contactNotes.trim() || undefined });
              } else if (targetStage === "enrolled") {
                onConfirm(groupOptions.length > 0 ? { groupId: group || undefined } : undefined);
              } else if (targetStage === "lost") {
                onConfirm({ lossReason: reason, notes: lostNotes.trim() || undefined });
              } else {
                onConfirm(undefined);
              }
            }}
            disabled={targetStage === "enrolled" && (!verified || (groupOptions.length > 0 && !group))}
          >
            {t("confirmMove")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
