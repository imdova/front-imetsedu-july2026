/**
 * Site-settings data module: branding theme + integrations catalogue backing
 * the admin "Settings" console (Branding & Theme Hub + Master Integrations Hub).
 *
 * Branding is backed by the real backend `/general-settings` bag (a schemaless,
 * publicly-readable single document); the integrations grid is a static
 * front-end catalogue of supported providers (the backend has no list endpoint
 * for it) whose connected/not-configured status is derived from which provider
 * keys are present in that same settings document.
 */
import {
  getGeneralSettings,
  saveGeneralSettings,
} from "@integration/services/general-settings/general-settings.service";
import type { GeneralSettings, GeneralSettingsBranding } from "@integration/services/general-settings/types";
import { respond } from "./delay";

export type IntegrationStatus = "connected" | "not_configured";
export type IntegrationGroup = "marketing" | "operations" | "optimization";

export interface Integration {
  id: string;
  name: string;
  description: string;
  group: IntegrationGroup;
  icon: string; // lucide icon name
  accent: string;
  status: IntegrationStatus;
}

export interface SiteSettings {
  sitename: string;
  supportEmail: string;
  physicalAddress: string;
  seoTitle: string;
  metaDescription: string;
  keywords: string;
  maintenanceMode: boolean;
}

export const DEFAULT_SITE: SiteSettings = {
  sitename: "",
  supportEmail: "",
  physicalAddress: "",
  seoTitle: "",
  metaDescription: "",
  keywords: "",
  maintenanceMode: false,
};

export interface BrandingTheme {
  primaryColor: string;
  accentColor: string;
  systemHighlight: string;
  headingFont: string;
  bodyFont: string;
  radius: "square" | "modern" | "soft" | "round";
  logoLight?: string;
  logoDark?: string;
  favicon?: string;
}

export const DEFAULT_THEME: BrandingTheme = {
  primaryColor: "#1111D4",
  accentColor: "#FBBF24",
  systemHighlight: "#62a0ea",
  headingFont: "Poppins",
  bodyFont: "Inter",
  radius: "square",
};

/* ───────────────────────── Branding ↔ backend mapping ────────────────────── */
const RADIUS_PX: Record<BrandingTheme["radius"], string> = {
  square: "2px", modern: "6px", soft: "10px", round: "16px",
};

function toRadius(raw?: string): BrandingTheme["radius"] {
  if (!raw) return DEFAULT_THEME.radius;
  const v = raw.trim().toLowerCase();
  if (v === "square" || v === "modern" || v === "soft" || v === "round") return v;
  const px = parseInt(v, 10);
  if (!Number.isNaN(px)) {
    if (px <= 3) return "square";
    if (px <= 8) return "modern";
    if (px <= 13) return "soft";
    return "round";
  }
  return DEFAULT_THEME.radius;
}

/** Map the backend `branding` sub-document onto the UI theme shape. */
export function mapTheme(b?: GeneralSettingsBranding): BrandingTheme {
  if (!b) return DEFAULT_THEME;
  return {
    primaryColor: b.primary ?? DEFAULT_THEME.primaryColor,
    accentColor: b.secondary ?? DEFAULT_THEME.accentColor,
    systemHighlight: b.highlight ?? DEFAULT_THEME.systemHighlight,
    headingFont: b.headingFont ?? DEFAULT_THEME.headingFont,
    bodyFont: b.bodyFont ?? DEFAULT_THEME.bodyFont,
    radius: toRadius(b.borderRadius),
    logoLight: b.logoLight,
    logoDark: b.logoDark,
  };
}

/** Reverse map — UI theme onto the backend `branding` sub-document. */
export function themeToBranding(t: BrandingTheme): GeneralSettingsBranding {
  return {
    primary: t.primaryColor,
    secondary: t.accentColor,
    highlight: t.systemHighlight,
    headingFont: t.headingFont,
    bodyFont: t.bodyFont,
    borderRadius: RADIUS_PX[t.radius],
    logoLight: t.logoLight,
    logoDark: t.logoDark,
  };
}

/* ───────────────────────── Integrations catalogue ────────────────────────── */
// The provider grid the console renders. `status` is overridden at fetch time
// from the live settings document via `connectedFromSettings()`.
const INTEGRATIONS_CATALOGUE: Integration[] = [
  { id: "int_fbpixel", name: "Facebook Pixel", description: "Track conversion and optimize ad performance.", group: "marketing", icon: "Share2", accent: "#3b82f6", status: "not_configured" },
  { id: "int_ga", name: "Google Analytics", description: "In-depth website traffic and user behavior data.", group: "marketing", icon: "BarChart3", accent: "#ef4444", status: "not_configured" },
  { id: "int_webmaster", name: "Webmaster Tools", description: "Monitor and maintain your site's presence in search results.", group: "marketing", icon: "Search", accent: "#ef4444", status: "not_configured" },
  { id: "int_zoom", name: "Zoom Classes", description: "Schedule and manage live interactive sessions.", group: "operations", icon: "Video", accent: "#3b82f6", status: "not_configured" },
  { id: "int_vdocipher", name: "VdoCipher", description: "High-security DRM video hosting for courses.", group: "operations", icon: "Lock", accent: "#f59e0b", status: "not_configured" },
  { id: "int_whatsapp", name: "WhatsApp API", description: "Automated notifications and student messaging.", group: "operations", icon: "MessageCircle", accent: "#22c55e", status: "not_configured" },
  { id: "int_seo", name: "Advanced SEO Tools", description: "Improve search visibility and rankings.", group: "optimization", icon: "Search", accent: "#a855f7", status: "not_configured" },
];

/** Derive connected status from which provider keys exist in the settings bag. */
function connectedFromSettings(s: GeneralSettings | null): Set<string> {
  const on = new Set<string>();
  if (!s) return on;
  const bag = s as Record<string, unknown>;
  if (bag.vdocipher && (s.vdocipher?.apiSecret || s.vdocipher?.folderId)) on.add("int_vdocipher");
  if (bag.whatsapp) on.add("int_whatsapp");
  if (bag.zoom) on.add("int_zoom");
  if (bag.facebookPixel || bag.fbPixel) on.add("int_fbpixel");
  if (bag.googleAnalytics || bag.ga) on.add("int_ga");
  return on;
}

let cachedSettings: GeneralSettings | null = null;

/** Load (and cache for this request) the single general-settings document. */
async function loadSettings(): Promise<GeneralSettings | null> {
  const res = await getGeneralSettings();
  cachedSettings = res.ok ? res.data : null;
  return cachedSettings;
}

export async function getSiteSettings(): Promise<{ settings: SiteSettings; id?: string }> {
  const s = await loadSettings();
  return {
    settings: {
      sitename: s?.site?.sitename ?? DEFAULT_SITE.sitename,
      supportEmail: s?.site?.supportEmail ?? DEFAULT_SITE.supportEmail,
      physicalAddress: s?.site?.physicalAddress ?? DEFAULT_SITE.physicalAddress,
      seoTitle: s?.site?.seoTitle ?? DEFAULT_SITE.seoTitle,
      metaDescription: s?.site?.metaDescription ?? DEFAULT_SITE.metaDescription,
      keywords: s?.site?.keywords ?? DEFAULT_SITE.keywords,
      maintenanceMode: s?.site?.maintenanceMode ?? DEFAULT_SITE.maintenanceMode,
    },
    id: s?._id,
  };
}

export async function saveSiteSettingsDb(site: SiteSettings): Promise<GeneralSettings> {
  const existing = await getGeneralSettings();
  const current = existing.ok ? existing.data : null;
  const next: Omit<GeneralSettings, "_id" | "createdAt" | "updatedAt"> = {
    ...(current ?? {}),
    site: { ...(current?.site ?? {}), ...site },
  };
  delete (next as Record<string, unknown>)._id;
  const res = await saveGeneralSettings(next, current?._id);
  if (!res.ok) throw new Error(res.error);
  cachedSettings = res.data;
  return res.data;
}

export async function getTheme(): Promise<BrandingTheme> {
  const s = await loadSettings();
  return { ...mapTheme(s?.branding), favicon: s?.site?.favicon };
}

export async function getIntegrations(): Promise<Integration[]> {
  const s = cachedSettings ?? (await loadSettings());
  const on = connectedFromSettings(s);
  return INTEGRATIONS_CATALOGUE.map((i) => ({
    ...i,
    status: on.has(i.id) ? "connected" : i.status,
  }));
}

/** Persist branding theme back to the `/general-settings` document.
 * Also saves favicon → site.favicon since it lives outside the branding block. */
export async function saveTheme(theme: BrandingTheme): Promise<GeneralSettings> {
  const existing = await getGeneralSettings();
  const current = existing.ok ? existing.data : null;
  const next: Omit<GeneralSettings, "_id" | "createdAt" | "updatedAt"> = {
    ...(current ?? {}),
    branding: { ...(current?.branding ?? {}), ...themeToBranding(theme) },
    site: {
      ...(current?.site ?? {}),
      ...(theme.favicon !== undefined ? { favicon: theme.favicon } : {}),
    },
  };
  delete (next as Record<string, unknown>)._id;
  const res = await saveGeneralSettings(next, current?._id);
  if (!res.ok) throw new Error(res.error);
  cachedSettings = res.data;
  return res.data;
}

// Kept for parity with the previous local module signature (unused fallback).
export const _DEFAULT_INTEGRATIONS = () => respond(INTEGRATIONS_CATALOGUE);
