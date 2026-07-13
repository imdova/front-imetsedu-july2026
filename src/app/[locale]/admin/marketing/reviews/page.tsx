import { setRequestLocale } from "next-intl/server";

import { ReviewsManager } from "@/features/marketing-admin/components/reviews-manager";

export const metadata = { robots: { index: false } };

export default async function AdminReviewsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div className="mx-auto max-w-[1400px]">
      <ReviewsManager />
    </div>
  );
}
