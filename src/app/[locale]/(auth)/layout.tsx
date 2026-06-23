import type { ReactNode } from "react";
import { GraduationCap } from "lucide-react";
import { setRequestLocale } from "next-intl/server";

import { Link } from "@/i18n/navigation";
import { BRAND } from "@/constants/navigation";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { LanguageSwitcher } from "@/components/shared/language-switcher";

/** Auth screens — never index. */
export const metadata = { robots: { index: false, follow: false } };

export default async function AuthLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div className="relative flex min-h-svh flex-col bg-grid">
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-background to-background" />
      <header className="relative flex items-center justify-between px-4 py-5 sm:px-8">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="grid size-9 place-items-center rounded-xl bg-gradient-to-br from-primary to-[oklch(0.62_0.19_286)] text-white shadow-md shadow-primary/25">
            <GraduationCap className="size-5" />
          </span>
          <span className="text-base font-semibold tracking-tight">
            {BRAND.fullName}
          </span>
        </Link>
        <div className="flex items-center gap-1">
          <LanguageSwitcher />
          <ThemeToggle />
        </div>
      </header>

      <main className="relative flex flex-1 items-center justify-center px-4 py-10">
        <div className="w-full max-w-md">{children}</div>
      </main>
    </div>
  );
}
