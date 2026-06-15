export interface CourseStats {
  totalCourses: number;
  published: number;
  unpublished: number;
  draft: number;
  totalEnrollment: number;
  totalRevenue: number;
  totalPurchases: number;
}

export interface CourseRegistrationItem {
  _id: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  studentPhone?: string;
  studentImage?: string;
  country: string;
  specialty?: string;
  groupId?: string;
  groupTitle?: string;
  salesAgent?: string;
  courses?: any[];
  totalFee: number;
  paidAmount: number;
  progress: number;
  isCompleted: boolean;
  registeredAt: string;
  groupStatus: string;
}

export interface CourseRegistrationsResponse {
  data: CourseRegistrationItem[];
  kpis: {
    totalRegistrations: number;
    active: number;
    completed: number;
    newThisMonth: number;
    collected: number;
    outstanding: number;
  };
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}



