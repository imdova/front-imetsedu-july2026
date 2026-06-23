"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { ChevronDown } from "lucide-react";

import { Link, usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { ADMIN_NAV, type NavSection } from "@/constants/navigation";
import { useStore, useUi } from "@/store";
import type { StaffRolePermissions } from "@/store/slices/auth-slice";
import { useSiteSettings } from "@/components/providers/site-settings-provider";
import { getIcon } from "./icon-map";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface SidebarNavProps {
  collapsed: boolean;
  onNavigate?: () => void;
  nav?: NavSection[];
}

/**
 * Mirror of the old AdminSidebarPanel hasAccess logic:
 * - adminOnly && perms !== null  → false (hide from any staff)
 * - !perms || !required?.length  → true  (super-admin OR no requirement)
 * - else: at least ONE required key must be true in perms
 */
function hasAccess(
  perms: StaffRolePermissions | null | undefined,
  required?: string[],
  adminOnly?: boolean,
): boolean {
  if (adminOnly && perms !== null && perms !== undefined) return false;
  if (!perms || !required?.length) return true;
  return required.some((key) => perms[key] === true);
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

  // Read permissions from the store — same pattern as old AdminSidebarPanel
  const storePermissions = useStore((s) => s.user?.staffRole?.permissions);
  // staffRole === null → super-admin → perms = null → all items visible
  // staffRole?.permissions → StaffRolePermissions object → filter applies
  // staffRole === undefined → not yet hydrated → show everything optimistically
  const permissions: StaffRolePermissions | null | undefined = storePermissions;

  // Site-settings feature flags — hide an item only when its flag is explicitly
  // disabled (missing/unknown flags stay visible).
  const { features } = useSiteSettings();
  const featureEnabled = (key?: string) =>
    !key || (features as Record<string, boolean> | undefined)?.[key] !== false;

  React.useEffect(() => {
    nav.forEach((section) => {
      if (sectionHasActive(pathname, section)) {
        setNavSectionCollapsed(section.labelKey, false);
      }
    });
  }, [pathname, nav, setNavSectionCollapsed]);

  React.useEffect(() => {
    const frame = requestAnimationFrame(() => {
      const container = document.querySelector("[data-sidebar-scroll]");
      const active = container?.querySelector("[data-sidebar-active]");
      active?.scrollIntoView({ block: "nearest", behavior: "smooth" });
    });
    return () => cancelAnimationFrame(frame);
  }, [pathname]);

  return (
    <nav className="flex flex-col gap-5 px-3 py-4">
      {nav.map((section) => {
        const sectionCollapsed = collapsedNavSections[section.labelKey] ?? false;
        const hasActive = sectionHasActive(pathname, section);

        // Filter items using hasAccess — identical to old AdminSidebarPanel
        const visibleItems = section.items.filter(
          (item) =>
            hasAccess(permissions, item.requiredPermissions, item.adminOnly) &&
            featureEnabled(item.feature),
        );
        if (visibleItems.length === 0) return null;

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
              visibleItems.map((item) => {
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
                    data-sidebar-active={active ? "" : undefined}
                    className={cn(
                      "group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all",
                      "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                      active &&
                        "bg-sidebar-primary text-sidebar-primary-foreground shadow-md shadow-black/20 hover:bg-sidebar-primary hover:text-sidebar-primary-foreground",
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
