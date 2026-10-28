"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight, Copy, Film, Folder, FolderPlus, Loader2, MoreVertical, Pencil, Play, RefreshCw, Search, Trash2, UploadCloud } from "lucide-react";
import { toast } from "sonner";

import { Link, useRouter } from "@/i18n/navigation";
import { dal } from "@/lib/dal";
import type { FolderView, LibraryVideo } from "@/lib/dal/video-library";
import { useConfirm } from "@/hooks/use-confirm";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { PAGE_SIZE } from "../lib/constants";
import { UploadDialog } from "./upload-dialog";
import { VideoPreviewDialog } from "./video-preview-dialog";

const HREF = "/admin/video-library";

const href = (p: { folder?: string; page?: number; q?: string }) => {
  const qs = new URLSearchParams();
  if (p.folder && p.folder !== "root") qs.set("folder", p.folder);
  if (p.q) qs.set("q", p.q);
  if (p.page && p.page > 1) qs.set("page", String(p.page));
  const s = qs.toString();
  return s ? `${HREF}?${s}` : HREF;
};

const duration = (sec: number) => {
  const s = Math.max(0, Math.round(sec));
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), r = s % 60;
  const pad = (n: number) => String(n).padStart(2, "0");
  return h ? `${h}:${pad(m)}:${pad(r)}` : `${pad(m)}:${pad(r)}`;
};

function StatusBadge({ status }: { status: string }) {
  const s = status.toLowerCase();
  if (s === "ready") return <Badge className="border-green-200 bg-green-50 text-green-700">Ready</Badge>;
  if (s.includes("fail") || s.includes("error")) return <Badge variant="destructive">Failed</Badge>;
  // PRE-Upload / Queued / Encoding … — it is on its way, just not playable yet.
  return <Badge className="border-amber-200 bg-amber-50 text-amber-700">{s === "encoding" ? "Processing" : status.charAt(0).toUpperCase() + status.slice(1).toLowerCase()}</Badge>;
}

export function VideoLibrary({
  folderId, view, videos, page, q, error,
}: {
  folderId: string;
  view: FolderView | null;
  videos: { count: number; rows: LibraryVideo[] } | null;
  page: number;
  q: string;
  error?: string;
}) {
  const router = useRouter();
  const { confirm, Confirmation } = useConfirm();
  const [search, setSearch] = React.useState(q);
  const [uploadOpen, setUploadOpen] = React.useState(false);
  const [preview, setPreview] = React.useState<{ id: string; title: string } | null>(null);
  const [folderDialog, setFolderDialog] = React.useState<{ mode: "create" } | { mode: "rename"; id: string; name: string } | null>(null);
  const [folderName, setFolderName] = React.useState("");
  const [saving, setSaving] = React.useState(false);
  const [refreshing, startRefresh] = React.useTransition();

  const isRoot = folderId === "root";
  const folders = view?.folders ?? [];
  const rows = videos?.rows ?? [];
  const total = videos?.count ?? 0;
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const currentName = view?.current?.name ?? "My Videos";
  const refresh = () => startRefresh(() => router.refresh());

  const openFolderDialog = (d: NonNullable<typeof folderDialog>) => { setFolderName(d.mode === "rename" ? d.name : ""); setFolderDialog(d); };

  const saveFolder = async () => {
    const name = folderName.trim();
    if (!name || !folderDialog) return;
    setSaving(true);
    const r = folderDialog.mode === "create"
      ? await dal.videoLibrary.createFolder(name, folderId)
      : await dal.videoLibrary.renameFolder(folderDialog.id, name);
    setSaving(false);
    if (!r.ok) { toast.error(r.error); return; }
    toast.success(folderDialog.mode === "create" ? "Folder created" : "Folder renamed");
    setFolderDialog(null);
    refresh();
  };

  const removeFolder = async (id: string, name: string) => {
    const yes = await confirm({
      title: "Delete folder",
      description: `“${name}” will be deleted. Its videos are not deleted — they move up to the parent folder.`,
      confirmText: "Delete", variant: "destructive",
    });
    if (!yes) return;
    const r = await dal.videoLibrary.deleteFolder(id);
    if (!r.ok) { toast.error(r.error); return; }
    toast.success("Folder deleted");
    refresh();
  };

  const removeVideo = async (v: LibraryVideo) => {
    const yes = await confirm({
      title: "Delete video",
      description: `“${v.title}” will be permanently deleted from VdoCipher. Any lecture that uses video ID ${v.id} will stop playing.`,
      confirmText: "Delete", variant: "destructive",
    });
    if (!yes) return;
    const r = await dal.videoLibrary.deleteVideo(v.id);
    if (!r.ok) { toast.error(r.error); return; }
    toast.success("Video deleted");
    refresh();
  };

  const copyId = async (id: string) => {
    try { await navigator.clipboard.writeText(id); toast.success("Video ID copied"); } catch { toast.error("Could not copy — select the ID and copy it manually"); }
  };

  const submitSearch = (e: React.FormEvent) => { e.preventDefault(); router.push(href({ folder: folderId, q: search.trim() })); };

  return (
    <div className="space-y-5">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2">
        <form onSubmit={submitSearch} className="flex min-w-[240px] flex-1 items-center gap-2">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search videos by title or ID…" className="ps-9" aria-label="Search videos" />
          </div>
          <Button type="submit" variant="outline">Search</Button>
        </form>
        <Button type="button" variant="outline" size="icon" onClick={refresh} disabled={refreshing} aria-label="Refresh">
          <RefreshCw className={`size-4 ${refreshing ? "animate-spin" : ""}`} />
        </Button>
        <Button type="button" variant="outline" onClick={() => openFolderDialog({ mode: "create" })}><FolderPlus className="size-4" /> New Folder</Button>
        <Button type="button" onClick={() => setUploadOpen(true)}><UploadCloud className="size-4" /> Upload Video</Button>
      </div>

      {/* Breadcrumb */}
      <nav aria-label="Folder path" className="flex flex-wrap items-center gap-1.5 border-b pb-3 text-sm">
        {!isRoot && (
          <Link href={href({ folder: view?.path.at(-2)?.id ?? "root" })} aria-label="Up one level" className="rounded p-1 text-muted-foreground hover:bg-muted"><ChevronLeft className="size-4 rtl:rotate-180" /></Link>
        )}
        {isRoot ? <span className="font-medium">My Videos</span> : <Link href={HREF} className="text-muted-foreground hover:text-foreground">My Videos</Link>}
        {view?.path.map((p, i) => (
          <React.Fragment key={p.id}>
            <span className="text-muted-foreground">/</span>
            {i === view.path.length - 1
              ? <span className="font-medium">{p.name}</span>
              : <Link href={href({ folder: p.id })} className="text-muted-foreground hover:text-foreground">{p.name}</Link>}
          </React.Fragment>
        ))}
        {q && <span className="ms-2 text-muted-foreground">· results for “{q}” <Link href={href({ folder: folderId })} className="text-primary hover:underline">clear</Link></span>}
      </nav>

      {error && <p className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">{error}</p>}

      {/* Folders */}
      {!q && folders.length > 0 && (
        <section aria-label="Folders" className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {folders.map((f) => (
            <div key={f.id} className="group relative flex items-center gap-3 rounded-xl border bg-card p-3 transition hover:border-primary/50 hover:shadow-sm">
              <Link href={href({ folder: f.id })} className="flex min-w-0 flex-1 items-center gap-3 after:absolute after:inset-0">
                <span className="grid size-11 shrink-0 place-items-center rounded-lg bg-amber-50 text-amber-600"><Folder className="size-5" /></span>
                <span className="min-w-0">
                  <span className="block truncate text-sm font-medium">{f.name}</span>
                  <span className="block text-xs text-muted-foreground">{f.videosCount} video{f.videosCount === 1 ? "" : "s"}{f.foldersCount ? ` · ${f.foldersCount} folder${f.foldersCount === 1 ? "" : "s"}` : ""}</span>
                </span>
              </Link>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button type="button" variant="ghost" size="icon-sm" className="relative z-10" aria-label={`Actions for ${f.name}`}><MoreVertical className="size-4" /></Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => openFolderDialog({ mode: "rename", id: f.id, name: f.name })}><Pencil className="size-4" /> Rename</DropdownMenuItem>
                  <DropdownMenuItem variant="destructive" onClick={() => removeFolder(f.id, f.name)}><Trash2 className="size-4" /> Delete</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ))}
        </section>
      )}

      {/* Videos — four per row on desktop */}
      {rows.length > 0 ? (
        <section aria-label="Videos" className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {rows.map((v) => {
            const ready = v.status.toLowerCase() === "ready";
            return (
              <article key={v.id} className="overflow-hidden rounded-xl border bg-card">
                <button
                  type="button"
                  disabled={!ready}
                  onClick={() => setPreview({ id: v.id, title: v.title })}
                  aria-label={ready ? `Play ${v.title}` : `${v.title} is not ready yet`}
                  className="group relative block aspect-video w-full bg-muted disabled:cursor-not-allowed"
                >
                  {v.poster ? (
                    // eslint-disable-next-line @next/next/no-img-element -- VdoCipher poster CDN, admin-only thumbnails
                    <img src={v.poster} alt="" loading="lazy" className="size-full object-cover" />
                  ) : (
                    <span className="grid size-full place-items-center text-muted-foreground">{ready ? <Film className="size-8" /> : <Loader2 className="size-6 animate-spin" />}</span>
                  )}
                  {ready && <span className="absolute inset-0 grid place-items-center bg-black/0 opacity-0 transition group-hover:bg-black/30 group-hover:opacity-100"><span className="grid size-12 place-items-center rounded-full bg-black/60 text-white"><Play className="size-5 translate-x-0.5 fill-current" /></span></span>}
                  {v.length > 0 && <span className="absolute bottom-2 end-2 rounded bg-black/75 px-1.5 py-0.5 text-xs font-medium text-white tabular-nums">{duration(v.length)}</span>}
                </button>
                <div className="space-y-3 p-3.5">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="line-clamp-2 text-sm font-medium leading-snug" title={v.title}>{v.title}</h3>
                    <StatusBadge status={v.status} />
                  </div>
                  <div className="flex items-center justify-between gap-2 rounded-md bg-muted/60 px-2.5 py-1.5">
                    <code className="truncate font-mono text-xs text-muted-foreground" title={v.id}>{v.id}</code>
                    <Button type="button" variant="ghost" size="icon-sm" onClick={() => copyId(v.id)} aria-label="Copy video ID"><Copy className="size-4" /></Button>
                  </div>
                  <Button type="button" variant="outline" size="icon-sm" className="text-destructive hover:text-destructive" onClick={() => removeVideo(v)} aria-label={`Delete ${v.title}`}><Trash2 className="size-4" /></Button>
                </div>
              </article>
            );
          })}
        </section>
      ) : !error && (
        <div className="grid place-items-center gap-2 rounded-xl border border-dashed py-16 text-center">
          <Film className="size-8 text-muted-foreground" />
          <p className="text-sm font-medium">{q ? "No videos match your search" : folders.length ? "No videos directly in this folder" : isRoot ? "No videos yet" : "This folder is empty"}</p>
          {!q && <Button type="button" size="sm" onClick={() => setUploadOpen(true)}><UploadCloud className="size-4" /> Upload Video</Button>}
        </div>
      )}

      {/* Pagination */}
      {pages > 1 && (
        <div className="flex items-center justify-between border-t pt-4 text-sm">
          <span className="text-muted-foreground">{total} videos · page {page} of {pages}</span>
          <div className="flex gap-2">
            <Button asChild variant="outline" size="sm" disabled={page <= 1}><Link href={href({ folder: folderId, q, page: page - 1 })} aria-disabled={page <= 1}><ChevronLeft className="size-4 rtl:rotate-180" /> Previous</Link></Button>
            <Button asChild variant="outline" size="sm" disabled={page >= pages}><Link href={href({ folder: folderId, q, page: page + 1 })} aria-disabled={page >= pages}>Next <ChevronRight className="size-4 rtl:rotate-180" /></Link></Button>
          </div>
        </div>
      )}

      <UploadDialog open={uploadOpen} onOpenChange={setUploadOpen} folderId={folderId} folderName={isRoot ? "My Videos" : currentName} onFinished={refresh} />
      <VideoPreviewDialog video={preview} onClose={() => setPreview(null)} />

      <Dialog open={!!folderDialog} onOpenChange={(o) => !o && !saving && setFolderDialog(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{folderDialog?.mode === "rename" ? "Rename folder" : "New folder"}</DialogTitle>
            <DialogDescription>{folderDialog?.mode === "rename" ? "Give this folder a new name." : `Created inside ${isRoot ? "My Videos" : currentName}.`}</DialogDescription>
          </DialogHeader>
          <form onSubmit={(e) => { e.preventDefault(); void saveFolder(); }}>
            <Input autoFocus value={folderName} onChange={(e) => setFolderName(e.target.value)} placeholder="Folder name" maxLength={120} aria-label="Folder name" />
            <DialogFooter className="mt-4">
              <Button type="button" variant="outline" disabled={saving} onClick={() => setFolderDialog(null)}>Cancel</Button>
              <Button type="submit" disabled={saving || !folderName.trim()}>{saving ? <Loader2 className="size-4 animate-spin" /> : null}{folderDialog?.mode === "rename" ? "Save" : "Create"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {Confirmation}
    </div>
  );
}
