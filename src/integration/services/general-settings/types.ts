export interface GeneralSettingsSite {
  sitename?: string;
  supportEmail?: string;
  physicalAddress?: string;
  favicon?: string;
  seoTitle?: string;
  metaDescription?: string;
  maintenanceMode?: boolean;
}

export interface GeneralSettingsBranding {
  primary?: string;
  secondary?: string;
  highlight?: string;
  headingFont?: string;
  bodyFont?: string;
  borderRadius?: string;
  logoLight?: string;
  logoDark?: string;
  heroImage?: string;
}

export interface VdoCipherSettings {
  apiSecret?: string;
  folderId?: string;
  watermark?: boolean;
  screenRecordingProtection?: boolean;
  domainRestriction?: boolean;
  accentColor?: string;
  autoResuming?: string;
}

export interface GeneralSettings {
  _id?: string;
  site?: GeneralSettingsSite;
  branding?: GeneralSettingsBranding;
  vdocipher?: VdoCipherSettings;
  createdAt?: string;
  updatedAt?: string;
}
