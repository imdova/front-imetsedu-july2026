/**
 * Student profile mapping — backend `GET /student-portal/profile` ({user, lead})
 * to a flat UI profile, and the UI form back to `PATCH /student-portal/profile`
 * (UpdateStudentProfileDto). Pure + client-safe.
 */
export interface StudentProfile {
  name: string;
  email: string;
  phone: string;
  phoneCountryCode: string;
  whatsApp: string;
  whatsAppCountryCode: string;
  country: string;
  city: string;
  specialty: string;
  educationLevel: string;
  jobTitle: string;
  aboutMe: string;
  dateOfBirth: string; // yyyy-mm-dd
  gender: "male" | "female" | "";
  image: string;
  linkedInUrl: string;
  memberSince: string;
  isActive: boolean;
  completion: number; // 0-100
}

export type StudentProfileForm = Omit<StudentProfile, "memberSince" | "isActive" | "completion">;

const COMPLETION_FIELDS: (keyof StudentProfile)[] = [
  "name", "email", "phone", "country", "specialty", "educationLevel", "jobTitle", "dateOfBirth", "gender", "whatsApp",
];

export function mapStudentProfile(raw: any): StudentProfile {
  const u = raw?.user ?? raw ?? {};
  const lead = raw?.lead ?? {};
  const dob = u.dateOfBirth ?? u.birthday ?? lead.dateOfBirth ?? "";
  const profile: StudentProfile = {
    name: u.name ?? lead.fullName ?? "—",
    email: u.email ?? "",
    phone: u.number ?? u.phone ?? lead.phone ?? "",
    phoneCountryCode: u.phoneCountryCode ?? lead.phoneCountryCode ?? "+20",
    whatsApp: u.whatsApp ?? lead.whatsApp ?? u.number ?? "",
    whatsAppCountryCode: u.whatsAppCountryCode ?? lead.whatsAppCountryCode ?? u.phoneCountryCode ?? "+20",
    country: u.country ?? lead.country ?? "",
    city: u.city ?? "",
    specialty: u.specialty ?? lead.specialty ?? "",
    educationLevel: u.educationLevel ?? lead.educationLevel ?? "",
    jobTitle: u.jobTitle ?? u.professionalTitle ?? lead.jobTitle ?? "",
    aboutMe: u.aboutMe ?? u.bio ?? "",
    dateOfBirth: String(dob).slice(0, 10),
    gender: (u.gender ?? lead.gender ?? "") as StudentProfile["gender"],
    image: u.image ?? u.avatarUrl ?? "",
    linkedInUrl: u.linkedInUrl ?? "",
    memberSince: u.createdAt ? new Date(u.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" }) : "—",
    isActive: u.isActive ?? true,
    completion: 0,
  };
  const filled = COMPLETION_FIELDS.filter((k) => String(profile[k] ?? "").trim()).length;
  profile.completion = Math.round((filled / COMPLETION_FIELDS.length) * 100);
  return profile;
}

/** Flatten the form to the backend UpdateStudentProfileDto. */
export function toUpdateProfileDto(f: StudentProfileForm): Record<string, unknown> {
  return {
    fullName: f.name,
    phone: f.phone,
    phoneCountryCode: f.phoneCountryCode,
    whatsApp: f.whatsApp,
    whatsAppCountryCode: f.whatsAppCountryCode,
    country: f.country,
    city: f.city,
    specialty: f.specialty,
    educationLevel: f.educationLevel,
    jobTitle: f.jobTitle,
    aboutMe: f.aboutMe,
    dateOfBirth: f.dateOfBirth || undefined,
    gender: f.gender || undefined,
    linkedInUrl: f.linkedInUrl || undefined,
  };
}
