"use client";

import { useTranslations } from "next-intl";
import { Menu, Plus, Search, LogOut, UserCog, Settings } from "lucide-react";

import { Link, useRouter } from "@/i18n/navigation";
import { ADMIN_NAV, BRAND, type NavSection } from "@/constants/navigation";
import { useAuth } from "@/store";
import { clearSessionCookie } from "@/lib/auth-session";
import { getInitials } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { LanguageSwitcher } from "@/components/shared/language-switcher";
import { GraduationCap } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { SidebarNav } from "./sidebar-nav";
import { SidebarScroll } from "./sidebar-scroll";
import { SidebarCollapseButton } from "./sidebar-collapse-button";
import { NotificationBell } from "@/features/admin/components/notification-bell";

interface AppHeaderProps {
  nav?: NavSection[];
  showCreate?: boolean;
}

/** Sticky top bar: mobile menu, global search, theme toggle, notifications, user. */
export function AppHeader({ nav = ADMIN_NAV, showCreate = true }: AppHeaderProps) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const t = useTranslations();

  const handleLogout = () => {
    logout();
    clearSessionCookie();
    router.push("/login");
  };

  // Account links (Profile / Settings) for THIS workspace, derived from its nav
  // so the header avatar menu always points at the right routes.
  const accountItems = nav.flatMap((s) => s.items);
  const profileItem = accountItems.find((i) => i.href.endsWith("/profile"));
  const settingsItem = accountItems.find((i) => i.href.endsWith("/settings") && !i.adminOnly);

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border/70 bg-background/70 px-4 backdrop-blur-xl sm:px-6">
      {/* Mobile nav trigger */}
      <Sheet>
        <SheetTrigger asChild className="lg:hidden">
          <Button variant="ghost" size="icon" aria-label={t("Header.openMenu")}>
            <Menu className="size-5" />
          </Button>
        </SheetTrigger>
        <SheetContent
          side="left"
          className="sidebar-gradient flex w-72 flex-col overflow-hidden p-0 text-sidebar-foreground"
        >
          <SheetTitle className="sr-only">{t("Nav.navigation")}</SheetTitle>
          <div className="flex h-16 shrink-0 items-center gap-2.5 border-b border-sidebar-border px-4">
            <span className="grid size-9 place-items-center rounded-xl bg-white/15 text-white ring-1 ring-white/15">
              <GraduationCap className="size-5" />
            </span>
            <span className="text-sm font-semibold">{BRAND.fullName}</span>
          </div>
          <SidebarScroll>
            <SidebarNav collapsed={false} nav={nav} />
          </SidebarScroll>
        </SheetContent>
      </Sheet>

      <SidebarCollapseButton variant="header" className="hidden lg:inline-flex" />

      <div className="relative hidden max-w-sm flex-1 sm:block">
        <Search className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder={t("Common.search")} className="ps-9" />
      </div>

      <div className="ms-auto flex items-center gap-1.5">
        {showCreate && (
          <Button asChild size="sm" className="hidden gap-1.5 sm:inline-flex">
            <Link href="/admin/courses/new">
              <Plus className="size-4" />
              {t("Header.newCourse")}
            </Link>
          </Button>
        )}

        <LanguageSwitcher />
        <ThemeToggle />

        <NotificationBell />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button type="button" className="flex items-center gap-2 rounded-lg ps-1 outline-none hover:bg-muted/50 focus-visible:ring-2 focus-visible:ring-ring/40">
              <Avatar className="size-9 border">
                {user?.avatarUrl ? <AvatarImage src={user.avatarUrl} alt={user.name} /> : null}
                <AvatarFallback className="bg-primary/10 text-sm font-medium text-primary">
                  {user ? getInitials(user.name) : "IM"}
                </AvatarFallback>
              </Avatar>
              <div className="hidden flex-col leading-tight text-start md:flex">
                <span className="text-sm font-medium">{user?.name}</span>
                <span className="text-xs capitalize text-muted-foreground">
                  {user?.role}
                </span>
              </div>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel className="truncate">{user?.email ?? user?.name}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {profileItem && (
              <DropdownMenuItem asChild>
                <Link href={profileItem.href}>
                  <UserCog className="size-4" />
                  {t(`Nav.${profileItem.titleKey}`)}
                </Link>
              </DropdownMenuItem>
            )}
            {settingsItem && (
              <DropdownMenuItem asChild>
                <Link href={settingsItem.href}>
                  <Settings className="size-4" />
                  {t(`Nav.${settingsItem.titleKey}`)}
                </Link>
              </DropdownMenuItem>
            )}
            {(profileItem || settingsItem) && <DropdownMenuSeparator />}
            <DropdownMenuItem variant="destructive" onClick={handleLogout}>
              <LogOut className="size-4" />
              {t("Common.logout")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
