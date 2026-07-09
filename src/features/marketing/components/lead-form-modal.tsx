"use client";

import * as React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { SimpleLeadForm } from "@/features/marketing/components/simple-lead-form";

/**
 * "Book now" button that opens the lead form in a modal — so visitors can apply
 * from anywhere (hero, sticky bar) without scrolling to the bottom form.
 */
export function LeadFormModal({
  path,
  courseName,
  webhookUrl,
  triggerLabel,
  triggerClassName,
  title = "احجز مقعدك الآن",
  description = "قدّم في 60 ثانية وسيتواصل معك مستشار القبول لتأكيد مقعدك — مجانًا ودون التزام.",
}: {
  path: string;
  courseName: string;
  webhookUrl?: string;
  triggerLabel: React.ReactNode;
  triggerClassName?: string;
  title?: string;
  description?: string;
}) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button type="button" className={triggerClassName}>{triggerLabel}</button>
      </DialogTrigger>
      <DialogContent dir="rtl" className="max-h-[92vh] overflow-y-auto sm:max-w-md">
        <DialogHeader className="text-right sm:text-right">
          <DialogTitle className="text-[#0b2545]">{title}</DialogTitle>
          {description && <p className="text-sm text-muted-foreground">{description}</p>}
        </DialogHeader>
        <SimpleLeadForm path={path} courseName={courseName} webhookUrl={webhookUrl} />
      </DialogContent>
    </Dialog>
  );
}
