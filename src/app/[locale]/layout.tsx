import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import { Geist, Geist_Mono, Cairo, Plus_Jakarta_Sans } from "next/font/google";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { setRequestLocale } from "next-intl/server";

import "../globals.css";
import { routing, isRtl } from "@/i18n/routing";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { ThemeNoFlashScript } from "@/components/providers/theme-no-flash-script";
import { ApiBootstrap } from "@/components/providers/api-bootstrap";
import { configureServerApiClient } from "@/lib/api-client.server";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { MetaPixel } from "@/components/analytics/meta-pixel";
import { SiteSettingsProvider } from "@/components/providers/site-settings-provider";
import { dal } from "@/lib/dal";
import { getTheme, getSiteSettings } from "@/lib/db/site-settings";

// Configure the server-side integration client (cookie bearer token) once.
configureServerApiClient();

const RADIUS_CSS: Record<string, string> = {
  square: "0.125rem", modern: "0.375rem", soft: "0.625rem", round: "1rem",
};

const geistSans = Geist({ variable: "--font-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const cairo = Cairo({ variable: "--font-arabic", subsets: ["arabic", "latin"] });

/** Dynamic metadata pulled from general-settings. */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const [{ settings }, theme, ss] = await Promise.all([
    getSiteSettings().catch(() => ({ settings: null })),
    getTheme().catch(() => null),
    dal.siteSettings.fetchPublicSettings().then((r) => (r.ok ? r.data : null)).catch(() => null),
  ]);
  // Prefer the typed site-settings branding/general; fall back to the legacy store.
  const siteName = ss?.general?.siteName || settings?.sitename || "IMETS Medical School";
  const seoTitle = settings?.seoTitle || siteName;
  const description = settings?.metaDescription || ss?.general?.tagline ||
    "IMETS Medical School — a modern online courses platform for professional healthcare education.";
  const keywords = settings?.keywords || undefined;
  const faviconUrl = ss?.branding?.faviconUrl || theme?.favicon;
  const ogImage = ss?.branding?.ogImage || undefined;

  return {
    title: { default: seoTitle, template: `%s · ${siteName}` },
    description,
    ...(keywords ? { keywords } : {}),
    ...(faviconUrl ? { icons: { icon: faviconUrl, shortcut: faviconUrl } } : {}),
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://imetsedu.com"),
    // Site-wide social defaults; per-page metadata overrides title/url/images.
    openGraph: {
      type: "website",
      siteName,
      locale: locale === "ar" ? "ar_EG" : "en_US",
      title: seoTitle,
      description,
      ...(ogImage ? { images: [ogImage] } : {}),
    },
    twitter: { card: "summary_large_image", title: seoTitle, description, ...(ogImage ? { images: [ogImage] } : {}) },
  };
}

export function generateViewport(): Viewport {
  return { themeColor: "#1111D4" };
}

/** Pre-render both locales at build time. */
export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();

  setRequestLocale(locale);

  // Public site settings (typed singleton) — best-effort; drives theme CSS vars,
  // the Meta Pixel id and the client provider. Falls back to the legacy branding
  // store so the site still renders if the settings backend is unavailable.
  const [theme, publicSettings] = await Promise.all([
    getTheme().catch(() => null),
    dal.siteSettings.fetchPublicSettings().then((r) => (r.ok ? r.data : null)).catch(() => null),
  ]);
  const primary = publicSettings?.theme?.primaryColor || theme?.primaryColor;
  const radiusKey = publicSettings?.theme?.radius || theme?.radius;
  const brandingVars = (primary || radiusKey)
    ? ({
        ...(primary ? { "--primary": primary, "--sidebar-primary": primary } : {}),
        ...(radiusKey ? { "--radius": RADIUS_CSS[radiusKey] ?? "0.75rem" } : {}),
      } as React.CSSProperties)
    : undefined;

  return (
    <html
      lang={locale}
      dir={isRtl(locale) ? "rtl" : "ltr"}
      suppressHydrationWarning
      style={brandingVars}
      className={`${geistSans.variable} ${geistMono.variable} ${jakarta.variable} ${cairo.variable} h-full antialiased`}
    >
      <body
        suppressHydrationWarning
        className="min-h-full bg-background text-foreground"
      >
        <ThemeNoFlashScript />
        <MetaPixel pixelId={publicSettings?.integrations?.metaPixelId} />
        <NextIntlClientProvider>
          <ApiBootstrap />
          <SiteSettingsProvider value={{
            branding: publicSettings?.branding ?? {},
            theme: publicSettings?.theme ?? {},
            features: publicSettings?.features ?? {},
          }}>
            <ThemeProvider>
              <TooltipProvider delayDuration={200}>
                {children}
                <Toaster richColors position="top-right" />
              </TooltipProvider>
            </ThemeProvider>
          </SiteSettingsProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
