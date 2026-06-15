"use client";

import { motion } from "motion/react";
import { useTranslations } from "next-intl";
import { GraduationCap, PanelLeftClose, PanelLeftOpen } from "lucide-react";

import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { ADMIN_NAV, BRAND, type NavSection } from "@/constants/navigation";
import { useUi } from "@/store";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { SidebarNav } from "./sidebar-nav";

interface AppSidebarProps {
  nav?: NavSection[];
  homeHref?: string;
  /** i18n key (Common namespace) for the small label under the brand. */
  taglineKey?: string;
}

/** Desktop collapsible sidebar rail (hidden on < lg, where the sheet is used). */
export function AppSidebar({
  nav = ADMIN_NAV,
  homeHref = "/admin/dashboard",
  taglineKey = "adminConsole",
}: AppSidebarProps) {
  const { sidebarCollapsed, toggleSidebar } = useUi();
  const t = useTranslations();

  return (
    <motion.aside
      animate={{ width: sidebarCollapsed ? 76 : 264 }}
      transition={{ duration: 0.25, ease: "easeInOut" }}
      className="sticky top-0 hidden h-svh shrink-0 flex-col border-e border-sidebar-border bg-sidebar text-sidebar-foreground lg:flex"
    >
      <div
        className={cn(
          "flex h-16 items-center gap-2.5 border-b border-sidebar-border px-4",
          sidebarCollapsed && "justify-center px-0",
        )}
      >
        <Link href={homeHref} className="flex items-center gap-2.5">
          <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-primary to-[oklch(0.62_0.19_286)] text-white shadow-md shadow-primary/25 ring-1 ring-white/10">
            <GraduationCap className="size-5" />
          </span>
          {!sidebarCollapsed && (
            <span className="flex flex-col leading-tight">
              <span className="text-sm font-semibold">{BRAND.fullName}</span>
              <span className="text-[11px] text-sidebar-foreground/60">
                {t(`Common.${taglineKey}`)}
              </span>
            </span>
          )}
        </Link>
      </div>

      <ScrollArea className="flex-1 scrollbar-thin">
        <SidebarNav collapsed={sidebarCollapsed} nav={nav} />
      </ScrollArea>

      <div className="border-t border-sidebar-border p-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleSidebar}
          className={cn(
            "w-full justify-start gap-3 text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
            sidebarCollapsed && "justify-center",
          )}
          aria-label={t("Nav.collapse")}
        >
          {sidebarCollapsed ? (
            <PanelLeftOpen className="size-[18px] rtl:rotate-180" />
          ) : (
            <PanelLeftClose className="size-[18px] rtl:rotate-180" />
          )}
          {!sidebarCollapsed && <span>{t("Nav.collapse")}</span>}
        </Button>
      </div>
    </motion.aside>
  );
}
