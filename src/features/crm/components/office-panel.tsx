"use client";

import * as React from "react";
import { MessageSquareText, ClipboardList, Coins, Wallet, FileText, Plus, Upload } from "lucide-react";
import { toast } from "sonner";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { MessageTemplatesTab } from "@/features/crm/components/message-templates-tab";
import { RegistrationSheetsTab } from "@/features/crm/components/registration-sheets-tab";
import { PricingSheetTab } from "@/features/crm/components/pricing-sheet-tab";
import { PaymentMethodsTab } from "@/features/crm/components/payment-methods-tab";

const TABS = [
  { value: "messages", label: "Message Templates", icon: MessageSquareText },
  { value: "registration", label: "Registration Sheets", icon: ClipboardList },
  { value: "pricing", label: "Pricing Sheet", icon: Coins },
  { value: "payment", label: "Payment Methods", icon: Wallet },
  { value: "word", label: "Word Templates", icon: FileText },
] as const;

const PLACEHOLDERS: Record<string, { icon: React.ElementType; label: string; desc: string; action: string; actionIcon: React.ElementType }> = {
  word: {
    icon: FileText,
    label: "Word Templates",
    desc: "Downloadable .docx templates — offer letters, contracts, certificates and official documents.",
    action: "Upload template",
    actionIcon: Upload,
  },
};

function Placeholder({ id }: { id: keyof typeof PLACEHOLDERS }) {
  const p = PLACEHOLDERS[id];
  return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-border/70 bg-card py-16 text-center">
      <span className="grid size-14 place-items-center rounded-2xl bg-primary/10 text-primary">
        <p.icon className="size-7" />
      </span>
      <div className="space-y-1">
        <h3 className="text-lg font-semibold">{p.label}</h3>
        <p className="mx-auto max-w-md text-sm text-muted-foreground">{p.desc}</p>
      </div>
      <Button className="gap-1.5" onClick={() => toast.info("This section is being set up — connect your data source to start adding entries.")}>
        <p.actionIcon className="size-4" /> {p.action}
      </Button>
    </div>
  );
}

export function OfficePanel() {
  return (
    <Tabs defaultValue="messages" className="space-y-6">
      <TabsList className="h-auto flex-wrap gap-1 rounded-2xl bg-muted/60 p-1.5">
        {TABS.map((t) => (
          <TabsTrigger key={t.value} value={t.value} className="gap-1.5 rounded-xl px-3.5 py-2 data-[state=active]:shadow-sm">
            <t.icon className="size-4" /> {t.label}
          </TabsTrigger>
        ))}
      </TabsList>

      <TabsContent value="messages"><MessageTemplatesTab /></TabsContent>
      <TabsContent value="registration"><RegistrationSheetsTab /></TabsContent>
      <TabsContent value="pricing"><PricingSheetTab /></TabsContent>
      <TabsContent value="payment"><PaymentMethodsTab /></TabsContent>
      <TabsContent value="word"><Placeholder id="word" /></TabsContent>
    </Tabs>
  );
}
