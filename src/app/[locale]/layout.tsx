import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Geist, Geist_Mono, Cairo, Plus_Jakarta_Sans } from "next/font/google";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { setRequestLocale } from "next-intl/server";

import "../globals.css";
import { routing, isRtl } from "@/i18n/routing";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { ApiBootstrap } from "@/components/providers/api-bootstrap";
import { configureServerApiClient } from "@/lib/api-client.server";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";

// Configure the server-side integration client (cookie bearer token) once.
configureServerApiClient();

const geistSans = Geist({ variable: "--font-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

// Display face for headings — pairs with Geist for a distinct, modern brand feel.
const jakarta = Plus_Jakarta_Sans({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

// Arabic typeface — applied automatically to [dir="rtl"] / [lang="ar"] content.
const cairo = Cairo({ variable: "--font-arabic", subsets: ["arabic", "latin"] });

export const metadata: Metadata = {
  title: {
    default: "IMETS School of Business",
    template: "%s · IMETS School of Business",
  },
  description:
    "IMETS School of Business — a modern online courses platform for professional and executive education.",
  metadataBase: new URL("https://imetsedu.com"),
};

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

  // Enable static rendering for this locale.
  setRequestLocale(locale);

  return (
    <html
      lang={locale}
      dir={isRtl(locale) ? "rtl" : "ltr"}
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} ${jakarta.variable} ${cairo.variable} h-full antialiased`}
    >
      <body
        suppressHydrationWarning
        className="min-h-full bg-background text-foreground"
      >
        <NextIntlClientProvider>
          <ApiBootstrap />
          <ThemeProvider>
            <TooltipProvider delayDuration={200}>
              {children}
              <Toaster richColors position="top-right" />
            </TooltipProvider>
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
