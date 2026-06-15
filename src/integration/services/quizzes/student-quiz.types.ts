export interface QuizQuestion {
  id: string;
  type: "multiple_choice";
  question: string;
  options: string[];
  optionIds: string[];
  correctIndex: number;
  learningInsight?: string;
  points?: number;
}

export interface QuizAttemptData {
  quizId: string;
  courseId: string;
  title: string;
  orientationTitle?: string;
  moduleLabel?: string;
  orientationDescription?: string;
  feedbackTitle?: string;
  totalQuestions: number;
  timeLimitMinutes: number;
  passingPct?: number;
  numberOfAttempts?: number;
  difficultyLevel?: string;
  questions: QuizQuestion[];
}
