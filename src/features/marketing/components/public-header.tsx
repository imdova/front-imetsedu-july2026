"use client";

import { useTranslations } from "next-intl";
import { GraduationCap, Menu } from "lucide-react";

import { Link, usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { BRAND, PUBLIC_NAV } from "@/constants/navigation";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { LanguageSwitcher } from "@/components/shared/language-switcher";
import { BrandImage } from "@/components/shared/brand-image";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export function PublicHeader({ logoLight }: { logoLight?: string }) {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const tn = useTranslations("Nav");
  const tm = useTranslations("Marketing");
  const tc = useTranslations("Common");

  const links = PUBLIC_NAV.map((item) => ({
    href: item.href,
    label: tn(item.titleKey),
    active:
      item.href === "/"
        ? pathname === "/"
        : pathname === item.href || pathname.startsWith(`${item.href}/`),
  }));

  return (
    <header
      className={cn(
        "top-0 z-40",
        isHome
          ? "absolute inset-x-0 bg-transparent"
          : "sticky border-b border-border/70 bg-background/80 backdrop-blur-xl",
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2.5">
          <BrandImage
            kind="navbar"
            alt={BRAND.fullName}
            className={cn("h-9 max-w-[160px] object-contain", isHome && "brightness-0 invert")}
            fallback={
              logoLight ? (
                <img
                  src={logoLight}
                  alt={BRAND.fullName}
                  className={cn("h-9 max-w-[160px] object-contain", isHome && "brightness-0 invert")}
                />
              ) : (
                <>
                  <span
                    className={cn(
                      "grid size-9 place-items-center rounded-xl text-white shadow-md",
                      isHome
                        ? "bg-white/15 ring-1 ring-white/20"
                        : "bg-gradient-to-br from-primary to-[oklch(0.62_0.19_286)] shadow-primary/25",
                    )}
                  >
                    <GraduationCap className="size-5" />
                  </span>
                  <span
                    className={cn(
                      "text-base font-semibold tracking-tight",
                      isHome ? "text-white" : "text-foreground",
                    )}
                  >
                    {BRAND.fullName}
                  </span>
                </>
              )
            }
          />
        </Link>

        <nav className="ms-6 hidden items-center gap-1 lg:flex">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={cn(
                "rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isHome
                  ? l.active
                    ? "text-white"
                    : "text-white/75 hover:text-white"
                  : l.active
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground",
              )}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="ms-auto flex items-center gap-1.5">
          <LanguageSwitcher variant={isHome ? "overlay" : "default"} />
          <ThemeToggle
            className={cn(
              isHome &&
                "text-white hover:bg-white/10 hover:text-white",
            )}
          />
          <Button
            asChild
            variant="ghost"
            size="sm"
            className={cn(
              "hidden sm:inline-flex",
              isHome && "text-white hover:bg-white/10 hover:text-white",
            )}
          >
            <Link href="/login">{tc("signIn")}</Link>
          </Button>
          <Button
            asChild
            size="sm"
            className={cn(
              "hidden sm:inline-flex",
              isHome
                ? "bg-white text-[#0a1424] hover:bg-white/90"
                : undefined,
            )}
          >
            <Link href="/register">{tm("getStarted")}</Link>
          </Button>

          <Sheet>
            <SheetTrigger asChild className="lg:hidden">
              <Button
                variant="ghost"
                size="icon"
                aria-label={tn("navigation")}
                className={cn(
                  isHome && "text-white hover:bg-white/10 hover:text-white",
                )}
              >
                <Menu className="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
              <SheetTitle className="px-4 pt-2">{BRAND.fullName}</SheetTitle>
              <nav className="mt-4 flex flex-col gap-1 px-2">
                {links.map((l) => (
                  <Link
                    key={l.href}
                    href={l.href}
                    className={cn(
                      "rounded-lg px-3 py-2.5 text-sm font-medium",
                      l.active
                        ? "bg-primary/10 text-primary"
                        : "text-foreground hover:bg-muted",
                    )}
                  >
                    {l.label}
                  </Link>
                ))}
                <div className="mt-3 flex flex-col gap-2 px-1">
                  <Button asChild variant="outline">
                    <Link href="/login">{tc("signIn")}</Link>
                  </Button>
                  <Button asChild>
                    <Link href="/register">{tm("getStarted")}</Link>
                  </Button>
                </div>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
