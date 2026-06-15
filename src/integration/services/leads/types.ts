export type LeadPriority = "hot" | "warm" | "cold";
export type LeadGender = "male" | "female";

/* ── LeadData: structured sub-schemas stored in lead.data ─────────── */

export interface LeadFollowUp {
  id: string;
  date: string;        // ISO date (YYYY-MM-DD)
  note: string;
  status: "overdue" | "today" | "upcoming" | "done";
  createdAt: string;
}

export interface LeadPinnedNote {
  text: string;
  updatedAt: string;   // ISO datetime
}

export interface LeadInstallment {
  index: number;
  total: number;
  amount: number;
  dueDate?: string;
  paidDate?: string;
  status: "PAID" | "DUE" | "SCHEDULED";
  receiptRef?: string;
}

export interface LeadPaymentPlan {
  courses?: string[];           // course IDs or names
  totalAmount?: number;
  currency?: "EGP" | "SAR" | "USD";
  paymentMethod?: string;
  groupId?: string;
  groupName?: string;
  installments?: LeadInstallment[];
  status?: "PENDING" | "PARTIAL" | "PAID";
  createdAt?: string;
  receipts?: LeadReceipt[];
}

export interface LeadReceipt {
  id: string;
  scope: number | "general";
  name: string;
  size: number;
  type: string;
  previewUrl: string;    // uploaded file URL
  attachedAt: string;
}

export interface LeadData {
  followUps?: LeadFollowUp[];
  pinnedNote?: LeadPinnedNote;
  receipts?: LeadReceipt[];
  jobTitle?: string;
  leadStatusOption?: string;
  pipelineStage?: string;
  [key: string]: any;
}

/* ── Pipeline (populated from API) ──────────────────────────────────── */

export interface PipelineStage {
  name: string;
  key: string;
  order: number;
}

export interface LeadPipeline {
  _id: string;
  title: string;
  slug: string;
  stages: PipelineStage[];
}

/** Compact pipeline ref returned inside `lead.pipelines[]` */
export interface LeadPipelineRef {
  _id: string;
  title: string;
  slug: string;
  stage: string;
}

export interface LeadActivity {
  _id: string;
  action: string;
  performedAt: string;
}

/* ── Counselor (API may return populated object or plain ID string) ───── */
export interface CounselorRef {
  _id: string;
  name: string;
  email?: string;
}

/* ── Lead ────────────────────────────────────────────────────────────── */

export interface Lead {
  _id: string;
  fullName: string;
  email: string;
  phone: string;
  phoneCountryCode: string;
  whatsApp?: string;
  whatsAppCountryCode?: string;
  country?: string;
  specialty?: string;
  educationLevel?: string;
  source?: string;
  dateOfBirth?: string;
  gender?: LeadGender;
  coursesOfInterest?: string[];
  jobTitle?: string;
  /** Populated object when reading from API; plain ID string when writing */
  counselor?: string | CounselorRef | null;
  priority?: LeadPriority;
  score?: number;
  pipeline?: string | LeadPipeline;
  pipelines?: LeadPipelineRef[];
  stage?: string;
  estimatedValue?: number;
  tags?: string[];
  notes?: string | string[];
  data?: LeadData;
  activities?: LeadActivity[];
  isActive?: boolean;
  createdAt: string;
  updatedAt: string;
  // Allow for dynamic CRM variables
  [key: string]: any;
}

/* ── DTOs ────────────────────────────────────────────────────────────── */

export interface CreateLeadDto {
  fullName?: string;
  email?: string;
  phone?: string;
  phoneCountryCode?: string;
  whatsApp?: string;
  whatsAppCountryCode?: string;
  country?: string;
  specialty?: string;
  educationLevel?: string;
  source?: string;
  dateOfBirth?: string;
  gender?: LeadGender;
  coursesOfInterest?: string[];
  jobTitle?: string;
  counselor?: string;
  priority?: LeadPriority;
  score?: number;
  pipeline?: string;
  stage?: string;
  estimatedValue?: number;
  tags?: string[];
  courseInterestId?: string;
  courseInterestName?: string;
  courseInterest?: string;
  data?: LeadData;
  // Allow for dynamic CRM variables
  [key: string]: any;
}

export type UpdateLeadDto = Partial<CreateLeadDto>;
