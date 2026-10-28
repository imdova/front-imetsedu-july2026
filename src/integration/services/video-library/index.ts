import { api, type Result } from "@integration/services/http/client";

const BASE = "/admin/video-library";

export interface VlFolderDto { id: string; name: string; parent: string | null; videosCount: number; foldersCount: number }
export interface VlFolderViewDto {
  current: { id: string; name: string } | null;
  folders: VlFolderDto[];
  /** Ancestors + the current folder, top → bottom (empty at the root). */
  path: { id: string; name: string }[];
}
export interface VlVideoDto { id: string; title: string; status: string; length: number; uploadTime: number; poster: string }
export interface VlVideosDto { count: number; rows: VlVideoDto[] }

/** What the browser needs to POST a file straight to VdoCipher's storage. */
export interface VlUploadCredentialsDto { videoId: string; clientPayload: Record<string, string> & { uploadLink: string } }

export const getFolder = (id: string): Promise<Result<VlFolderViewDto>> => api.get(`${BASE}/folders/${encodeURIComponent(id)}`, { revalidate: false });
export const createFolder = (name: string, parent: string): Promise<Result<VlFolderDto>> => api.post(`${BASE}/folders`, { name, parent });
export const renameFolder = (id: string, name: string): Promise<Result<{ success: boolean }>> => api.patch(`${BASE}/folders/${encodeURIComponent(id)}`, { name });
export const deleteFolder = (id: string): Promise<Result<{ success: boolean }>> => api.delete(`${BASE}/folders/${encodeURIComponent(id)}`);

export const listVideos = (p: { folderId: string; page: number; limit: number; q?: string }): Promise<Result<VlVideosDto>> => {
  const qs = new URLSearchParams({ folderId: p.folderId, page: String(p.page), limit: String(p.limit) });
  if (p.q) qs.set("q", p.q);
  return api.get(`${BASE}/videos?${qs.toString()}`, { revalidate: false });
};
export const uploadCredentials = (title: string, folderId: string): Promise<Result<VlUploadCredentialsDto>> => api.post(`${BASE}/uploads`, { title, folderId });
export const deleteVideo = (id: string): Promise<Result<{ success: boolean }>> => api.delete(`${BASE}/videos/${encodeURIComponent(id)}`);
export const previewOtp = (id: string): Promise<Result<{ otp: string; playbackInfo: string }>> => api.post(`${BASE}/videos/${encodeURIComponent(id)}/otp`, {});
