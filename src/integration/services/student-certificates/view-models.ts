export interface StudentCertificateItem {
  id: string;
  title: string;
  issuedDate: string;
  certificateId: string;
  lmsId?: string;
  groupId?: string;
  certificateLink?: string;
  verifyUrl: string;
  recipientName?: string;
  status: "completed" | "in_progress";
  progressPercent?: number;
  description?: string;
  modulesPassed?: string;
  capstoneStatus?: string;
  courseId?: string;
}

export interface StudentCertificatesView {
  totalEarned: number;
  addedThisMonth: number;
  latestAchievement: {
    title: string;
    issuedDate: string;
  } | null;
  certificates: StudentCertificateItem[];
}
