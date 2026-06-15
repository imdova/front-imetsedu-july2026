"use client";

import * as React from "react";
import { useTranslations } from "next-intl";

import type { TaxonomyRow, CourseSubcategory, CourseVariable } from "@/lib/db/course-taxonomy";
import { cn } from "@/lib/utils";
import { TaxonomyTable } from "./taxonomy-table";
import { CourseVariablesManager } from "./course-variables-manager";

type Tab = "categories" | "subcategories" | "tags" | "variables";

export function CourseSettings({
  categories, subcategories, tags, variables,
}: {
  categories: TaxonomyRow[];
  subcategories: CourseSubcategory[];
  tags: TaxonomyRow[];
  variables: CourseVariable[];
}) {
  const t = useTranslations("Admin");
  const [tab, setTab] = React.useState<Tab>("categories");

  const tabs: { key: Tab; label: string }[] = [
    { key: "categories", label: t("csTabCategories") },
    { key: "subcategories", label: t("csTabSubCategories") },
    { key: "tags", label: t("csTabTags") },
    { key: "variables", label: t("csTabVariables") },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-1 border-b">
        {tabs.map((tb) => (
          <button key={tb.key} onClick={() => setTab(tb.key)}
            className={cn("rounded-t-lg border-b-2 px-4 py-2.5 text-sm font-medium transition-colors",
              tab === tb.key ? "border-primary bg-primary/5 text-primary" : "border-transparent text-muted-foreground hover:text-foreground")}>
            {tb.label}
          </button>
        ))}
      </div>

      {tab === "categories" && (
        <TaxonomyTable initial={categories} allLabel={t("csAllCategories")} nameLabel={t("csColCategoryName")} addHref="/admin/courses/settings/category/new" />
      )}
      {tab === "subcategories" && (
        <TaxonomyTable
          initial={subcategories}
          allLabel={t("csAllSubCategories")}
          nameLabel={t("csColSubName")}
          showParent
          kind="subcategory"
          parentCategories={categories.map((c) => ({ id: c.id, name: c.nameEn }))}
        />
      )}
      {tab === "tags" && (
        <TaxonomyTable initial={tags} allLabel={t("csAllTags")} nameLabel={t("csColCategoryName")} kind="tag" />
      )}
      {tab === "variables" && <CourseVariablesManager initial={variables} />}
    </div>
  );
}
