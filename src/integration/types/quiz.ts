export interface Quiz {
  _id: string;
  id?: string; // For compatibility
  titleAr: string;
  titleEn: string;
  descriptionAr: string;
  descriptionEn: string;
  category: string;
  subcategory?: string;
  course: string;
  timeLimitMinutes: number;
  passingScore: number;
  numberOfAttempts: number;
  groups: string[];
  difficultyLevel: "beginner" | "intermediate" | "advanced";
  antiCheat: boolean;
  status: "published" | "not_published";
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  questions?: Question[];
}

export interface Choice {
  _id?: string;
  id?: string;
  text: string;
  isCorrect: boolean;
}

export interface Question {
  _id?: string;
  id?: string; // For compatibility
  prompt: string;
  type: 'single' | 'multiple' | 'true-false' | 'short-answer' | 'essay';
  choices: Choice[];
  points: number;
  explanation?: string;
}

export interface QuizAttempt {
  id: string;
  quizId: string;
  studentId: string;
  answers: Record<string, string | string[]>;
  score: number;
  isPassed: boolean;
  startedAt: string;
  completedAt?: string;
}

export interface QuizAttemptResult {
  _id: string;
  scorePct: number;
  passed: boolean;
  timeTakenSeconds: number;
  submittedAt: string;
  attemptsCount?: number;
}

export interface MyAttemptsResponse {
  latestAttempt: QuizAttemptResult | null;
  attemptsCount: number;
}

export interface QuizCategory {
  _id: string;
  name: string;
  quiz: string[] | Quiz[];
  createdAt: string;
  updatedAt: string;
}
