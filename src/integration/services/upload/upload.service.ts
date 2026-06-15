import { api, fail, ok, type Result } from "@integration/services/http/client";
import { API_UPLOAD_FILE } from "@integration/constants/api/upload";
import type { UploadFileResponse, UploadLang, UploadedFile } from "./types";

/**
 * Upload service — wraps the S3 upload endpoint.
 *
 * Auth: required.
 * Sends multipart/form-data with field name `file`. The optional `lang`
 * header narrows the response payload to a single locale.
 */

interface UploadOptions {
  lang?: UploadLang;
  /** Form field name. Defaults to "file" per the public API. */
  fieldName?: string;
}

function normalize(payload: UploadFileResponse | null): UploadedFile | null {
  if (!payload) return null;
  if (payload.file?.url) return payload.file;
  if (payload.data?.url) return payload.data;
  if (payload.url) return { url: payload.url };
  return null;
}

export async function uploadFile(
  file: File,
  options: UploadOptions = {}
): Promise<Result<UploadedFile>> {
  const { lang, fieldName = "file" } = options;

  const form = new FormData();
  form.append(fieldName, file);

  const headers: Record<string, string> = {};
  if (lang) headers.lang = lang;

  const result = await api.post<UploadFileResponse>(API_UPLOAD_FILE, form, {
    headers,
  });

  if (!result.ok) return result;

  const normalized = normalize(result.data);
  if (!normalized) return fail("Upload succeeded but response was malformed");
  return ok(normalized);
}
