import type { ReactNode } from "react";
import { setRequestLocale } from "next-intl/server";

import { PublicHeader } from "@/features/marketing/components/public-header";
import { PublicFooter } from "@/features/marketing/components/public-footer";
import { getTheme } from "@/lib/db/site-settings";

/** Public marketing shell: header + content + footer. No authenticated chrome. */
export default async function PublicLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const theme = await getTheme().catch(() => null);
  const logoLight = theme?.logoLight;

  return (
    <div className="flex min-h-svh flex-col">
      <PublicHeader logoLight={logoLight} />
      <main className="flex-1">{children}</main>
      <PublicFooter logoLight={logoLight} />
    </div>
  );
}
