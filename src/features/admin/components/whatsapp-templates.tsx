"use client";

import { useTranslations } from "next-intl";
import { MessageSquare } from "lucide-react";

import type { WhatsappTemplate, TemplateCategory } from "@/lib/db/admin";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { AdminStatusBadge } from "./admin-status-badge";

const CAT_KEY: Record<TemplateCategory, string> = {
  marketing: "catMarketing",
  transactional: "catTransactional",
  reminder: "catReminder",
};

export function WhatsappTemplates({ items }: { items: WhatsappTemplate[] }) {
  const t = useTranslations("Admin");

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {items.map((tpl) => (
        <Card key={tpl.id}>
          <CardContent className="space-y-3 pt-5">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="grid size-9 place-items-center rounded-lg bg-success/12 text-success">
                  <MessageSquare className="size-[18px]" />
                </span>
                <div>
                  <p className="font-mono text-sm font-medium">{tpl.name}</p>
                  <div className="mt-1 flex items-center gap-1.5">
                    <Badge variant="secondary">{t(CAT_KEY[tpl.category])}</Badge>
                    <Badge variant="outline" className="uppercase">{tpl.language}</Badge>
                  </div>
                </div>
              </div>
              <AdminStatusBadge value={tpl.status} />
            </div>
            <p
              className="rounded-lg bg-muted/50 p-3 text-sm text-muted-foreground"
              dir={tpl.language === "ar" ? "rtl" : "ltr"}
            >
              {tpl.body}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
