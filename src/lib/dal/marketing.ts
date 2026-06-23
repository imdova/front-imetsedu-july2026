/**
 * Marketing DAL — platform marketing (banners + featured placements).
 *
 * LIVE: delegates to the NestJS `marketing` module via `@integration/services/marketing`
 * (`/admin/marketing/*`). Backend docs use `_id`; we map to the UI `id` shape so
 * the feature components stay unchanged. Types are still sourced from
 * `@/lib/db/marketing` (the UI view-model home); the mock data there is no longer
 * used at runtime.
 */
import { ok, fail, toMessage, type Result } from "@integration/lib/api-client";
import * as svc from "@integration/services/marketing";
import type {
  Banner,
  BannerInput,
  BannerPlacement,
  BannerVariant,
  PromotedPlacement,
  PromotedInput,
  PromotedItemType,
  PromotedSlot,
} from "@/lib/db/marketing";

/* ── Mappers (backend DTO → UI view-model) ── */
function mapBanner(d: svc.BannerDto): Banner {
  return {
    id: d._id,
    title: d.title,
    message: d.message ?? "",
    linkUrl: d.linkUrl ?? "",
    linkLabel: d.linkLabel ?? "",
    placement: d.placement as BannerPlacement,
    variant: d.variant as BannerVariant,
    isActive: d.isActive,
    startsAt: d.startsAt,
    endsAt: d.endsAt,
    order: d.order ?? 0,
    createdAt: d.createdAt,
    updatedAt: d.updatedAt,
  };
}

function mapPromoted(d: svc.PromotedDto): PromotedPlacement {
  return {
    id: d._id,
    itemType: d.itemType as PromotedItemType,
    itemId: d.itemId,
    label: d.label ?? "",
    slot: d.slot as PromotedSlot,
    order: d.order ?? 0,
    isActive: d.isActive,
    startsAt: d.startsAt,
    endsAt: d.endsAt,
    createdAt: d.createdAt,
    updatedAt: d.updatedAt,
  };
}

/* ── Banners ── */
export async function fetchBanners(): Promise<Result<Banner[]>> {
  const res = await svc.listBanners();
  if (!res.ok) return res;
  try {
    return ok(res.data.map(mapBanner));
  } catch (err) {
    return fail(toMessage(err, "Failed to load banners"));
  }
}

export async function createBanner(input: BannerInput): Promise<Result<Banner>> {
  const res = await svc.createBanner(input);
  return res.ok ? ok(mapBanner(res.data)) : res;
}

export async function updateBanner(
  id: string,
  patch: Partial<BannerInput>,
): Promise<Result<Banner | null>> {
  const res = await svc.updateBanner(id, patch);
  return res.ok ? ok(res.data ? mapBanner(res.data) : null) : res;
}

export async function deleteBanner(id: string): Promise<Result<boolean>> {
  const res = await svc.deleteBanner(id);
  return res.ok ? ok(true) : res;
}

/* ── Featured placements ── */
export async function fetchPromoted(): Promise<Result<PromotedPlacement[]>> {
  const res = await svc.listPromoted();
  if (!res.ok) return res;
  try {
    return ok(res.data.map(mapPromoted));
  } catch (err) {
    return fail(toMessage(err, "Failed to load featured placements"));
  }
}

export async function createPromoted(input: PromotedInput): Promise<Result<PromotedPlacement>> {
  const res = await svc.createPromoted(input);
  return res.ok ? ok(mapPromoted(res.data)) : res;
}

export async function updatePromoted(
  id: string,
  patch: Partial<PromotedInput>,
): Promise<Result<PromotedPlacement | null>> {
  const res = await svc.updatePromoted(id, patch);
  return res.ok ? ok(res.data ? mapPromoted(res.data) : null) : res;
}

export async function deletePromoted(id: string): Promise<Result<boolean>> {
  const res = await svc.deletePromoted(id);
  return res.ok ? ok(true) : res;
}
