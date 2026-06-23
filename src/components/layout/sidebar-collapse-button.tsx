"use client";

import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { useTranslations } from "next-intl";

import { cn } from "@/lib/utils";
import { useUi } from "@/store";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface SidebarCollapseButtonProps {
  className?: string;
  showLabel?: boolean;
  variant?: "sidebar" | "header";
}

export function SidebarCollapseButton({
  className,
  showLabel = false,
  variant = "sidebar",
}: SidebarCollapseButtonProps) {
  const { sidebarCollapsed, toggleSidebar } = useUi();
  const t = useTranslations("Nav");

  const label = sidebarCollapsed ? t("expand") : t("collapse");
  const Icon = sidebarCollapsed ? PanelLeftOpen : PanelLeftClose;

  const button = (
    <Button
      type="button"
      variant="ghost"
      size={showLabel ? "sm" : "icon"}
      onClick={toggleSidebar}
      aria-label={label}
      aria-expanded={!sidebarCollapsed}
      className={cn(
        variant === "sidebar" &&
          "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
        variant === "header" && "text-muted-foreground hover:text-foreground",
        showLabel && "w-full justify-start gap-3",
        !showLabel && "size-9 shrink-0",
        className,
      )}
    >
      <Icon className={cn("size-[18px] rtl:rotate-180", showLabel && "shrink-0")} />
      {showLabel && <span>{label}</span>}
    </Button>
  );

  if (showLabel) return button;

  return (
    <Tooltip>
      <TooltipTrigger asChild>{button}</TooltipTrigger>
      <TooltipContent side={variant === "header" ? "bottom" : "right"}>
        {label}
      </TooltipContent>
    </Tooltip>
  );
}
