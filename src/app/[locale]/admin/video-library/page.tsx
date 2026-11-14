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

  // Which VdoCipher account to browse: ?account=, else the first one configured.
  const accountsRes = await dal.videoLibrary.fetchAccounts();
  const accounts = accountsRes.ok ? accountsRes.data : [];
  const account = accounts.find((a) => a.id === first(sp.account))?.id ?? accounts[0]?.id ?? "";

  const [view, videos] = account
    ? await Promise.all([
        dal.videoLibrary.fetchFolder(folderId, account),
        dal.videoLibrary.fetchVideos({ folderId, page, limit: PAGE_SIZE, q, account }),
      ])
    : [null, null];
  const error = !accountsRes.ok ? accountsRes.error : view && !view.ok ? view.error : videos && !videos.ok ? videos.error : undefined;

  return (
    <div className="mx-auto w-full max-w-[1400px] space-y-6">
      <PageHeader title="Video Library" description="Upload, organise and delete platform videos on VdoCipher — across one or more VdoCipher accounts. Copy a video ID to attach it to a course lecture." />
      <VideoLibrary
        key={`${account}|${folderId}|${q}|${page}`}
        accounts={accounts}
        account={account}
        folderId={folderId}
        view={view?.ok ? view.data : null}
        videos={videos?.ok ? videos.data : null}
        page={page}
        q={q}
        error={error}
      />
    </div>
  );
}
