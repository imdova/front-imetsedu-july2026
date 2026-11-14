"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";

import { dal } from "@/lib/dal";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

/** Mounted only while open, so credentials are fetched fresh (and expire unused) per preview. */
function Player({ videoId, title, account }: { videoId: string; title: string; account: string }) {
  const [creds, setCreds] = React.useState<{ otp: string; playbackInfo: string } | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let cancelled = false;
    void dal.videoLibrary.fetchPreviewOtp(videoId, account).then((r) => {
      if (cancelled) return;
      if (r.ok) setCreds(r.data); else setError(r.error);
    });
    return () => { cancelled = true; };
  }, [videoId, account]);

  if (error) return <p className="grid aspect-video place-items-center rounded-lg bg-muted px-4 text-center text-sm text-destructive">{error}</p>;
  if (!creds) return <div className="grid aspect-video place-items-center rounded-lg bg-muted"><Loader2 className="size-6 animate-spin text-muted-foreground" /></div>;

  const src = `https://player.vdocipher.com/v2/?otp=${encodeURIComponent(creds.otp)}&playbackInfo=${encodeURIComponent(creds.playbackInfo)}`;
  return (
    <iframe
      title={title}
      src={src}
      className="aspect-video w-full rounded-lg border-0 bg-black"
      allow="encrypted-media; fullscreen"   // encrypted-media is required or the DRM handshake never starts
      allowFullScreen
    />
  );
}

export function VideoPreviewDialog({ video, account, onClose }: { video: { id: string; title: string } | null; account: string; onClose: () => void }) {
  return (
    <Dialog open={!!video} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle className="pe-6 leading-snug">{video?.title}</DialogTitle>
          <DialogDescription className="font-mono text-xs">{video?.id}</DialogDescription>
        </DialogHeader>
        {video && <Player key={video.id} videoId={video.id} title={video.title} account={account} />}
      </DialogContent>
    </Dialog>
  );
}
