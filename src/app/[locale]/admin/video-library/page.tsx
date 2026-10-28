import { setRequestLocale } from "next-intl/server";

import { dal } from "@/lib/dal";
import { PageHeader } from "@/components/shared/page-header";
import { VideoLibrary } from "@/features/video-library/components/video-library";
import { PAGE_SIZE } from "@/features/video-library/lib/constants";

export const metadata = { robots: { index: false } };

const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? "";

export default async function AdminVideoLibraryPage({
  params, searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const sp = await searchParams;
  const folderId = first(sp.folder) || "root";
  const q = first(sp.q).trim();
  const page = Math.max(1, Number(first(sp.page)) || 1);

  const [view, videos] = await Promise.all([
    dal.videoLibrary.fetchFolder(folderId),
    dal.videoLibrary.fetchVideos({ folderId, page, limit: PAGE_SIZE, q }),
  ]);
  const error = !view.ok ? view.error : !videos.ok ? videos.error : undefined;

  return (
    <div className="mx-auto w-full max-w-[1400px] space-y-6">
      <PageHeader title="Video Library" description="Upload, organise and delete platform videos on VdoCipher. Copy a video ID to attach it to a course lecture." />
      <VideoLibrary
        key={`${folderId}|${q}|${page}`}
        folderId={folderId}
        view={view.ok ? view.data : null}
        videos={videos.ok ? videos.data : null}
        page={page}
        q={q}
        error={error}
      />
    </div>
  );
}
