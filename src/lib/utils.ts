import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Tailwind-aware className combiner used by every UI component. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Generate a URL-friendly slug from a title (matches the course "slug" rule). */
export function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "") // strip diacritics
    .replace(/[^a-z0-9\s-]/g, "") // drop non-url chars (keeps it ascii-safe)
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

const CURRENCY_LOCALE: Record<string, string> = {
  EGP: "en-EG",
  SAR: "en-SA",
  USD: "en-US",
};

/** Format a number as a localized currency string (EGP / SAR / USD). */
export function formatCurrency(amount: number, currency = "EGP"): string {
  return new Intl.NumberFormat(CURRENCY_LOCALE[currency] ?? "en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

/** Compact number formatting for stat cards (e.g. 12_400 -> "12.4K"). */
export function formatCompact(value: number): string {
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

/** Format an ISO date string for tables and metadata rows. */
export function formatDate(
  date: string | Date,
  opts: Intl.DateTimeFormatOptions = { dateStyle: "medium" },
): string {
  const d = typeof date === "string" ? new Date(date) : date;
  if (Number.isNaN(d.getTime())) return "—";
  return new Intl.DateTimeFormat("en-US", opts).format(d);
}

/** Derive a percentage discount from a base price and sale price. */
export function deriveDiscount(price: number, salePrice: number): number {
  if (!price || salePrice <= 0 || salePrice > price) return 0;
  return Math.round(((price - salePrice) / price) * 100);
}

/** Initials for avatar fallbacks (e.g. "Ahmed Habib" -> "AH"). */
export function getInitials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

/** Stable, dependency-free id generator for local (client) entities. */
export function createId(prefix = "id"): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

/** Validate a YouTube URL (used by the course preview-video field). */
export function isYouTubeUrl(url: string): boolean {
  if (!url) return false;
  return /^(https?:\/\/)?(www\.)?(youtube\.com\/(watch\?v=|embed\/|shorts\/)|youtu\.be\/)[\w-]+/.test(
    url,
  );
}
