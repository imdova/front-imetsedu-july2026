/**
 * Students-management data module (self-contained): the enriched enrolled-student
 * directory backing the admin "Students Management" screen — country, gender,
 * specialty, lead source, sales agent, assigned group, payment status, totals.
 */
import { respond } from "./delay";

export type SmPayment = "paid" | "partial" | "pending" | "unpaid";
export type SmGender = "male" | "female" | "unspecified";

export interface SmStudent {
  id: string;
  name: string;
  email: string;
  phone: string;
  country: string;
  gender: SmGender;
  specialty: string;
  leadSource: string;
  salesAgent: string | null;
  assignedGroup: string | null;
  payment: SmPayment;
  totalAmount: number | null;
  certificates: number;
  joinedAt: string; // ISO
  initials: string;
}

export interface SmStats {
  total: number;
  inGroups: number;
  newThisMonth: number;
  certificates: number;
}

const initialsOf = (n: string) => n.split(" ").filter(Boolean).slice(0, 2).map((w) => w[0]?.toUpperCase()).join("");

const SEED: Array<Omit<SmStudent, "id" | "initials">> = [
  { name: "Mostafa", email: "mostafa@gmail.com", phone: "888888888", country: "Bahrain", gender: "unspecified", specialty: "Dentist", leadSource: "Whats app message", salesAgent: null, assignedGroup: "cphq - g42", payment: "pending", totalAmount: null, certificates: 0, joinedAt: "2026-06-14" },
  { name: "Layla Hassan", email: "layla.h@example.com", phone: "+20 100 222 1188", country: "Egypt", gender: "female", specialty: "Pharmacist", leadSource: "Facebook Ads", salesAgent: "Karim El-Sayed", assignedGroup: "cphq - g42", payment: "paid", totalAmount: 9900, certificates: 1, joinedAt: "2026-06-09" },
  { name: "Omar Khaled", email: "omar.k@example.com", phone: "+971 55 330 1190", country: "UAE", gender: "male", specialty: "Physician", leadSource: "Google Ads", salesAgent: "Mona Rashad", assignedGroup: "cnm - g11", payment: "partial", totalAmount: 12000, certificates: 0, joinedAt: "2026-06-02" },
  { name: "Fatima Saleh", email: "fatima.s@example.com", phone: "+966 50 884 2210", country: "Saudi Arabia", gender: "female", specialty: "Nurse", leadSource: "Whats app message", salesAgent: "Karim El-Sayed", assignedGroup: null, payment: "unpaid", totalAmount: 8400, certificates: 0, joinedAt: "2026-05-28" },
  { name: "Yousef Rashad", email: "yousef.r@example.com", phone: "+20 111 555 7723", country: "Egypt", gender: "male", specialty: "Dentist", leadSource: "Referral", salesAgent: "Mona Rashad", assignedGroup: "cphq - g42", payment: "paid", totalAmount: 9900, certificates: 2, joinedAt: "2026-05-20" },
  { name: "Mariam Awad", email: "mariam.a@example.com", phone: "+965 600 11 224", country: "Kuwait", gender: "female", specialty: "Lab Specialist", leadSource: "Instagram", salesAgent: null, assignedGroup: null, payment: "pending", totalAmount: 6200, certificates: 0, joinedAt: "2026-04-30" },
  { name: "Khalid Mansour", email: "khalid.m@example.com", phone: "+974 33 220 118", country: "Qatar", gender: "male", specialty: "Physician", leadSource: "Facebook Ads", salesAgent: "Karim El-Sayed", assignedGroup: "cnm - g11", payment: "paid", totalAmount: 11000, certificates: 1, joinedAt: "2026-03-18" },
  { name: "Nour Adel", email: "nour.a@example.com", phone: "+20 122 909 4471", country: "Egypt", gender: "female", specialty: "Pharmacist", leadSource: "Organic Search", salesAgent: "Mona Rashad", assignedGroup: "cphq - g42", payment: "partial", totalAmount: 9900, certificates: 0, joinedAt: "2026-02-11" },
];

const students: SmStudent[] = SEED.map((s, i) => ({ ...s, id: `sm_${i}`, initials: initialsOf(s.name) }));

export const getStudents = () => respond(students);

export function getStats(): Promise<SmStats> {
  // "This month" = June 2026 in the seeded clock.
  const total = students.length;
  const inGroups = students.filter((s) => s.assignedGroup).length;
  const newThisMonth = students.filter((s) => s.joinedAt.startsWith("2026-06")).length;
  const certificates = students.reduce((n, s) => n + s.certificates, 0);
  return respond<SmStats>({ total, inGroups, newThisMonth, certificates });
}
