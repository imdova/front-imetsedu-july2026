export interface GroupSchedule {
  zoomLink?: string;
  lectureDay?: string;
  startTime?: string;
  endTime?: string;
}

export interface GroupStudentInput {
  student: string; // student ID
  totalFee: number;
  paidAmount: number;
  progress: number;
  isCompleted: boolean;
}

export interface Group {
  _id: string;
  title: string;
  category: {
    _id: string;
    name: string;
  };
  subcategory?: {
    _id: string;
    name: string;
  };
  startDate: string;
  endDate: string;
  lmsCourses: any[];
  groupImages: string[];
  status: "pending" | "inprogress" | "finished" | "active" | "completed";
  numberOfStudents?: number;
  revenue?: number;
  createdAt: string;
  updatedAt: string;
  __v: number;
  revenueTarget?: number;
  enrolled?: number;
  completed?: number;
  avgProgress?: number;
  paidAmount?: number;
  remaining?: number;
  collected?: number;
  outstanding?: number;
  students?: any[];
  schedule?: GroupSchedule[];
}

export interface GroupListResponse {
  data: Group[];
  kpis: {
    totalGroups: number;
    pending: number;
    inProgress: number;
    finished: number;
    totalStudents: number;
    totalRevenue: number;
  };
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface CreateGroupInput {
  title: string;
  category: string;
  subcategory: string;
  startDate: string;
  endDate: string;
  lmsCourses: string[];
  groupImages: string[];
  status?: "pending" | "inprogress" | "finished" | "active" | "completed";
  schedule?: GroupSchedule[];
  students?: GroupStudentInput[];
}

export interface UpdateGroupInput {
  title?: string;
  category?: string;
  subcategory?: string;
  startDate?: string;
  endDate?: string;
  lmsCourses?: string[];
  groupImages?: string[];
  status?: "pending" | "inprogress" | "finished" | "active" | "completed";
  schedule?: GroupSchedule[];
  students?: GroupStudentInput[];
}
