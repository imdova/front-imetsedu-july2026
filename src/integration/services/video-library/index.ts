import { api, type Result } from "@integration/services/http/client";

const BASE = "/admin/video-library";

/** `?account=<id>` — which VdoCipher account a call acts on (omitted = the first configured one). */
const acct = (account?: string, sep: "?" | "&" = "?") => (account ? `${sep}account=${encodeURIComponent(account)}` : "");

/** A configured VdoCipher account. The secret itself never leaves the server — only a masked hint. */
export interface VlAccountDto { id: string; label: string; builtin: boolean; secretHint: string }

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

export const listAccounts = (): Promise<Result<VlAccountDto[]>> => api.get(`${BASE}/accounts`, { revalidate: false });
export const createAccount = (label: string, secret: string): Promise<Result<VlAccountDto>> => api.post(`${BASE}/accounts`, { label, secret });
export const updateAccount = (id: string, patch: { label?: string; secret?: string }): Promise<Result<VlAccountDto>> => api.patch(`${BASE}/accounts/${encodeURIComponent(id)}`, patch);
export const deleteAccount = (id: string): Promise<Result<{ success: boolean }>> => api.delete(`${BASE}/accounts/${encodeURIComponent(id)}`);

export const getFolder = (id: string, account?: string): Promise<Result<VlFolderViewDto>> => api.get(`${BASE}/folders/${encodeURIComponent(id)}${acct(account)}`, { revalidate: false });
export const createFolder = (name: string, parent: string, account?: string): Promise<Result<VlFolderDto>> => api.post(`${BASE}/folders${acct(account)}`, { name, parent });
export const renameFolder = (id: string, name: string, account?: string): Promise<Result<{ success: boolean }>> => api.patch(`${BASE}/folders/${encodeURIComponent(id)}${acct(account)}`, { name });
export const deleteFolder = (id: string, account?: string): Promise<Result<{ success: boolean }>> => api.delete(`${BASE}/folders/${encodeURIComponent(id)}${acct(account)}`);

export const listVideos = (p: { folderId: string; page: number; limit: number; q?: string; account?: string }): Promise<Result<VlVideosDto>> => {
  const qs = new URLSearchParams({ folderId: p.folderId, page: String(p.page), limit: String(p.limit) });
  if (p.q) qs.set("q", p.q);
  if (p.account) qs.set("account", p.account);
  return api.get(`${BASE}/videos?${qs.toString()}`, { revalidate: false });
};
export const uploadCredentials = (title: string, folderId: string, account?: string): Promise<Result<VlUploadCredentialsDto>> => api.post(`${BASE}/uploads${acct(account)}`, { title, folderId });
export const deleteVideo = (id: string, account?: string): Promise<Result<{ success: boolean }>> => api.delete(`${BASE}/videos/${encodeURIComponent(id)}${acct(account)}`);
export const previewOtp = (id: string, account?: string): Promise<Result<{ otp: string; playbackInfo: string }>> => api.post(`${BASE}/videos/${encodeURIComponent(id)}/otp${acct(account)}`, {});
