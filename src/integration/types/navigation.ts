import { LucideIcon } from "lucide-react";

export interface SidebarNavItemChild {
  name: string;
  href: string;
  requiredPermissions?: string[];
  adminOnly?: boolean;
}

export interface SideBarItemType {
  title: string;
  url: string;
  icon?: LucideIcon;
  isActive?: boolean;
  items?: {
    title: string;
    url: string;
  }[];
}

export interface SidebarNavItem {
  name: string;
  href: string;
  icon: string;
  children?: SidebarNavItemChild[];
  requiredPermissions?: string[];
  adminOnly?: boolean;
}

export interface SidebarFooterLink {
  href: string;
  label: string;
  icon: string;
  adminOnly?: boolean;
}

export interface SidebarFooterProfile {
  initial: string;
  name: string;
  role: string;
}

export type HeaderType =
  | "none"
  | "minimal"
  | "full"
  | "centered"
  | "transparent";
  
export interface RouteConfig {
  pattern: string;
  headerType: HeaderType;
}

export interface SidebarProps {
  items: SidebarNavItem[];
  logoHref?: string;
  logoSrc?: string;
  logoAlt?: string;
  subtitle: string;
  footerLinks: SidebarFooterLink[];
  footerProfile?: SidebarFooterProfile;
  /** 'admin' uses gray-50 bg; 'instructor' uses white. */
  variant?: "admin" | "instructor";
}
