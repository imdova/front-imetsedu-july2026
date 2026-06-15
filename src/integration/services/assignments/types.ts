export interface Assignment {
  _id: string;
  title: string;
  group?: any;
  lmsId?: any;
  dueDate: string;
  files: string[];
  priority: "urgent" | "regular";
  createdAt?: string;
  updatedAt?: string;
  kpis?: {
    totalSubmissions: number;
    totalStudents: number;
    submissionRate: number;
    avgGrade: number | null;
    avgTurnaroundHours: number | null;
    avgPlagiarismScore: number | null;
  };
  students?: Array<{
    student: {
      _id: string;
      name: string;
      email: string;
    };
    submission: {
      _id: string;
      assignmentFileUrl: string;
      notes: string;
      status: string;
      score: number | null;
      plagiarismScore: number | null;
      submissionDate: string;
    } | null;
  }>;
}

export interface AssignmentSubmission {
  _id: string;
  assignmentId?: {
    _id: string;
    title: string;
  } | string;
  studentId?: {
    _id: string;
    name: string;
    email: string;
  } | string;
  assignmentFileUrl: string;
  notes?: string;
  status: string;
  score: number | null;
  plagiarismScore: number | null;
  createdAt?: string;
  updatedAt?: string;
  submissionDate?: string;
}

export interface CreateAssignmentInput {
  title: string;
  group?: string;
  lmsId?: string;
  dueDate: string;
  files: string[];
  priority: string;
}

export interface AssignmentListResponse {
  data: Assignment[];
  meta?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
