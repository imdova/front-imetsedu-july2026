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

/** Professional healthcare portraits (Unsplash) — replace with real graduate photos when available. */
export const CPHQ_STUDENT_REVIEWS: StudentTextReview[] = [
  {
    name: "د. سارة الخالد",
    jobTitle: "مديرة الجودة",
    country: "السعودية",
    photo: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&h=400&fit=crop&crop=faces&q=80",
    review:
      "برنامج منظم جدًا — غطّى كل دومينات الامتحان بأسئلة مشابهة للواقع. اجتزت CPHQ من أول محاولة بعد ٨ أسابيع فقط.",
  },
  {
    name: "د. أحمد منصور",
    jobTitle: "Quality Manager",
    country: "مصر",
    photo: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&h=400&fit=crop&crop=faces&q=80",
    review:
      "The bilingual delivery made complex NAHQ terminology click. Mock exams and weekly live review were the game-changer for me.",
  },
  {
    name: "نورة العتيبي",
    jobTitle: "Senior Nurse",
    country: "الإمارات",
    photo: "https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=400&h=400&fit=crop&crop=faces&q=80",
    review:
      "كنت أخاف من امتحان إنجليزي طويل — الدعم المستمر والأسئلة المحاكية رفعوا ثقتي ونجحت بدرجة ممتازة.",
  },
  {
    name: "د. ليلى حسن",
    jobTitle: "Clinical Pharmacist",
    country: "الأردن",
    photo: "https://images.unsplash.com/photo-1651008376811-b90baee60c1f?w=400&h=400&fit=crop&crop=faces&q=80",
    review:
      "Clear structure, expert instructors, and real healthcare-quality cases — exactly what I needed before sitting Prometric.",
  },
  {
    name: "د. محمد الغامدي",
    jobTitle: "Patient Safety Officer",
    country: "السعودية",
    photo: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=400&h=400&fit=crop&crop=faces&q=80",
    review:
      "أفضل استثمار في مسيرتي المهنية. المحتوى مرتب حسب الـ Blueprint والمتابعة بعد كل محاضرة ممتازة.",
  },
  {
    name: "د. فاطمة الزهراني",
    jobTitle: "Accreditation Specialist",
    country: "الكويت",
    photo: "https://images.unsplash.com/photo-1527613426441-4da17471b66d?w=400&h=400&fit=crop&crop=faces&q=80",
    review:
      "From accreditation standards to exam tactics — everything was covered. I recommend IMETS to every quality colleague.",
  },
];

function StarRow({ rating = 5 }: { rating?: number }) {
  return (
    <div className="flex justify-center gap-0.5 text-[#f4c430]" role="img" aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} className={cn("size-4", i < rating ? "fill-current" : "fill-none text-slate-200")} />
      ))}
    </div>
  );
}

function ReviewCard({ review }: { review: StudentTextReview }) {
  return (
    <article className="flex h-full flex-col items-center rounded-2xl border border-blue-100 bg-white p-6 text-center shadow-sm transition hover:-translate-y-0.5 hover:border-[#0b3fa8]/30 hover:shadow-md">
      <StarRow rating={review.rating ?? 5} />

      <Avatar className="mt-5 size-24 border-4 border-white shadow-lg ring-2 ring-[#0b3fa8]/35">
        {review.photo ? (
          <AvatarImage src={review.photo} alt={review.name} className="object-cover" />
        ) : null}
        <AvatarFallback className="bg-[#0b3fa8] text-xl font-semibold text-white">
          {getInitials(review.name)}
        </AvatarFallback>
      </Avatar>

      <h3 className="mt-4 text-base font-bold text-[#0a2f7a]">{review.name}</h3>
      <p className="mt-1 text-sm font-medium text-[#0b3fa8]">{review.jobTitle}</p>
      <p className="mt-1 inline-flex items-center gap-1 text-xs text-slate-500">
        <MapPin className="size-3 shrink-0 text-[#0b3fa8]" />
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
        <span className="inline-flex items-center gap-2 rounded-full bg-[#0b3fa8]/10 px-3 py-1 text-sm font-bold text-[#0b3fa8]">
          <ThumbsUp className="size-4" /> {recommendPct}% recommend · {reviewCount} reviews
        </span>
        <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-[#0a2f7a]">{title}</h2>
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
