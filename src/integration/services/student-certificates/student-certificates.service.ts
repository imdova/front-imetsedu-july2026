import { STUDENT_PORTAL } from "@integration/constants/api/student-portal";
import { api, fail, toMessage, type Result } from "@integration/services/http/client";
import { normalizeStudentCertificates } from "./normalize";
import type { StudentCertificatesApiResponse } from "./types";
import type { StudentCertificatesView } from "./view-models";

export async function getStudentCertificates(): Promise<
  Result<StudentCertificatesView>
> {
  const res = await api.get<
    StudentCertificatesApiResponse | { data?: StudentCertificatesApiResponse }
  >(STUDENT_PORTAL.CERTIFICATES);

  if (!res.ok) {
    return fail(
      typeof res.error === "string"
        ? res.error
        : "Failed to load certificates",
    );
  }

  try {
    return { ok: true, data: normalizeStudentCertificates(res.data) };
  } catch (err) {
    return fail(toMessage(err, "Failed to load certificates"));
  }
}
