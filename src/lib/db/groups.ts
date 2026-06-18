/**
 * Groups (learning cohorts) mock data — list rows, KPIs, and per-group detail
 * with roster + schedule. Self-contained; reached via lib/dal/groups.ts.
 */
import { respond, delay, clone } from "./delay";

export type GroupStatus = "pending" | "inprogress" | "finished";
export interface GroupRow {
  id: string;
  title: string;
  image: string;
  category: string;
  subcategory: string;
  createdAt: string;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  status: GroupStatus;
  students: number;
  revenue: number;
}

export interface GroupStats {
  total: number;
  pending: number;
  inprogress: number;
  finished: number;
  totalStudents: number;
  totalRevenue: number;
}

export type RosterStatus = "approved" | "pending";
export type RosterPayment = "pending" | "paid" | "partial";
export interface RosterStudent {
  id: string;
  name: string;
  email: string;
  phone: string;
  enrolledDate: string;
  country: string;
  leadSource: string;
  progress: number;
  status: RosterStatus;
  payment: RosterPayment;
  due: number;
}

export interface GroupDetail extends GroupRow {
  revenueTarget: number;
  collected: number;
  outstanding: number;
  zoomLink: string;
  lectureDay: string;
  assignedLms: number;
  roster: RosterStudent[];
  /** Raw ids/fields needed to pre-fill the edit-group form. */
  categoryId: string;
  subcategoryId: string;
  groupImages: string[];
  whatsappGroupLink: string;
  /** Raw ISO dates (startDate/endDate above are display-formatted). */
  startDateISO: string;
  endDateISO: string;
}

const groups: GroupRow[] = [
  { id: "grp_g42", title: "cphq - g42", image: "", category: "Healthcare", subcategory: "Healthcare Quality", createdAt: "Jun 14, 2026", startDate: "Jun 15, 2026", endDate: "Jun 30, 2026", startTime: "19:00", endTime: "21:00", status: "pending", students: 1, revenue: 0 },
];

const rosterByGroup: Record<string, RosterStudent[]> = {
  grp_g42: [
    { id: "rs_1", name: "Mostafa", email: "mostafa@gmail.com", phone: "888888888", enrolledDate: "Jun 14, 2026", country: "Bahrain", leadSource: "Whats app message", progress: 0, status: "approved", payment: "pending", due: 0 },
  ],
};

export const getGroups = () => respond(groups);

export async function getGroupStats(): Promise<GroupStats> {
  return respond({
    total: groups.length,
    pending: groups.filter((g) => g.status === "pending").length,
    inprogress: groups.filter((g) => g.status === "inprogress").length,
    finished: groups.filter((g) => g.status === "finished").length,
    totalStudents: groups.reduce((s, g) => s + g.students, 0),
    totalRevenue: groups.reduce((s, g) => s + g.revenue, 0),
  });
}

export async function getGroup(id: string): Promise<GroupDetail | null> {
  await delay(200);
  const g = groups.find((x) => x.id === id);
  if (!g) return null;
  const roster = rosterByGroup[g.id] ?? [];
  return clone({
    ...g,
    revenueTarget: 0,
    collected: 0,
    outstanding: 0,
    zoomLink: "",
    lectureDay: "TBD",
    assignedLms: 1,
    roster,
    categoryId: "",
    subcategoryId: "",
    groupImages: g.image ? [g.image] : [],
    whatsappGroupLink: "",
    startDateISO: "",
    endDateISO: "",
  });
}
