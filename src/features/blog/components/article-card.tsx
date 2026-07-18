import {
  Award,
  BookOpen,
  Briefcase,
  Building2,
  CalendarDays,
  Clock,
  ShieldCheck,
  Star,
} from "lucide-react";

import { Link } from "@/i18n/navigation";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { BlogPost } from "@/types/blog";

const fmtDate = (iso?: string) =>
  iso ? new Date(iso).toLocaleDateString("en", { month: "short", day: "numeric", year: "numeric" }) : "";

/* Deterministic accent per category so the wall of (image-less) cards reads as
 * a designed set rather than a grid of identical placeholders. */
const ACCENTS = [
  "from-blue-500/15 to-blue-500/5 text-blue-600 dark:text-blue-400",
  "from-emerald-500/15 to-emerald-500/5 text-emerald-600 dark:text-emerald-400",
  "from-violet-500/15 to-violet-500/5 text-violet-600 dark:text-violet-400",
  "from-amber-500/15 to-amber-500/5 text-amber-600 dark:text-amber-400",
  "from-rose-500/15 to-rose-500/5 text-rose-600 dark:text-rose-400",
  "from-cyan-500/15 to-cyan-500/5 text-cyan-600 dark:text-cyan-400",
];

function accentFor(text: string): string {
  let h = 0;
  for (let i = 0; i < text.length; i++) h = (h * 31 + text.charCodeAt(i)) & 0xffff;
  return ACCENTS[h % ACCENTS.length];
}

/** Topic icon inferred from the category wording, with a book fallback. */
function iconFor(category: string) {
  const c = category.toLowerCase();
  if (/quality|certif|cphq/.test(c)) return Award;
  if (/infection|safety|patient/.test(c)) return ShieldCheck;
  if (/accredit|standard|management|hospital/.test(c)) return Building2;
  if (/career|exam|salary/.test(c)) return Briefcase;
  return BookOpen;
}

export function ArticleCard({ post, featured }: { post: BlogPost; featured?: boolean }) {
  const accent = accentFor(post.category || post.title);
  const Icon = iconFor(post.category || "");

  return (
    <Link
      href={`/blog/${post.slug}`}
      className={cn(
        "group flex flex-col overflow-hidden rounded-3xl border border-border/70 bg-card shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-lg",
        featured && "ring-1 ring-primary/30",
      )}
    >
      <div className="relative aspect-[16/9] overflow-hidden">
        {post.coverImageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={post.coverImageUrl}
            alt={post.title}
            className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className={cn("relative grid size-full place-items-center bg-gradient-to-br", accent)}>
            <Icon className="size-10 opacity-80 transition-transform duration-500 group-hover:scale-110" />
            <span className="pointer-events-none absolute -bottom-3 -end-2 font-heading text-[5rem] font-black leading-none opacity-[0.08]">
              {(post.category || post.title).slice(0, 1)}
            </span>
          </div>
        )}
        {post.featured && (
          <span className="absolute start-3 top-3 inline-flex items-center gap-1 rounded-full bg-primary px-2.5 py-0.5 text-xs font-semibold text-primary-foreground shadow-sm">
            <Star className="size-3 fill-current" /> Featured
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-3 p-5">
        {post.category && (
          <Badge variant="secondary" className="w-fit text-[0.7rem]">{post.category}</Badge>
        )}
        <h3 className="line-clamp-2 font-heading text-[1.05rem] font-bold leading-snug tracking-tight text-foreground transition-colors group-hover:text-primary">
          {post.title}
        </h3>
        {post.excerpt && (
          <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">{post.excerpt}</p>
        )}

        {post.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {post.tags.slice(0, 3).map((t) => (
              <span key={t} className="rounded-full bg-muted px-2 py-0.5 text-[0.68rem] font-medium text-muted-foreground">
                #{t}
              </span>
            ))}
          </div>
        )}

        <div className="mt-auto flex items-center gap-3 border-t border-border/50 pt-3 text-xs text-muted-foreground">
          {post.publishedAt && (
            <span className="inline-flex items-center gap-1"><CalendarDays className="size-3.5" />{fmtDate(post.publishedAt)}</span>
          )}
          <span className="inline-flex items-center gap-1"><Clock className="size-3.5" />{post.readingMinutes} min</span>
          {post.authorName && <span className="ms-auto truncate font-medium text-foreground/70">{post.authorName}</span>}
        </div>
      </div>
    </Link>
  );
}
