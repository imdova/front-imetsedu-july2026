/**
 * Dashboard seed: headline stats, a monthly sales series for the chart, and a
 * "needs attention" task list used by the drag-and-drop board on the dashboard.
 */
import type { AdminStats, SalesData } from "@/types";
import { respond } from "./delay";

export interface DashboardTask {
  id: string;
  title: string;
  course: string;
  priority: "low" | "medium" | "high";
  assignee: string;
}

export type BoardColumnId = "backlog" | "in-review" | "ready";

export interface BoardColumn {
  id: BoardColumnId;
  title: string;
  taskIds: string[];
}

const stats: AdminStats = {
  allStudents: 18420,
  enrolledStudents: 12380,
  activeCourses: 64,
  certificatesEarned: 5240,
  activeInstructors: 38,
  totalSales: 4820000,
  activeAcademies: 6,
  netProfit: 1960000,
};

const salesSeries: SalesData[] = [
  { date: "Jan", courses: 6, students: 820, instructors: 3, academies: 1, sales: 286000 },
  { date: "Feb", courses: 8, students: 980, instructors: 2, academies: 0, sales: 312000 },
  { date: "Mar", courses: 5, students: 1180, instructors: 4, academies: 1, sales: 398000 },
  { date: "Apr", courses: 9, students: 1340, instructors: 3, academies: 0, sales: 442000 },
  { date: "May", courses: 11, students: 1620, instructors: 5, academies: 2, sales: 528000 },
  { date: "Jun", courses: 7, students: 1490, instructors: 2, academies: 1, sales: 496000 },
];

const tasks: DashboardTask[] = [
  { id: "tsk_1", title: "Record Module 4 videos", course: "Advanced Financial Modeling", priority: "high", assignee: "Karim E." },
  { id: "tsk_2", title: "Translate landing copy to Arabic", course: "Digital Marketing Strategy", priority: "medium", assignee: "Mona R." },
  { id: "tsk_3", title: "Review final quiz questions", course: "PMP Certification Prep", priority: "high", assignee: "Tarek M." },
  { id: "tsk_4", title: "Upload course cover (1280×720)", course: "Strategic HR", priority: "low", assignee: "Sara A." },
  { id: "tsk_5", title: "Set SAR & USD pricing", course: "Investment & Portfolio", priority: "medium", assignee: "Karim E." },
  { id: "tsk_6", title: "Publish to storefront", course: "Agile & Scrum Mastery", priority: "low", assignee: "Tarek M." },
];

const board: BoardColumn[] = [
  { id: "backlog", title: "Backlog", taskIds: ["tsk_1", "tsk_5"] },
  { id: "in-review", title: "In Review", taskIds: ["tsk_2", "tsk_3"] },
  { id: "ready", title: "Ready to Publish", taskIds: ["tsk_4", "tsk_6"] },
];

export const getAdminStats = () => respond(stats);
export const getSalesSeries = () => respond(salesSeries);
export const getDashboardTasks = () => respond(tasks);
export const getDashboardBoard = () => respond(board);
