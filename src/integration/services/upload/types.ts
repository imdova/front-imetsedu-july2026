/**
 * Upload service contracts.
 */

export type UploadLang = "ar" | "en";

export interface UploadedFile {
  url: string;
  key?: string;
  filename?: string;
  mimetype?: string;
  size?: number;
}

export interface UploadFileResponse {
  file?: UploadedFile;
  url?: string;
  data?: UploadedFile;
  [key: string]: unknown;
}
