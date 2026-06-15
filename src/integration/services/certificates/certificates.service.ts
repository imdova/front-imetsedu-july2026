import { api, type Result } from "@integration/services/http/client";

export interface Certificate {
  _id: string;
  certificateCode: string;
  studentName: string;
  leadId: {
    _id: string;
    fullName: string;
    email: string;
    phone?: string;
    data?: any;
  } | null;
  groupId: {
    _id: string;
    title: string;
  } | string | null;
  lmsId: {
    _id: string;
    title: string;
  } | string | null;
  studentId: string;
  certificateLink: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  createdBy?:
    | string
    | {
        _id?: string;
        fullName?: string;
        name?: string;
        email?: string;
      }
    | null;
  issuedBy?:
    | string
    | {
        _id?: string;
        fullName?: string;
        name?: string;
        email?: string;
      }
    | null;
  createdByUser?:
    | string
    | {
        _id?: string;
        fullName?: string;
        name?: string;
        email?: string;
      }
    | null;
  creator?:
    | string
    | {
        _id?: string;
        fullName?: string;
        name?: string;
        email?: string;
      }
    | null;
  issuer?:
    | string
    | {
        _id?: string;
        fullName?: string;
        name?: string;
        email?: string;
      }
    | null;
}

export interface CertificatesResponse {
  stats: {
    totalCertificates: number;
    issued: number;
  };
  data: Certificate[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export function listCertificates(params?: {
  page?: number;
  limit?: number;
  search?: string;
  groupId?: string;
  lmsId?: string;
}): Promise<Result<CertificatesResponse>> {
  return api.get<CertificatesResponse>("/certificates", { params });
}

export interface CreateCertificateInput {
  leadId: string;
  certificateLink: string;
  groupId?: string;
  lmsId?: string;
  certificateCode?: string;
}

export function createCertificate(input: CreateCertificateInput): Promise<Result<Certificate>> {
  return api.post<Certificate>("/certificates", input);
}

export function deleteCertificate(id: string): Promise<Result<void>> {
  return api.delete<void>(`/certificates/${id}`);
}

export function verifyCertificateByCode(code: string): Promise<Result<Certificate>> {
  return api.get<Certificate>(`/certificates/verify/${encodeURIComponent(code)}`, { requireAuth: false });
}
