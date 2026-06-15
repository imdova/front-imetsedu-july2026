"use client";

import { useTranslations } from "next-intl";
import { Download } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

/** Export-to-CSV action (demo: streams a blob from the backend in production). */
export function ExportButton() {
  const tc = useTranslations("Common");
  return (
    <Button variant="outline" className="gap-1.5" onClick={() => toast.success(tc("csvExported"))}>
      <Download className="size-4" />
      {tc("exportCsv")}
    </Button>
  );
}
