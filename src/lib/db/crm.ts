/**
 * CRM seed + CRUD: leads, the default pipeline/stages, counselors, activities,
 * follow-ups and dashboard rollups. Lead scores/priorities are computed with the
 * shared scoring engine so the data honours the Business Rules Catalog.
 */
import { createId } from "@/lib/utils";
import { scoreLead, type LeadPriority } from "@/lib/crm/scoring";
import { clone, delay, respond } from "./delay";

export interface PipelineStage {
  key: string;
  name: string;
  order: number;
}

export interface Pipeline {
  id: string;
  title: string;
  slug: string;
  stages: PipelineStage[];
}

export interface Counselor {
  id: string;
  name: string;
  initials: string;
}

export type ActivityKind = "call" | "whatsapp" | "email" | "note" | "stage" | "form";
export interface LeadActivity {
  id: string;
  kind: ActivityKind;
  text: string;
  ago: string;
}

export type FollowUpStatus = "overdue" | "today" | "upcoming" | "done";
export interface FollowUp {
  id: string;
  note: string;
  date: string; // human label
  status: FollowUpStatus;
}

export type PlanInstallmentStatus = "PAID" | "UPCOMING" | "DUE";
export interface PlanInstallment {
  index: number;
  label: string;
  amount: number;
  dueDate: string;
  status: PlanInstallmentStatus;
  receiptUrl?: string;
}

export interface PaymentPlanSummary {
  courseName: string;
  totalAmount: number;
  currency: "EGP" | "SAR" | "USD";
  paid: number;
  status: "PENDING" | "PARTIAL" | "PAID";
  method?: string;
  durationMonths?: number;
  installments: PlanInstallment[];
}

export interface Lead {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  phoneCountryCode: string;
  whatsApp?: string;
  country: string;
  specialty?: string;
  educationLevel?: string;
  source: string;
  gender?: "male" | "female";
  coursesOfInterest: string[];
  jobTitle?: string;
  counselorId: string;
  counselorName: string;
  priority: LeadPriority;
  score: number;
  stageKey: string;
  createdAt: string;
  /** Raw ISO timestamp (for client-side date-range filtering). */
  createdAtISO?: string;
  /** Title of the lead's primary pipeline (e.g. "CPHQ 2"), for the list badge. */
  pipelineName?: string;
  lastActivity: string;
  pinnedNote?: string;
  activities: LeadActivity[];
  followUps: FollowUp[];
  paymentPlan?: PaymentPlanSummary;
  /** Recruitment pipelines this lead belongs to. */
  assignedPipelineIds: string[];
  /** Per-pipeline membership with the lead's current backend stage key in each. */
  pipelines?: { id: string; title: string; stage: string }[];
}

export const DEFAULT_PIPELINE: Pipeline = {
  id: "pl_default",
  title: "Admissions",
  slug: "admissions",
  stages: [
    { key: "new", name: "New Inquiries", order: 0 },
    { key: "contacted", name: "Contacted and Qualified", order: 1 },
    { key: "waiting_payment", name: "Waiting for Payment", order: 2 },
    { key: "enrolled", name: "Enrolled", order: 3 },
    { key: "lost", name: "Lost", order: 4 },
  ],
};

export const COUNSELORS: Counselor[] = [
  { id: "co_karim", name: "Karim El-Sayed", initials: "KE" },
  { id: "co_mona", name: "Mona Rashad", initials: "MR" },
  { id: "co_tarek", name: "Tarek Mansour", initials: "TM" },
  { id: "co_sara", name: "Sara Adel", initials: "SA" },
];

export const SOURCES = ["Facebook", "Google", "Referral", "Career Fair", "Website", "WhatsApp"];
export const COUNTRIES = ["SA", "AE", "EG", "QA", "KW", "OM"];
export const SPECIALTIES = ["Finance", "Marketing", "Human Resources", "Operations", "Strategy", "Project Management"];
export const EDUCATION_LEVELS = ["Bachelor", "Master", "MBA", "PhD", "Diploma"];
export const COURSE_OPTIONS = [
  "Advanced Financial Modeling",
  "Digital Marketing Strategy",
  "PMP Certification Prep",
  "Executive Leadership Essentials",
  "Strategic Human Resources",
  "Business Data Analytics",
];

const FIRST = ["Ahmed", "Layla", "Omar", "Fatima", "Yousef", "Mariam", "Khalid", "Nour", "Hassan", "Sara", "Tariq", "Huda", "Bilal", "Rana", "Sami", "Dina"];
const LAST = ["Al-Otaibi", "Habib", "Mansour", "Saleh", "Rashad", "Al-Mutairi", "Hassan", "Awad", "Fathy", "Adel"];
const JOB_TITLES = [
  "Finance Manager", "Marketing Director", "Senior Analyst", "HR Coordinator",
  "Accountant", "Operations Lead", "Project Manager", "Consultant",
  "Business Analyst", "Sales Executive", "Head of Strategy", "Specialist",
];
const STAGE_FLOW = ["new", "contacted", "waiting_payment", "enrolled", "lost"];

function buildLead(i: number): Lead {
  const first = FIRST[i % FIRST.length];
  const last = LAST[(i * 3) % LAST.length];
  const fullName = `${first} ${last}`;
  const email = `${first.toLowerCase()}.${last.toLowerCase().replace(/[^a-z]/g, "")}@example.com`;
  const country = COUNTRIES[i % COUNTRIES.length];
  const specialty = SPECIALTIES[i % SPECIALTIES.length];
  const educationLevel = EDUCATION_LEVELS[i % EDUCATION_LEVELS.length];
  const jobTitle = JOB_TITLES[i % JOB_TITLES.length];
  const courses = COURSE_OPTIONS.slice(0, (i % 3) + 1);
  const counselor = COUNSELORS[i % COUNSELORS.length];
  const stageKey = STAGE_FLOW[i % STAGE_FLOW.length];
  const phone = `5${(10000000 + i * 137).toString().slice(0, 8)}`;

  const { score, priority } = scoreLead({
    email,
    phone,
    coursesOfInterest: courses,
    jobTitle,
    educationLevel,
    country,
    specialty,
  });

  const fuStatus: FollowUpStatus =
    (["overdue", "today", "upcoming", "done"] as FollowUpStatus[])[i % 4];

  const stagePaid = stageKey === "enrolled";
  const stageWaiting = stageKey === "waiting_payment";

  const defaultPlan: PaymentPlanSummary | undefined =
    stagePaid || stageWaiting
      ? {
          courseName: courses[0] ?? "Healthcare Quality Management Diploma",
          totalAmount: 9900,
          currency: "EGP",
          paid: stagePaid ? 9900 : 3300,
          status: stagePaid ? "PAID" : "PARTIAL",
          method: "Vodafone Cash",
          installments: [
            {
              index: 1,
              label: "Enrollment fee",
              amount: 4950,
              dueDate: "Jun 13, 2026",
              status: stagePaid ? "PAID" : "DUE",
            },
            {
              index: 2,
              label: "Final installment",
              amount: 4950,
              dueDate: "Jul 13, 2026",
              status: stagePaid ? "PAID" : "UPCOMING",
            },
          ],
        }
      : undefined;

  const leadZeroPlan: PaymentPlanSummary = {
    courseName: "CPHQ Preparation",
    totalAmount: 1200,
    currency: "EGP",
    paid: 600,
    status: "PARTIAL",
    method: "Vodafone Cash",
    durationMonths: 1,
    installments: [
      {
        index: 1,
        label: "Enrollment fee",
        amount: 600,
        dueDate: "Jun 14, 2026",
        status: "PAID",
        receiptUrl:
          "https://images.unsplash.com/photo-1554224311-beee415c201f?w=80&h=80&fit=crop",
      },
      {
        index: 2,
        label: "Final installment",
        amount: 600,
        dueDate: "Jun 23, 2026",
        status: "UPCOMING",
      },
    ],
  };

  return {
    id: `lead_${i}`,
    fullName,
    email,
    phone,
    phoneCountryCode: "+966",
    whatsApp: phone,
    country,
    specialty,
    educationLevel,
    source: SOURCES[i % SOURCES.length],
    gender: i % 2 === 0 ? "male" : "female",
    coursesOfInterest: courses,
    jobTitle,
    counselorId: counselor.id,
    counselorName: counselor.name,
    priority,
    score,
    stageKey,
    createdAt: `${(i % 28) + 1} days ago`,
    lastActivity: ["2h ago", "yesterday", "3 days ago", "1h ago"][i % 4],
    pinnedNote: i % 3 === 0 ? "Prefers WhatsApp contact in the evening." : undefined,
    activities: [
      { id: createId("act"), kind: "form", text: `Submitted interest via ${SOURCES[i % SOURCES.length]}`, ago: `${(i % 28) + 1} days ago` },
      { id: createId("act"), kind: "call", text: "Outbound call — discussed program options", ago: "3 days ago" },
      { id: createId("act"), kind: "whatsapp", text: "Sent course brochure on WhatsApp", ago: "2 days ago" },
      { id: createId("act"), kind: "stage", text: `Moved to ${DEFAULT_PIPELINE.stages.find((s) => s.key === stageKey)?.name}`, ago: "yesterday" },
    ],
    followUps: [
      { id: createId("fu"), note: "Call back to confirm payment plan", date: "Today 4:00 PM", status: fuStatus },
    ],
    paymentPlan: i === 0 ? leadZeroPlan : defaultPlan,
    assignedPipelineIds: i === 0 ? ["pl_cphq2"] : [],
  };
}

let leads: Lead[] = Array.from({ length: 16 }, (_, i) => buildLead(i));

export interface LeadFilters {
  search?: string;
  stage?: string;
  source?: string;
  counselorId?: string;
  priority?: string;
  /** Pipeline id (server-side). */
  pipeline?: string;
  /** Date-range token, e.g. "today" | "7_days" | "month" | "year" (server-side). */
  dateRange?: string;
  /** Client-side only (backend has no query support for these). */
  specialty?: string;
  country?: string;
  courseId?: string;
}

export async function getLeads(filters: LeadFilters = {}): Promise<Lead[]> {
  await delay();
  let rows = clone(leads);
  if (filters.search) {
    const q = filters.search.toLowerCase();
    rows = rows.filter(
      (l) =>
        l.fullName.toLowerCase().includes(q) ||
        l.email.toLowerCase().includes(q) ||
        l.phone.includes(filters.search ?? ""),
    );
  }
  if (filters.stage && filters.stage !== "all") rows = rows.filter((l) => l.stageKey === filters.stage);
  if (filters.source && filters.source !== "all") rows = rows.filter((l) => l.source === filters.source);
  if (filters.counselorId && filters.counselorId !== "all") rows = rows.filter((l) => l.counselorId === filters.counselorId);
  if (filters.priority && filters.priority !== "all") rows = rows.filter((l) => l.priority === filters.priority);
  return rows;
}

export async function getLeadById(id: string): Promise<Lead | null> {
  await delay(200);
  const found = leads.find((l) => l.id === id);
  return found ? clone(found) : null;
}

export async function checkPhone(phone: string): Promise<Lead | null> {
  await delay(150);
  const digits = phone.replace(/\D/g, "");
  const found = leads.find((l) => l.phone.replace(/\D/g, "") === digits);
  return found ? clone(found) : null;
}

export interface CreateLeadInput {
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
  jobTitle?: string;
  coursesOfInterest?: string[];
  counselorId?: string;
  gender?: "male" | "female";
  dateOfBirth?: string;
  /** Lead temperature → backend `priority`. */
  leadType?: "cold" | "warm" | "hot";
  /** Pipeline id the lead is dropped into on creation (optional). */
  targetPipeline?: string;
}

export async function createLead(input: CreateLeadInput): Promise<Lead> {
  await delay(400);
  const { score, priority } = scoreLead(input);
  const counselor = COUNSELORS.find((c) => c.id === input.counselorId) ?? COUNSELORS[0];
  const lead: Lead = {
    id: createId("lead"),
    fullName: input.fullName,
    email: input.email,
    phone: input.phone,
    phoneCountryCode: input.phoneCountryCode,
    whatsApp: input.whatsApp,
    country: input.country ?? "",
    specialty: input.specialty,
    educationLevel: input.educationLevel,
    source: input.source ?? "Website",
    gender: input.gender,
    coursesOfInterest: input.coursesOfInterest ?? [],
    jobTitle: input.jobTitle,
    counselorId: counselor.id,
    counselorName: counselor.name,
    priority,
    score,
    stageKey: "new",
    createdAt: "just now",
    lastActivity: "just now",
    activities: [{ id: createId("act"), kind: "form", text: "Lead created", ago: "just now" }],
    followUps: [],
    assignedPipelineIds: [],
  };
  leads = [lead, ...leads];
  return clone(lead);
}

export async function updateLeadStage(id: string, stageKey: string): Promise<Lead | null> {
  await delay(150);
  const idx = leads.findIndex((l) => l.id === id);
  if (idx === -1) return null;
  const stageName = DEFAULT_PIPELINE.stages.find((s) => s.key === stageKey)?.name ?? stageKey;
  leads[idx] = {
    ...leads[idx],
    stageKey,
    lastActivity: "just now",
    activities: [
      { id: createId("act"), kind: "stage", text: `Moved to ${stageName}`, ago: "just now" },
      ...leads[idx].activities,
    ],
  };
  return clone(leads[idx]);
}

export const getPipeline = () => respond(DEFAULT_PIPELINE);
export const getCounselors = () => respond(COUNSELORS);

/* ── Pipelines inventory (All Pipelines page + board pipeline selector) ── */
export interface PipelineSummary {
  id: string;
  title: string;
  source: string;
  createdAt: string;
  leads: number;
  enrollments: number;
  revenue: number;
  currency: "EGP";
  conversion: number; // %
  archived: boolean;
}

const pipelineInventory: PipelineSummary[] = [
  { id: "pl_qwj", title: "Quality Workshops June, 2026 - G42", source: "Custom", createdAt: "Jun 13, 2026", leads: 8, enrollments: 7, revenue: 56400, currency: "EGP", conversion: 88, archived: false },
  { id: "pl_qw", title: "Quality Workshops", source: "Custom", createdAt: "Jun 10, 2026", leads: 3, enrollments: 1, revenue: 8000, currency: "EGP", conversion: 33, archived: false },
  { id: "pl_ic", title: "Infection Control", source: "Custom", createdAt: "Jun 7, 2026", leads: 2, enrollments: 1, revenue: 15000, currency: "EGP", conversion: 50, archived: false },
  { id: "pl_cic", title: "CIC", source: "Custom", createdAt: "Jun 7, 2026", leads: 3, enrollments: 0, revenue: 0, currency: "EGP", conversion: 0, archived: false },
  { id: "pl_cphq2", title: "CPHQ 2", source: "Custom", createdAt: "Jun 7, 2026", leads: 7, enrollments: 2, revenue: 1012, currency: "EGP", conversion: 29, archived: false },
  { id: "pl_legacy", title: "Legacy Intake 2025", source: "Import", createdAt: "Dec 1, 2025", leads: 0, enrollments: 0, revenue: 0, currency: "EGP", conversion: 0, archived: true },
];

export const getPipelineInventory = () => respond(pipelineInventory);

export interface PipelineInventoryStats {
  totalPipelines: number;
  activePipelines: number;
  totalLeads: number;
  totalEnrollments: number;
  totalRevenue: number;
  avgConversion: number;
}

export async function getPipelineInventoryStats(): Promise<PipelineInventoryStats> {
  const active = pipelineInventory.filter((p) => !p.archived);
  const totalLeads = pipelineInventory.reduce((s, p) => s + p.leads, 0);
  const totalEnrollments = pipelineInventory.reduce((s, p) => s + p.enrollments, 0);
  const totalRevenue = pipelineInventory.reduce((s, p) => s + p.revenue, 0);
  const avgConversion = active.length
    ? Math.round(active.reduce((s, p) => s + p.conversion, 0) / active.length)
    : 0;
  return respond({
    totalPipelines: pipelineInventory.length,
    activePipelines: active.length,
    totalLeads,
    totalEnrollments,
    totalRevenue,
    avgConversion,
  });
}

export interface CrmStats {
  totalLeads: number;
  newThisWeek: number;
  conversionRate: number;
  pipelineValue: number;
  byStage: { key: string; name: string; count: number }[];
  bySource: { source: string; count: number }[];
  byCounselor: { name: string; initials: string; leads: number; conversion: number }[];
  overdueFollowUps: number;
}

export async function getCrmStats(): Promise<CrmStats> {
  await delay();
  const snapshot = clone(leads);
  const enrolled = snapshot.filter((l) => l.stageKey === "enrolled").length;
  const byStage = DEFAULT_PIPELINE.stages.map((s) => ({
    key: s.key,
    name: s.name,
    count: snapshot.filter((l) => l.stageKey === s.key).length,
  }));
  const bySource = SOURCES.map((source) => ({
    source,
    count: snapshot.filter((l) => l.source === source).length,
  }));
  const byCounselor = COUNSELORS.map((c) => {
    const own = snapshot.filter((l) => l.counselorId === c.id);
    const conv = own.filter((l) => l.stageKey === "enrolled").length;
    return {
      name: c.name,
      initials: c.initials,
      leads: own.length,
      conversion: own.length ? Math.round((conv / own.length) * 100) : 0,
    };
  });
  return {
    totalLeads: snapshot.length,
    newThisWeek: snapshot.filter((l) => l.stageKey === "new").length,
    conversionRate: snapshot.length ? Math.round((enrolled / snapshot.length) * 100) : 0,
    pipelineValue: snapshot.filter((l) => l.stageKey !== "lost" && l.stageKey !== "enrolled").length * 9900,
    byStage,
    bySource,
    byCounselor,
    overdueFollowUps: snapshot.filter((l) => l.followUps.some((f) => f.status === "overdue")).length,
  };
}
