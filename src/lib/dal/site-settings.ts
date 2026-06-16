/** Site-settings DAL — branding theme + integrations catalogue (real backend). */
import { ok, fail, toMessage, type Result } from "@integration/lib/api-client";
import * as db from "@/lib/db/site-settings";
import type { BrandingTheme, SiteSettings } from "@/lib/db/site-settings";

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
