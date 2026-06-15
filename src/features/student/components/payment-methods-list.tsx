"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { CreditCard, Landmark, Plus, Trash2, Check } from "lucide-react";
import { toast } from "sonner";

import type { PaymentMethod } from "@/lib/db/student";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function PaymentMethodsList({ items }: { items: PaymentMethod[] }) {
  const t = useTranslations("Student");
  const [methods, setMethods] = React.useState(items);

  const makeDefault = (id: string) => {
    setMethods((p) => p.map((m) => ({ ...m, isDefault: m.id === id })));
    toast.success(t("defaultSet"));
  };
  const remove = (id: string) => {
    setMethods((p) => p.filter((m) => m.id !== id));
    toast.success(t("methodRemoved"));
  };

  return (
    <div className="space-y-3">
      {methods.map((m) => (
        <div key={m.id} className="flex items-center gap-4 rounded-xl border border-border/70 bg-card p-4 shadow-sm">
          <span className="grid size-11 place-items-center rounded-lg bg-primary/10 text-primary">
            {m.type === "card" ? <CreditCard className="size-5" /> : <Landmark className="size-5" />}
          </span>
          <div className="min-w-0 flex-1">
            <p className="flex items-center gap-2 font-medium">
              {m.brand}
              {m.isDefault && <Badge className="border-transparent bg-success/15 text-success">{t("defaultMethod")}</Badge>}
            </p>
            <p className="text-sm text-muted-foreground">{t("endingIn", { last4: m.last4 })}</p>
          </div>
          {!m.isDefault && (
            <Button variant="outline" size="sm" className="gap-1.5" onClick={() => makeDefault(m.id)}><Check className="size-4" />{t("makeDefault")}</Button>
          )}
          <Button variant="ghost" size="icon" className={cn("size-8 text-muted-foreground hover:text-destructive", m.isDefault && "invisible")} onClick={() => remove(m.id)} aria-label={t("removeMethod")}>
            <Trash2 className="size-4" />
          </Button>
        </div>
      ))}
      <Button variant="outline" className="w-full gap-1.5 border-dashed" onClick={() => toast.success(t("methodAdded"))}>
        <Plus className="size-4" />{t("addMethod")}
      </Button>
    </div>
  );
}
