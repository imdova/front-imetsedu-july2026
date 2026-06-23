import { CalendarDays, Clock, Star } from "lucide-react";

import { Link } from "@/i18n/navigation";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { BlogPost } from "@/types/blog";

const fmtDate = (iso?: string) =>
  iso ? new Date(iso).toLocaleDateString("en", { month: "short", day: "numeric", year: "numeric" }) : "";

export function ArticleCard({ post, featured }: { post: BlogPost; featured?: boolean }) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className={cn(
        "group flex flex-col overflow-hidden rounded-2xl border border-border/70 bg-card shadow-sm transition-all hover:-translate-y-1 hover:shadow-md",
        featured && "ring-1 ring-primary/30",
      )}
    >
      <div className="relative aspect-video bg-muted">
        {post.coverImageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={post.coverImageUrl} alt={post.title} className="size-full object-cover transition-transform duration-300 group-hover:scale-105" />
        ) : (
          <div className="grid size-full place-items-center text-muted-foreground/40">{post.title.slice(0, 1)}</div>
        )}
        {post.featured && (
          <span className="absolute start-3 top-3 inline-flex items-center gap-1 rounded-full bg-primary px-2 py-0.5 text-xs font-medium text-primary-foreground">
            <Star className="size-3" /> Featured
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-3 p-5">
        {post.category && <Badge variant="secondary" className="w-fit">{post.category}</Badge>}
        <h3 className="line-clamp-2 font-heading text-base font-semibold leading-snug">{post.title}</h3>
        {post.excerpt && <p className="line-clamp-2 text-sm text-muted-foreground">{post.excerpt}</p>}
        <div className="mt-auto flex items-center gap-3 pt-2 text-xs text-muted-foreground">
          {post.publishedAt && <span className="inline-flex items-center gap-1"><CalendarDays className="size-3.5" />{fmtDate(post.publishedAt)}</span>}
          <span className="inline-flex items-center gap-1"><Clock className="size-3.5" />{post.readingMinutes} min</span>
          {post.authorName && <span className="ms-auto truncate">{post.authorName}</span>}
        </div>
      </div>
    </Link>
  );
}
