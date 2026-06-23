"use client";

import { motion } from "motion/react";
import { useTranslations } from "next-intl";
import { GraduationCap } from "lucide-react";

import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { ADMIN_NAV, BRAND, type NavSection } from "@/constants/navigation";
import { useUi } from "@/store";
import { SidebarNav } from "./sidebar-nav";
import { SidebarScroll } from "./sidebar-scroll";
import { SidebarCollapseButton } from "./sidebar-collapse-button";

interface AppSidebarProps {
  nav?: NavSection[];
  homeHref?: string;
  /** i18n key (Common namespace) for the small label under the brand. */
  taglineKey?: string;
  logoLight?: string;
  logoDark?: string;
}

/** Desktop collapsible sidebar rail (hidden on < lg, where the sheet is used). */
export function AppSidebar({
  nav = ADMIN_NAV,
  homeHref = "/admin/dashboard",
  taglineKey = "adminConsole",
  logoLight,
  logoDark,
}: AppSidebarProps) {
  const { sidebarCollapsed } = useUi();
  const t = useTranslations();

  return (
    <motion.aside
      animate={{ width: sidebarCollapsed ? 76 : 264 }}
      transition={{ duration: 0.25, ease: "easeInOut" }}
      className="sticky top-0 hidden h-svh shrink-0 flex-col overflow-hidden border-e border-sidebar-border text-sidebar-foreground sidebar-gradient lg:flex"
    >
      <div
        className={cn(
          "flex h-16 shrink-0 items-center gap-2 border-b border-sidebar-border px-3",
          sidebarCollapsed ? "justify-center px-2" : "justify-between",
        )}
      >
        <Link
          href={homeHref}
          className={cn(
            "flex min-w-0 items-center gap-2.5",
            sidebarCollapsed && "justify-center",
          )}
        >
          {logoLight ? (
            <img
              src={logoLight}
              alt={BRAND.fullName}
              className={cn(
                "shrink-0 object-contain brightness-0 invert",
                sidebarCollapsed ? "h-8 w-8" : "h-9 max-w-[140px]",
              )}
            />
          ) : (
            <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-white/15 text-white shadow-md ring-1 ring-white/15">
              <GraduationCap className="size-5" />
            </span>
          )}
          {!sidebarCollapsed && !logoLight && (
            <span className="flex flex-col leading-tight">
              <span className="text-sm font-semibold">{BRAND.fullName}</span>
              <span className="text-[11px] text-sidebar-foreground/60">
                {t(`Common.${taglineKey}`)}
              </span>
            </span>
          )}
        </Link>
        {!sidebarCollapsed && <SidebarCollapseButton />}
      </div>

      <SidebarScroll>
        <SidebarNav collapsed={sidebarCollapsed} nav={nav} />
      </SidebarScroll>

      <div className="shrink-0 border-t border-sidebar-border p-3">
        {sidebarCollapsed ? (
          <SidebarCollapseButton className="mx-auto" />
        ) : (
          <SidebarCollapseButton showLabel />
        )}
      </div>
    </motion.aside>
  );
}
