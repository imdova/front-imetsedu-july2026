import * as marketingSvc from "@integration/services/marketing";
import { BannerBarView, type PublicBanner } from "./banner-bar-view";

/**
 * Server component — fetches active global banners from the public API and
 * renders the dismissible promo bar. Best-effort: renders nothing if the API is
 * unavailable. Mount near the top of the public layout.
 */
export async function PublicBannerBar({ placement = "global" }: { placement?: string }) {
  const res = await marketingSvc.listActiveBanners(placement);
  if (!res.ok || !res.data.length) return null;

  const banners: PublicBanner[] = res.data.map((b) => ({
    id: b._id,
    message: b.message,
    linkUrl: b.linkUrl,
    linkLabel: b.linkLabel,
    variant: b.variant,
  }));

  return <BannerBarView banners={banners} />;
}
