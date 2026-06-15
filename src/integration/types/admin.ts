export interface AdminStats {
  allStudents: number;
  enrolledStudents: number;
  activeCourses: number;
  certificatesEarned: number;
  activeInstructors: number;
  totalSales: number;
  activeAcademies: number;
  netProfit: number;
}

export interface SalesData {
  date: string;
  courses: number;
  students: number;
  instructors: number;
  academies: number;
  sales: number;
}

export interface TopCourse {
  id: string;
  title: string;
  instructor: string;
  instructorImage?: string;
  image: string;
  ranking: number;
  enrollments: number;
  revenue: number;
}

export interface TopInstructor {
  id: string;
  name: string;
  image?: string;
  courses: number;
  enrolledStudents: number;
  reviews: number;
  ranking: number;
}

export interface CountryData {
  country: string;
  code: string;
  students: number;
  enrollments: number;
  percentage: number;
}
