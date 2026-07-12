/** Site-settings DAL — branding theme + integrations catalogue (real backend). */
import { ok, fail, toMessage, type Result } from "@integration/lib/api-client";
import * as db from "@/lib/db/site-settings";
import type { BrandingTheme, SiteSettings } from "@/lib/db/site-settings";
import * as ssSvc from "@integration/services/site-settings";
import type { SiteSettings as FullSiteSettings, SiteSettingsPatch } from "@/types/site-settings";

async function wrap<T>(fn: () => Promise<T>, msg: string): Promise<Result<T>> {
  try {
    return ok(await fn());
  } catch (err) {
    return fail(toMessage(err, msg));
  }
}

export const fetchIntegrations = () => wrap(db.getIntegrations, "Failed to load integrations");
export const fetchTheme = () => wrap(db.getTheme, "Failed to load theme");
export const saveTheme = (theme: BrandingTheme) =>
  wrap(() => db.saveTheme(theme), "Failed to save branding theme");

export const fetchSiteSettings = () =>
  wrap(db.getSiteSettings, "Failed to load site settings");
export const saveSiteSettings = (site: SiteSettings): Promise<Result<db.SiteSettings>> =>
  wrap(async () => {
    await db.saveSiteSettingsDb(site);
    return site;
  }, "Failed to save site settings");

/* ── Typed 8-group SiteSettings (spec 03) — backed by the `site-setting` module ── */

/** Sane defaults so the editor/site render before an admin ever saves. */
export const DEFAULT_FULL_SETTINGS: FullSiteSettings = {
  general: { siteName: "IMETS Medical School", tagline: "", defaultLocale: "en", timezone: "Africa/Cairo", currency: "EGP" },
  branding: { logoUrl: "", darkLogoUrl: "", footerLogoUrl: "", faviconUrl: "", primaryColor: "#1111D4", ogImage: "" },
  theme: { primaryColor: "#1111D4", accentColor: "#FBBF24", mode: "light", allowUserToggle: true, radius: "soft" },
  contact: { supportEmail: "", phone: "", address: "", businessHours: "" },
  social: { facebook: "", x: "", linkedin: "", instagram: "", youtube: "" },
  integrations: { gaMeasurementId: "", gtmId: "", metaPixelId: "", hotjarId: "", intercomAppId: "", metaCapiEnabled: false, metaCapiToken: "", metaTestEventCode: "" },
  features: { jobs: false, questionBanks: true, events: true, webinars: false, blog: true, store: false },
  maintenance: { enabled: false, message: "We'll be back shortly." },
};

/** Admin GET — full settings incl. the CAPI token. */
export const fetchFullSettings = () => ssSvc.getAdminSettings();

/** The 8 settings groups the backend DTO accepts. */
const SETTINGS_GROUPS: (keyof FullSiteSettings)[] = [
  "general", "branding", "theme", "contact", "social", "integrations", "features", "maintenance",
];

/** Admin PATCH — deep-merge a partial patch (per group, server-side).
 * The admin GET returns a Mongo document (`_id`, `__v`, `createdAt`, `updatedAt`)
 * and the editor echoes the whole object back on save; strip everything except
 * the 8 known groups so the strict (`forbidNonWhitelisted`) backend DTO doesn't
 * 400 on those extra top-level keys. */
export const updateFullSettings = (patch: SiteSettingsPatch) => {
  const clean: Record<string, unknown> = {};
  for (const g of SETTINGS_GROUPS) {
    if (patch[g] !== undefined) clean[g] = patch[g];
  }
  return ssSvc.updateSettings(clean as SiteSettingsPatch);
};
/** Public GET — settings minus the CAPI token (cached). */
export const fetchPublicSettings = () => ssSvc.getPublicSettings();
