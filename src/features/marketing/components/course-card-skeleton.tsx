import { cn } from "@/lib/utils";

/** Placeholder card shown while catalog filters are applying. */
export function CourseCardSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex h-full flex-col overflow-hidden rounded-2xl border border-border/70 bg-card shadow-sm",
        className,
      )}
      aria-hidden
    >
      <div className="aspect-[2/1] animate-pulse bg-muted" />
      <div className="flex flex-1 flex-col gap-2.5 p-3.5">
        <div className="h-5 w-[80%] animate-pulse rounded bg-muted" />
        <div className="h-4 w-[40%] animate-pulse rounded bg-muted" />
        <div className="flex gap-1.5">
          <div className="h-6 w-20 animate-pulse rounded-full bg-muted" />
          <div className="h-6 w-16 animate-pulse rounded-full bg-muted" />
        </div>
        <div className="mt-auto space-y-2 pt-2">
          <div className="flex items-center gap-2.5">
            <div className="size-9 animate-pulse rounded-full bg-muted" />
            <div className="flex-1 space-y-1.5">
              <div className="h-3 w-14 animate-pulse rounded bg-muted" />
              <div className="h-3.5 w-28 animate-pulse rounded bg-muted" />
            </div>
          </div>
          <div className="h-6 w-24 animate-pulse rounded bg-muted" />
          <div className="h-10 w-full animate-pulse rounded-xl bg-muted" />
        </div>
      </div>
    </div>
  );
}

export function CourseCardSkeletonGrid({ count = 6 }: { count?: number }) {
  return (
    <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3" aria-busy="true" aria-live="polite">
      {Array.from({ length: count }, (_, i) => (
        <CourseCardSkeleton key={i} />
      ))}
    </div>
  );
}
