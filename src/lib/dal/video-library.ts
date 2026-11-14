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
export type VdoAccount = svc.VlAccountDto;

export const ROOT = "root";

export async function fetchAccounts(): Promise<Result<VdoAccount[]>> { return svc.listAccounts(); }
export async function addAccount(label: string, secret: string): Promise<Result<VdoAccount>> { return svc.createAccount(label, secret); }
export async function editAccount(id: string, patch: { label?: string; secret?: string }): Promise<Result<VdoAccount>> { return svc.updateAccount(id, patch); }
export async function removeAccount(id: string): Promise<Result<boolean>> {
  const r = await svc.deleteAccount(id); return r.ok ? ok(true) : r;
}

export async function fetchFolder(id: string = ROOT, account?: string): Promise<Result<FolderView>> { return svc.getFolder(id, account); }
export async function createFolder(name: string, parent: string = ROOT, account?: string): Promise<Result<VideoFolder>> { return svc.createFolder(name, parent, account); }
export async function renameFolder(id: string, name: string, account?: string): Promise<Result<boolean>> {
  const r = await svc.renameFolder(id, name, account); return r.ok ? ok(true) : r;
}
export async function deleteFolder(id: string, account?: string): Promise<Result<boolean>> {
  const r = await svc.deleteFolder(id, account); return r.ok ? ok(true) : r;
}

export async function fetchVideos(p: { folderId?: string; page?: number; limit?: number; q?: string; account?: string }): Promise<Result<{ count: number; rows: LibraryVideo[] }>> {
  return svc.listVideos({ folderId: p.folderId || ROOT, page: p.page ?? 1, limit: p.limit ?? 24, q: p.q, account: p.account });
}
export async function requestUpload(title: string, folderId: string = ROOT, account?: string): Promise<Result<UploadCredentials>> { return svc.uploadCredentials(title, folderId, account); }
export async function deleteVideo(id: string, account?: string): Promise<Result<boolean>> {
  const r = await svc.deleteVideo(id, account); return r.ok ? ok(true) : r;
}
export async function fetchPreviewOtp(id: string, account?: string): Promise<Result<{ otp: string; playbackInfo: string }>> { return svc.previewOtp(id, account); }
