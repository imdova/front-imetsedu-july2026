/**
 * Static option sets for the "Add New Course" form, derived directly from the
 * BA field inventory (IMETS_NewCourse_Form_Inputs). Lookup-driven fields
 * (Category, Subcategory, Instructors, Tags) come from the DAL instead.
 */
import type {
  AttendanceMode,
  CurrencyCode,
  Difficulty,
  LanguageOption,
  LessonType,
} from "@/types";

export const DIFFICULTY_OPTIONS: { value: Difficulty; label: string }[] = [
  { value: "Beginner", label: "Beginner" },
  { value: "Intermediate", label: "Intermediate" },
  { value: "Advanced", label: "Advanced" },
];

export const PROGRAM_TYPE_OPTIONS: { value: string; label: string }[] = [
  { value: "diploma", label: "Professional Diploma" },
  { value: "certificate", label: "Certificate" },
  { value: "bootcamp", label: "Bootcamp" },
  { value: "workshop", label: "Workshop" },
  { value: "executive", label: "Executive Program" },
  { value: "masterclass", label: "Masterclass" },
];

export const ATTENDANCE_MODE_OPTIONS: {
  value: AttendanceMode;
  label: string;
}[] = [
  { value: "online-zoom", label: "Online | Zoom" },
  { value: "offline", label: "Offline" },
];

export const LANGUAGE_OPTIONS: LanguageOption[] = [
  "English",
  "Arabic",
  "French",
  "Spanish",
];

export const CURRENCIES: {
  code: CurrencyCode;
  label: string;
  symbol: string;
  required: boolean;
}[] = [
  { code: "EGP", label: "Egyptian Pound", symbol: "E£", required: true },
  { code: "SAR", label: "Saudi Riyal", symbol: "﷼", required: false },
  { code: "USD", label: "US Dollar", symbol: "$", required: false },
];

export const LESSON_TYPE_OPTIONS: {
  value: LessonType;
  label: string;
  icon: string;
}[] = [
  { value: "video", label: "Video", icon: "Play" },
  { value: "pdf", label: "PDF", icon: "FileText" },
  { value: "quiz", label: "Quiz", icon: "ListChecks" },
  { value: "text", label: "Text", icon: "AlignLeft" },
];

/** Max upload sizes (MB) used by the media fields. */
export const UPLOAD_LIMITS = {
  overviewPdfMb: 20,
  coverImageMb: 5,
} as const;
