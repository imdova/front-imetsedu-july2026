import { MapPin, Star, ThumbsUp } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn, getInitials } from "@/lib/utils";

export interface StudentTextReview {
  name: string;
  jobTitle: string;
  country: string;
  review: string;
  photo?: string;
  rating?: number;
}

export const CPHQ_STUDENT_REVIEWS: StudentTextReview[] = [
  {
    name: "د. سارة الخالد",
    jobTitle: "مديرة الجودة",
    country: "السعودية",
    review:
      "برنامج منظم جدًا — غطّى كل دومينات الامتحان بأسئلة مشابهة للواقع. اجتزت CPHQ من أول محاولة بعد ٨ أسابيع فقط.",
  },
  {
    name: "أحمد منصور",
    jobTitle: "Quality Manager",
    country: "مصر",
    review:
      "The bilingual delivery made complex NAHQ terminology click. Mock exams and weekly live review were the game-changer for me.",
  },
  {
    name: "نورة العتيبي",
    jobTitle: "Senior Nurse",
    country: "الإمارات",
    review:
      "كنت أخاف من امتحان إنجليزي طويل — الدعم المستمر والأسئلة المحاكية رفعوا ثقتي ونجحت بدرجة ممتازة.",
  },
  {
    name: "د. ليلى حسن",
    jobTitle: "Clinical Pharmacist",
    country: "الأردن",
    review:
      "Clear structure, expert instructors, and real healthcare-quality cases — exactly what I needed before sitting Prometric.",
  },
  {
    name: "محمد الغامدي",
    jobTitle: "Patient Safety Officer",
    country: "السعودية",
    review:
      "أفضل استثمار في مسيرتي المهنية. المحتوى مرتب حسب الـ Blueprint والمتابعة بعد كل محاضرة ممتازة.",
  },
  {
    name: "فاطمة الزهراني",
    jobTitle: "Accreditation Specialist",
    country: "الكويت",
    review:
      "From accreditation standards to exam tactics — everything was covered. I recommend IMETS to every quality colleague.",
  },
];

function StarRow({ rating = 5 }: { rating?: number }) {
  return (
    <div className="flex justify-center gap-0.5 text-amber-400" aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} className={cn("size-4", i < rating ? "fill-current" : "fill-none text-slate-200")} />
      ))}
    </div>
  );
}

function ReviewCard({ review }: { review: StudentTextReview }) {
  return (
    <article className="flex h-full flex-col items-center rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <StarRow rating={review.rating ?? 5} />

      <Avatar className="mt-4 size-16 border-2 border-white shadow-md ring-2 ring-[#B8860B]/20">
        {review.photo ? <AvatarImage src={review.photo} alt={review.name} /> : null}
        <AvatarFallback className="bg-[#0b2545] text-lg font-semibold text-white">
          {getInitials(review.name)}
        </AvatarFallback>
      </Avatar>

      <h3 className="mt-4 text-base font-bold text-[#0b2545]">{review.name}</h3>
      <p className="mt-1 text-sm font-medium text-slate-600">{review.jobTitle}</p>
      <p className="mt-1 inline-flex items-center gap-1 text-xs text-slate-500">
        <MapPin className="size-3 shrink-0 text-[#B8860B]" />
        {review.country}
      </p>

      <blockquote className="mt-4 flex-1 text-sm leading-relaxed text-slate-600">
        &ldquo;{review.review}&rdquo;
      </blockquote>
    </article>
  );
}

export function StudentReviewCards({
  reviews = CPHQ_STUDENT_REVIEWS,
  title = "Student Reviews",
  subtitle = "Real recommendations from CPHQ graduates across the region.",
  recommendPct = 96,
  reviewCount = 52,
  className,
}: {
  reviews?: StudentTextReview[];
  title?: string;
  subtitle?: string;
  recommendPct?: number;
  reviewCount?: number;
  className?: string;
}) {
  if (!reviews.length) return null;

  return (
    <section dir="ltr" className={cn("mx-auto max-w-6xl px-4 py-16 text-left sm:px-6 lg:px-8", className)}>
      <div className="mx-auto mb-10 max-w-2xl text-center">
        <span className="inline-flex items-center gap-2 rounded-full bg-[#1877F2]/10 px-3 py-1 text-sm font-bold text-[#1877F2]">
          <ThumbsUp className="size-4" /> {recommendPct}% recommend · {reviewCount} reviews
        </span>
        <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-[#0b2545]">{title}</h2>
        <p className="mt-2 text-slate-600">{subtitle}</p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {reviews.map((r) => (
          <ReviewCard key={`${r.name}-${r.country}`} review={r} />
        ))}
      </div>
    </section>
  );
}
