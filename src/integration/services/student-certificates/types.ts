export interface StudentCertificateGroupRef {
  _id?: string;
  title?: string;
}

export interface StudentCertificateRecord {
  _id: string;
  certificateCode?: string;
  studentName?: string;
  leadId?: string;
  groupId?: string | StudentCertificateGroupRef | null;
  lmsId?: string | StudentCertificateGroupRef | null;
  studentId?: string | null;
  certificateLink?: string;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface StudentCertificatesApiResponse {
  kpis?: {
    totalCertificates?: number;
    latestAchievement?: {
      studentName?: string;
      certificateCode?: string;
      issuedAt?: string;
    } | null;
  };
  data?: StudentCertificateRecord[];
}
