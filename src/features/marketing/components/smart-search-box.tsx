"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import {
  Search,
  GraduationCap,
  BadgeCheck,
  Briefcase,
  UserRound,
  Hash,
  Newspaper,
  X,
} from "lucide-react";

import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import {
  buildSmartHits,
  SMART_HIT_ORDER,
  type SmartHit,
  type SmartHitKind,
} from "@/features/marketing/lib/smart-course-search";
import type { CourseRow, InstructorLookup } from "@/types";
import type { BlogPost } from "@/types/blog";

const KIND_ICON: Record<SmartHitKind, React.ElementType> = {
  course: GraduationCap,
  certification: BadgeCheck,
  career: Briefcase,
  instructor: UserRound,
  topic: Hash,
  article: Newspaper,
};

const KIND_LABEL_KEY: Record<SmartHitKind, string> = {
  course: "smartKindCourse",
  certification: "smartKindCertification",
  career: "smartKindCareer",
  instructor: "smartKindInstructor",
  topic: "smartKindTopic",
  article: "smartKindArticle",
};

interface Props {
  value: string;
  onChange: (value: string) => void;
  onPickCourses?: (courseIds: string[] | null) => void;
  courses: CourseRow[];
  instructors?: InstructorLookup[];
  articles?: BlogPost[];
  className?: string;
}

export function SmartSearchBox({
  value,
  onChange,
  onPickCourses,
  courses,
  instructors = [],
  articles = [],
  className,
}: Props) {
  const t = useTranslations("Marketing");
  const [open, setOpen] = React.useState(false);
  const rootRef = React.useRef<HTMLDivElement>(null);

  const hits = React.useMemo(
    () =>
      value.trim().length >= 2
        ? buildSmartHits({ query: value, courses, instructors, articles })
        : [],
    [value, courses, instructors, articles],
  );

  const grouped = React.useMemo(() => {
    const map = new Map<SmartHitKind, SmartHit[]>();
    for (const kind of SMART_HIT_ORDER) map.set(kind, []);
    for (const hit of hits) map.get(hit.kind)?.push(hit);
    return SMART_HIT_ORDER.map((kind) => ({ kind, items: map.get(kind) ?? [] })).filter(
      (g) => g.items.length > 0,
    );
  }, [hits]);

  React.useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const selectHit = (hit: SmartHit) => {
    if (hit.courseIds?.length) {
      onChange(hit.title);
      onPickCourses?.(hit.courseIds);
      setOpen(false);
      return;
    }
    onChange(hit.title);
    onPickCourses?.(null);
    setOpen(false);
  };

  const clear = () => {
    onChange("");
    onPickCourses?.(null);
    setOpen(false);
  };

  return (
    <div ref={rootRef} className={cn("relative flex-1", className)}>
      <div className="relative">
        <Search className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            onPickCourses?.(null);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder={t("smartSearchPlaceholder")}
          className="h-11 ps-9 pe-9"
          autoComplete="off"
          aria-autocomplete="list"
          aria-expanded={open && grouped.length > 0}
        />
        {value && (
          <button
            type="button"
            onClick={clear}
            className="absolute end-2.5 top-1/2 grid size-6 -translate-y-1/2 place-items-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
            aria-label={t("smartSearchClear")}
          >
            <X className="size-3.5" />
          </button>
        )}
      </div>

      {open && value.trim().length >= 2 && (
        <div className="absolute inset-x-0 top-full z-40 mt-1 max-h-[min(28rem,70vh)] overflow-y-auto rounded-xl border bg-popover shadow-lg">
          {grouped.length === 0 ? (
            <p className="px-4 py-6 text-center text-sm text-muted-foreground">
              {t("smartSearchEmpty")}
            </p>
          ) : (
            <div className="py-2">
              {grouped.map(({ kind, items }) => {
                const Icon = KIND_ICON[kind];
                return (
                  <div key={kind} className="px-1 pb-1">
                    <p className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                      <Icon className="size-3.5" />
                      {t(KIND_LABEL_KEY[kind])}
                    </p>
                    <ul>
                      {items.map((hit) => (
                        <li key={hit.id}>
                          {hit.kind === "article" || (hit.kind === "instructor" && !hit.courseIds?.length) ? (
                            <Link
                              href={hit.href}
                              onClick={() => setOpen(false)}
                              className="flex w-full flex-col gap-0.5 rounded-lg px-3 py-2 text-start hover:bg-muted/70"
                            >
                              <span className="text-sm font-medium text-foreground">{hit.title}</span>
                              {hit.subtitle && (
                                <span className="text-xs text-muted-foreground">{hit.subtitle}</span>
                              )}
                            </Link>
                          ) : (
                            <button
                              type="button"
                              onClick={() => selectHit(hit)}
                              className="flex w-full flex-col gap-0.5 rounded-lg px-3 py-2 text-start hover:bg-muted/70"
                            >
                              <span className="text-sm font-medium text-foreground">{hit.title}</span>
                              {hit.subtitle && (
                                <span className="text-xs text-muted-foreground">{hit.subtitle}</span>
                              )}
                            </button>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
