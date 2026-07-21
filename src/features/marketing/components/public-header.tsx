"use client";

import { useTranslations } from "next-intl";
import { GraduationCap, Menu } from "lucide-react";

import { Link, usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { BRAND, PUBLIC_NAV, PUBLIC_RESOURCES, RESOURCES_HREF } from "@/constants/navigation";
import { Button } from "@/components/ui/button";
import { CoursesMegaMenu, type MegaCategory, type MegaCourse } from "@/features/marketing/components/courses-mega-menu";
import { ResourcesMenu } from "@/features/marketing/components/resources-menu";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { LanguageSwitcher } from "@/components/shared/language-switcher";
import { BrandImage } from "@/components/shared/brand-image";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export function PublicHeader({
  logoLight,
  locale = "en",
  megaCategories = [],
  megaCourses = [],
}: {
  logoLight?: string;
  locale?: string;
  megaCategories?: MegaCategory[];
  megaCourses?: MegaCourse[];
}) {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const tn = useTranslations("Nav");
  const tm = useTranslations("Marketing");
  const tc = useTranslations("Common");

  const links = PUBLIC_NAV.map((item) => ({
    href: item.href,
    label: tn(item.titleKey),
    icon: item.icon,
    active:
      item.href === RESOURCES_HREF
        // The dropdown has no page of its own — light it up when the visitor is
        // on any of its children.
        ? PUBLIC_RESOURCES.some((r) => pathname === r.href || pathname.startsWith(`${r.href}/`))
        : item.href === "/"
          ? pathname === "/"
          : pathname === item.href || pathname.startsWith(`${item.href}/`),
  }));

  const resourceLinks = PUBLIC_RESOURCES.map((item) => ({
    href: item.href,
    label: tn(item.titleKey),
    desc: tn(`${item.titleKey}Desc`),
    icon: item.icon,
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
          {isHome ? (
            // White + gold brand logo for the blue hero header.
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src="/logo-white.svg"
              alt={BRAND.fullName}
              className="h-9 w-auto max-w-[190px] object-contain"
            />
          ) : (
            <BrandImage
              kind="navbar"
              alt={BRAND.fullName}
              className="h-9 max-w-[160px] object-contain"
              fallback={
                logoLight ? (
                  <img
                    src={logoLight}
                    alt={BRAND.fullName}
                    className="h-9 max-w-[160px] object-contain"
                  />
                ) : (
                  <>
                    <span className="grid size-9 place-items-center rounded-xl bg-gradient-to-br from-primary to-[oklch(0.62_0.19_286)] text-white shadow-md shadow-primary/25">
                      <GraduationCap className="size-5" />
                    </span>
                    <span className="text-base font-semibold tracking-tight text-foreground">
                      {BRAND.fullName}
                    </span>
                  </>
                )
              }
            />
          )}
        </Link>

        <nav className="ms-6 hidden items-center gap-1 lg:flex">
          {links.map((l) =>
            l.href === RESOURCES_HREF ? (
              <ResourcesMenu
                key={l.href}
                label={l.label}
                lead={tn("navResourcesLead")}
                links={resourceLinks}
                active={l.active}
                onDark={isHome}
              />
            ) : l.href === "/courses" ? (
              <CoursesMegaMenu
                key={l.href}
                locale={locale}
                label={l.label}
                categories={megaCategories}
                courses={megaCourses}
                active={l.active}
                onDark={isHome}
              />
            ) : (
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
            ),
          )}
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
            <Link href="/become-instructor">{tm("footerBecomeInstructor")}</Link>
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
                {links.map((l) =>
                  // There's no /resources page — expand the group inline rather
                  // than render a link that goes nowhere.
                  l.href === RESOURCES_HREF ? (
                    <div key={l.href} className="mt-2">
                      <p className="px-3 pb-1 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                        {l.label}
                      </p>
                      {resourceLinks.map((r) => (
                        <Link
                          key={r.href}
                          href={r.href}
                          className={cn(
                            "flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium",
                            pathname === r.href || pathname.startsWith(`${r.href}/`)
                              ? "bg-primary/10 text-primary"
                              : "text-foreground hover:bg-muted",
                          )}
                        >
                          {r.label}
                        </Link>
                      ))}
                    </div>
                  ) : (
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
                  ),
                )}
                <div className="mt-3 flex flex-col gap-2 px-1">
                  <Button asChild variant="outline">
                    <Link href="/login">{tc("signIn")}</Link>
                  </Button>
                  <Button asChild>
                    <Link href="/become-instructor">{tm("footerBecomeInstructor")}</Link>
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
