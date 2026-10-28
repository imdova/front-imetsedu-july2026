/**
 * Video Library DAL — LIVE (NestJS `video-library` module, a server-side proxy
 * to VdoCipher: folders, listing, upload credentials, delete, preview OTP).
 */
import { ok, type Result } from "@integration/lib/api-client";
import * as svc from "@integration/services/video-library";

export type VideoFolder = svc.VlFolderDto;
export type FolderView = svc.VlFolderViewDto;
export type LibraryVideo = svc.VlVideoDto;
export type UploadCredentials = svc.VlUploadCredentialsDto;

export const ROOT = "root";

export async function fetchFolder(id: string = ROOT): Promise<Result<FolderView>> { return svc.getFolder(id); }
export async function createFolder(name: string, parent: string = ROOT): Promise<Result<VideoFolder>> { return svc.createFolder(name, parent); }
export async function renameFolder(id: string, name: string): Promise<Result<boolean>> {
  const r = await svc.renameFolder(id, name); return r.ok ? ok(true) : r;
}
export async function deleteFolder(id: string): Promise<Result<boolean>> {
  const r = await svc.deleteFolder(id); return r.ok ? ok(true) : r;
}

export async function fetchVideos(p: { folderId?: string; page?: number; limit?: number; q?: string }): Promise<Result<{ count: number; rows: LibraryVideo[] }>> {
  return svc.listVideos({ folderId: p.folderId || ROOT, page: p.page ?? 1, limit: p.limit ?? 24, q: p.q });
}
export async function requestUpload(title: string, folderId: string = ROOT): Promise<Result<UploadCredentials>> { return svc.uploadCredentials(title, folderId); }
export async function deleteVideo(id: string): Promise<Result<boolean>> {
  const r = await svc.deleteVideo(id); return r.ok ? ok(true) : r;
}
export async function fetchPreviewOtp(id: string): Promise<Result<{ otp: string; playbackInfo: string }>> { return svc.previewOtp(id); }
