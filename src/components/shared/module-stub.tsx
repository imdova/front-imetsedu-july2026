"use client";

import { useTranslations } from "next-intl";
import { Hammer } from "lucide-react";

import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent } from "@/components/ui/card";

/**
 * Consistent placeholder for an admin/staff module whose full screen is part of
 * a later delivery phase. Keeps the route navigable and on-brand while the real
 * table/form/detail views are built out.
 */
export function ModuleStub({ navKey }: { navKey: string }) {
  const tn = useTranslations("Nav");
  const tc = useTranslations("Common");
  const title = (tn as unknown as (k: string) => string)(navKey);

  return (
    <div className="mx-auto max-w-[1400px] space-y-6">
      <PageHeader title={title} description={tc("moduleBuildingDesc")} />
      <Card>
        <CardContent className="flex flex-col items-center justify-center gap-3 py-20 text-center">
          <span className="grid size-14 place-items-center rounded-2xl bg-primary/10 text-primary">
            <Hammer className="size-6" />
          </span>
          <p className="text-base font-medium">{tc("moduleBuilding")}</p>
          <p className="max-w-md text-sm text-muted-foreground">
            {tc("moduleBuildingDesc")}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
