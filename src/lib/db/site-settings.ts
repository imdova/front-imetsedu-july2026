/**
 * Site-settings data module (self-contained): branding theme defaults and the
 * integrations catalogue backing the admin "Settings" console
 * (Branding & Theme Hub + Master Integrations Hub).
 */
import { respond } from "./delay";

export type IntegrationStatus = "connected" | "not_configured";
export type IntegrationGroup = "marketing" | "operations" | "financial" | "optimization";

export interface Integration {
  id: string;
  name: string;
  description: string;
  group: IntegrationGroup;
  icon: string; // lucide icon name
  accent: string;
  status: IntegrationStatus;
}

export interface BrandingTheme {
  primaryColor: string;
  accentColor: string;
  systemHighlight: string;
  headingFont: string;
  bodyFont: string;
  radius: "square" | "modern" | "soft" | "round";
}

export const DEFAULT_THEME: BrandingTheme = {
  primaryColor: "#1111D4",
  accentColor: "#FBBF24",
  systemHighlight: "#62a0ea",
  headingFont: "Poppins",
  bodyFont: "Inter",
  radius: "square",
};

const integrations: Integration[] = [
  { id: "int_fbpixel", name: "Facebook Pixel", description: "Track conversion and optimize ad performance.", group: "marketing", icon: "Share2", accent: "#3b82f6", status: "connected" },
  { id: "int_ga", name: "Google Analytics", description: "In-depth website traffic and user behavior data.", group: "marketing", icon: "BarChart3", accent: "#ef4444", status: "connected" },
  { id: "int_webmaster", name: "Webmaster Tools", description: "Monitor and maintain your site's presence in search results.", group: "marketing", icon: "Search", accent: "#ef4444", status: "not_configured" },
  { id: "int_zoom", name: "Zoom Classes", description: "Schedule and manage live interactive sessions.", group: "operations", icon: "Video", accent: "#3b82f6", status: "connected" },
  { id: "int_vdocipher", name: "VdoCipher", description: "High-security DRM video hosting for courses.", group: "operations", icon: "Lock", accent: "#f59e0b", status: "connected" },
  { id: "int_whatsapp", name: "WhatsApp API", description: "Automated notifications and student messaging.", group: "operations", icon: "MessageCircle", accent: "#22c55e", status: "connected" },
  { id: "int_payment", name: "Payment Gateway", description: "Process payments and manage transactions.", group: "financial", icon: "Landmark", accent: "#3b82f6", status: "connected" },
  { id: "int_seo", name: "Advanced SEO Tools", description: "Improve search visibility and rankings.", group: "optimization", icon: "Search", accent: "#a855f7", status: "not_configured" },
];

export const getIntegrations = () => respond(integrations);
export const getTheme = () => respond(DEFAULT_THEME);
