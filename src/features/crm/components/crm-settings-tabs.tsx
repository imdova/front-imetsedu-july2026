"use client";

import * as React from "react";
import { SlidersHorizontal, BadgeDollarSign } from "lucide-react";

import { cn } from "@/lib/utils";
import { CrmVariables } from "./crm-variables";
import { CommissionPlanEditor } from "./commission-plan-editor";

const TABS = [
  { id: "variables", label: "Field Options", icon: SlidersHorizontal },
  { id: "commission", label: "Commission Plan", icon: BadgeDollarSign },
] as const;

export function CrmSettingsTabs() {
  const [tab, setTab] = React.useState<"variables" | "commission">("variables");
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-1 rounded-xl border border-border/70 bg-card p-1 shadow-sm">
        {TABS.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => setTab(s.id)}
            className={cn(
              "inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors",
              tab === s.id ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground",
            )}
          >
            <s.icon className="size-4" />{s.label}
          </button>
        ))}
      </div>
      {tab === "variables" ? <CrmVariables /> : <CommissionPlanEditor />}
    </div>
  );
}
