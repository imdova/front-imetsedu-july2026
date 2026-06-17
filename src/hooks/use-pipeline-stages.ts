"use client";

import { useState, useEffect, useMemo } from "react";
import { getCrmSettingById } from "@integration/services/crm-settings";
import type { PipelineStage } from "@/lib/db/crm";

const STAGES_SETTING_ID = "6a25bd99f90982c9b47c4d22";
const EXCLUDED_STAGE_KEYS = new Set(["qualified", "payment"]);
const STAGE_KEY_ORDER = [
  "new_inquiries",
  "contacted",
  "invoice_sent",
  "enrolled",
  "lost",
] as const;
const STAGE_COLORS: Record<string, string> = {
  new_inquiries: "#94A3B8",
  contacted: "#3B82F6",
  invoice_sent: "#0EA5E9",
  enrolled: "#10B981",
  lost: "#6B7280",
};

export interface CrmStageDisplay {
  key: string;
  name: string;
  color: string;
  isTerminal: boolean;
}

export function usePipelineStages(
  rawStages?: Array<{ key: string; name?: string; order?: number }>,
  options?: { skipFilter?: boolean },
) {
  const [crmOptions, setCrmOptions] = useState<string[]>([]);

  useEffect(() => {
    getCrmSettingById(STAGES_SETTING_ID)
      .then((res) => {
        if (res.ok && Array.isArray((res.data as any)?.options)) {
          setCrmOptions((res.data as any).options as string[]);
        }
      })
      .catch(() => {});
  }, []);

  const stages = useMemo<CrmStageDisplay[]>(() => {
    if (rawStages && rawStages.length > 0) {
      const sorted = [...rawStages].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
      const visible = options?.skipFilter ? sorted : sorted.filter((s) => !EXCLUDED_STAGE_KEYS.has(s.key));
      const sliced = crmOptions.length > 0 ? visible.slice(0, crmOptions.length) : visible;
      return sliced.map((s, i) => ({
        key: s.key,
        name: crmOptions[i] ?? s.name ?? s.key,
        color: STAGE_COLORS[s.key] ?? "#6366f1",
        isTerminal: s.key === "enrolled" || s.key === "lost",
      }));
    }
    return STAGE_KEY_ORDER.map((key, i) => ({
      key,
      name: crmOptions[i] ?? key.replace(/_/g, " "),
      color: STAGE_COLORS[key] ?? "#6366f1",
      isTerminal: key === "enrolled" || key === "lost",
    }));
  }, [rawStages, crmOptions, options?.skipFilter]);

  const getDisplayName = (key: string): string =>
    stages.find((s) => s.key === key)?.name ?? key.replace(/_/g, " ");

  const toPipelineStage = (key: string): PipelineStage | null => {
    const s = stages.find((st) => st.key === key);
    if (!s) return null;
    return {
      key: key,
      name: s.name,
      order: STAGE_KEY_ORDER.indexOf(key as (typeof STAGE_KEY_ORDER)[number]),
    };
  };

  return { stages, getDisplayName, toPipelineStage };
}
