/** Typed 8-group site-settings (spec 03). The `metaCapiToken` is admin-only and
 * absent from the public view, so it's optional here. */
export interface SsGeneral { siteName: string; tagline: string; defaultLocale: string; timezone: string; currency: string }
export interface SsBranding { logoUrl: string; darkLogoUrl: string; footerLogoUrl: string; faviconUrl: string; primaryColor: string; ogImage: string }
export interface SsTheme { primaryColor: string; accentColor: string; mode: "light" | "dark" | "system"; allowUserToggle: boolean; radius: string }
export interface SsContact { supportEmail: string; phone: string; address: string; businessHours: string }
export interface SsSocial { facebook: string; x: string; linkedin: string; instagram: string; youtube: string }
export interface SsIntegrations {
  gaMeasurementId: string; gtmId: string; metaPixelId: string; hotjarId: string; intercomAppId: string;
  metaCapiEnabled: boolean; metaCapiToken?: string; metaTestEventCode: string;
}
export interface SsFeatures { jobs: boolean; questionBanks: boolean; events: boolean; webinars: boolean; blog: boolean; store: boolean }
export interface SsMaintenance { enabled: boolean; message: string }

export interface SiteSettings {
  general: SsGeneral;
  branding: SsBranding;
  theme: SsTheme;
  contact: SsContact;
  social: SsSocial;
  integrations: SsIntegrations;
  features: SsFeatures;
  maintenance: SsMaintenance;
}

export type SiteSettingsPatch = { [K in keyof SiteSettings]?: Partial<SiteSettings[K]> };

/** Public subset wired into the layout provider. */
export type PublicSiteSettings = SiteSettings;
