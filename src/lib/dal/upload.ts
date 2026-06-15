/**
 * Upload DAL — thin wrapper over the integration upload service so UI code
 * imports from `dal.upload` like every other domain (and we keep one swap seam).
 */
import { type Result } from "@integration/lib/api-client";
import * as uploadSvc from "@integration/services/upload";
import type { UploadedFile, UploadLang } from "@integration/services/upload";

export type { UploadedFile };

/** Upload any file (image or document) and resolve to the stored CDN URL. */
export const uploadFile = (
  file: File,
  options: { lang?: UploadLang } = {},
): Promise<Result<UploadedFile>> => uploadSvc.uploadFile(file, options);
