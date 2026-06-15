"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { ChevronDown } from "lucide-react";

import { Link, usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { ADMIN_NAV, type NavSection } from "@/constants/navigation";
import { useUi } from "@/store";
import { getIcon } from "./icon-map";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface SidebarNavProps {
  collapsed: boolean;
  onNavigate?: () => void;
  nav?: NavSection[];
}

function sectionHasActive(pathname: string, section: NavSection) {
  return section.items.some(
    (item) =>
      pathname === item.href || pathname.startsWith(`${item.href}/`),
  );
}

/** Renders the grouped nav links. Shared by the desktop rail and mobile sheet. */
export function SidebarNav({ collapsed, onNavigate, nav = ADMIN_NAV }: SidebarNavProps) {
  const pathname = usePathname();
  const t = useTranslations("Nav");
  const { collapsedNavSections, toggleNavSection, setNavSectionCollapsed } =
    useUi();

  React.useEffect(() => {
    nav.forEach((section) => {
      if (sectionHasActive(pathname, section)) {
        setNavSectionCollapsed(section.labelKey, false);
      }
    });
  }, [pathname, nav, setNavSectionCollapsed]);

  return (
    <nav className="flex flex-col gap-5 px-3 py-4">
      {nav.map((section) => {
        const sectionCollapsed = collapsedNavSections[section.labelKey] ?? false;
        const hasActive = sectionHasActive(pathname, section);

        return (
          <div key={section.labelKey} className="flex flex-col gap-1">
            {!collapsed && (
              <button
                type="button"
                onClick={() => toggleNavSection(section.labelKey)}
                aria-expanded={!sectionCollapsed}
                className={cn(
                  "flex w-full items-center justify-between rounded-md px-3 pb-1 pt-0.5 text-start transition-colors",
                  "text-[11px] font-medium uppercase tracking-wider text-sidebar-foreground/50",
                  "hover:text-sidebar-foreground/80",
                  hasActive && "text-sidebar-foreground/70",
                )}
              >
                <span>{t(section.labelKey)}</span>
                <ChevronDown
                  className={cn(
                    "size-3.5 shrink-0 transition-transform duration-200",
                    sectionCollapsed && "-rotate-90 rtl:rotate-90",
                  )}
                />
              </button>
            )}
            {(!sectionCollapsed || collapsed) &&
              section.items.map((item) => {
                const Icon = getIcon(item.icon);
                const active =
                  pathname === item.href ||
                  pathname.startsWith(`${item.href}/`);
                const label = t(item.titleKey);

                const link = (
                  <Link
                    key={item.href}
                    href={item.href}
                    prefetch={false}
                    onClick={onNavigate}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all",
                      "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                      active &&
                        "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm shadow-primary/25 hover:bg-sidebar-primary hover:text-sidebar-primary-foreground",
                      collapsed && "justify-center px-0",
                    )}
                  >
                    <Icon className="size-[18px] shrink-0" />
                    {!collapsed && <span className="truncate">{label}</span>}
                  </Link>
                );

                return collapsed ? (
                  <Tooltip key={item.href}>
                    <TooltipTrigger asChild>{link}</TooltipTrigger>
                    <TooltipContent side="right">{label}</TooltipContent>
                  </Tooltip>
                ) : (
                  link
                );
              })}
          </div>
        );
      })}
    </nav>
  );
}
