/**
 * Platform-marketing seed (mock DB) — promo banners + featured placements.
 *
 * Mirrors the clone-spec `marketing` module: admin CRUD here, public reads on
 * the live site later. When the DAL is pointed at the real backend
 * (`/admin/marketing/banners`, `/admin/marketing/promoted`) these helpers and
 * the in-memory arrays simply disappear — the `Result<T>` shape is unchanged.
 */
import { respond, clone } from "./delay";

export type BannerPlacement = "global" | "home" | "courses" | "checkout";
export type BannerVariant = "info" | "success" | "warning" | "promo";

export interface Banner {
  id: string;
  title: string;
  message: string;
  linkUrl: string;
  linkLabel: string;
  placement: BannerPlacement;
  variant: BannerVariant;
  isActive: boolean;
  startsAt?: string; // ISO date
  endsAt?: string; // ISO date
  order: number;
  createdAt: string;
  updatedAt: string;
}

export type PromotedItemType = "course" | "instructor" | "category" | "event";
export type PromotedSlot = "home_hero" | "home_featured" | "courses_top" | "sidebar";

export interface PromotedPlacement {
  id: string;
  itemType: PromotedItemType;
  itemId: string;
  label: string;
  slot: PromotedSlot;
  order: number;
  isActive: boolean;
  startsAt?: string;
  endsAt?: string;
  createdAt: string;
  updatedAt: string;
}

export type BannerInput = Omit<Banner, "id" | "createdAt" | "updatedAt">;
export type PromotedInput = Omit<PromotedPlacement, "id" | "createdAt" | "updatedAt">;

const now = "2026-06-01T09:00:00.000Z";

const banners: Banner[] = [
  {
    id: "ban_1",
    title: "Summer Intake 2026",
    message: "Enroll before July 15 and save 20% on all diploma programs.",
    linkUrl: "/courses",
    linkLabel: "Browse courses",
    placement: "global",
    variant: "promo",
    isActive: true,
    startsAt: "2026-06-01T00:00:00.000Z",
    endsAt: "2026-07-15T23:59:59.000Z",
    order: 1,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "ban_2",
    title: "New: AI for Business",
    message: "Our newest professional certificate is now open for registration.",
    linkUrl: "/courses/ai-for-business",
    linkLabel: "Learn more",
    placement: "home",
    variant: "info",
    isActive: true,
    order: 2,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "ban_3",
    title: "Scheduled maintenance",
    message: "The student portal will be briefly unavailable on Sunday 02:00–03:00.",
    linkUrl: "",
    linkLabel: "",
    placement: "global",
    variant: "warning",
    isActive: false,
    order: 3,
    createdAt: now,
    updatedAt: now,
  },
];

const promoted: PromotedPlacement[] = [
  {
    id: "promo_1",
    itemType: "course",
    itemId: "course_finance_101",
    label: "Financial Modeling Masterclass",
    slot: "home_hero",
    order: 1,
    isActive: true,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "promo_2",
    itemType: "course",
    itemId: "course_pmp",
    label: "PMP Exam Prep Bootcamp",
    slot: "home_featured",
    order: 2,
    isActive: true,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "promo_3",
    itemType: "instructor",
    itemId: "inst_sara",
    label: "Dr. Sara Khalil — Marketing",
    slot: "sidebar",
    order: 3,
    isActive: false,
    createdAt: now,
    updatedAt: now,
  },
];

let bannerSeq = banners.length;
let promotedSeq = promoted.length;
const stamp = () => new Date().toISOString();

/* ── Banners ── */
export const getBanners = () =>
  respond([...banners].sort((a, b) => a.order - b.order));

export async function createBanner(input: BannerInput): Promise<Banner> {
  const row: Banner = {
    ...input,
    id: `ban_${++bannerSeq}`,
    createdAt: stamp(),
    updatedAt: stamp(),
  };
  banners.push(row);
  return respond(row);
}

export async function updateBanner(
  id: string,
  patch: Partial<BannerInput>,
): Promise<Banner | null> {
  const row = banners.find((b) => b.id === id);
  if (!row) return respond(null);
  Object.assign(row, patch, { updatedAt: stamp() });
  return respond(clone(row));
}

export async function deleteBanner(id: string): Promise<boolean> {
  const i = banners.findIndex((b) => b.id === id);
  if (i === -1) return respond(false);
  banners.splice(i, 1);
  return respond(true);
}

/* ── Featured placements ── */
export const getPromoted = () =>
  respond([...promoted].sort((a, b) => a.order - b.order));

export async function createPromoted(input: PromotedInput): Promise<PromotedPlacement> {
  const row: PromotedPlacement = {
    ...input,
    id: `promo_${++promotedSeq}`,
    createdAt: stamp(),
    updatedAt: stamp(),
  };
  promoted.push(row);
  return respond(row);
}

export async function updatePromoted(
  id: string,
  patch: Partial<PromotedInput>,
): Promise<PromotedPlacement | null> {
  const row = promoted.find((p) => p.id === id);
  if (!row) return respond(null);
  Object.assign(row, patch, { updatedAt: stamp() });
  return respond(clone(row));
}

export async function deletePromoted(id: string): Promise<boolean> {
  const i = promoted.findIndex((p) => p.id === id);
  if (i === -1) return respond(false);
  promoted.splice(i, 1);
  return respond(true);
}
