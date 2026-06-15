"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import {
  PlayCircle, FileText, ListChecks, AlignLeft, CheckCircle2, Circle, Lock, ArrowRight,
} from "lucide-react";
import { toast } from "sonner";

import { Link } from "@/i18n/navigation";
import type { EnrolledCourse, Lesson, LessonType } from "@/lib/db/student";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

const LESSON_ICON: Record<LessonType, React.ElementType> = {
  video: PlayCircle, pdf: FileText, quiz: ListChecks, text: AlignLeft,
};

export function CoursePlayer({ course }: { course: EnrolledCourse }) {
  const t = useTranslations("Student");
  const allLessons = course.modules.flatMap((m) => m.lessons);
  const firstIncomplete = allLessons.find((l) => !l.completed) ?? allLessons[0];

  const [completed, setCompleted] = React.useState<Set<string>>(
    () => new Set(allLessons.filter((l) => l.completed).map((l) => l.id)),
  );
  const [currentId, setCurrentId] = React.useState(firstIncomplete?.id);

  const current = allLessons.find((l) => l.id === currentId);
  const currentIndex = allLessons.findIndex((l) => l.id === currentId);
  const next = allLessons[currentIndex + 1];
  const isDone = current ? completed.has(current.id) : false;

  const markComplete = () => {
    if (!current) return;
    setCompleted((prev) => new Set(prev).add(current.id));
    toast.success(t("markedComplete"));
    if (next) setCurrentId(next.id);
  };

  const Icon = current ? LESSON_ICON[current.type] : PlayCircle;

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
      {/* Player */}
      <div className="space-y-4">
        <div className="relative aspect-video overflow-hidden rounded-2xl bg-slate-950">
          <div className="absolute inset-0 grid place-items-center text-white/90">
            <div className="text-center">
              <Icon className="mx-auto size-16 opacity-80" />
              <p className="mt-3 text-sm text-white/70">{current?.title}</p>
            </div>
          </div>
          <span className="absolute bottom-3 start-3 inline-flex items-center gap-1.5 rounded-md bg-black/50 px-2 py-1 text-[0.7rem] text-white/80">
            <Lock className="size-3" /> {t("secureVideoNote")}
          </span>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="font-heading text-xl font-bold tracking-tight">{current?.title}</h1>
            <p className="text-sm text-muted-foreground">{course.title} · {current?.duration}</p>
          </div>
          <div className="flex items-center gap-2">
            {current?.type === "quiz" ? (
              <Button asChild className="gap-1.5">
                <Link href="/student/quiz/qz1">
                  <ListChecks className="size-4" /> {t("startQuiz")}
                </Link>
              </Button>
            ) : (
              <Button onClick={markComplete} disabled={isDone} className="gap-1.5">
                <CheckCircle2 className="size-4" />
                {isDone ? t("completedLabel") : t("markComplete")}
              </Button>
            )}
            {next && (
              <Button variant="outline" onClick={() => setCurrentId(next.id)} className="gap-1.5">
                {t("nextLesson")} <ArrowRight className="size-4 rtl:rotate-180" />
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Curriculum sidebar */}
      <aside className="rounded-2xl border border-border/70 bg-card shadow-sm">
        <div className="border-b p-4">
          <p className="font-heading font-semibold">{t("courseContent")}</p>
          <p className="text-xs text-muted-foreground">
            {t("lessonsOf", { done: completed.size, total: allLessons.length })}
          </p>
        </div>
        <ScrollArea className="h-[460px]">
          <div className="p-2">
            {course.modules.map((m) => (
              <div key={m.id} className="mb-2">
                <p className="px-2 py-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {m.title}
                </p>
                <ul>
                  {m.lessons.map((l) => (
                    <LessonRow
                      key={l.id}
                      lesson={l}
                      active={l.id === currentId}
                      done={completed.has(l.id)}
                      onClick={() => setCurrentId(l.id)}
                    />
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </ScrollArea>
      </aside>
    </div>
  );
}

function LessonRow({
  lesson, active, done, onClick,
}: {
  lesson: Lesson;
  active: boolean;
  done: boolean;
  onClick: () => void;
}) {
  const Icon = LESSON_ICON[lesson.type];
  return (
    <li>
      <button
        type="button"
        onClick={onClick}
        className={cn(
          "flex w-full items-center gap-2.5 rounded-lg px-2 py-2 text-start text-sm transition-colors",
          active ? "bg-primary/10 text-primary" : "hover:bg-muted",
        )}
      >
        {done ? (
          <CheckCircle2 className="size-4 shrink-0 text-success" />
        ) : (
          <Circle className="size-4 shrink-0 text-muted-foreground/50" />
        )}
        <Icon className="size-3.5 shrink-0 text-muted-foreground" />
        <span className="min-w-0 flex-1 truncate">{lesson.title}</span>
        <span className="shrink-0 text-xs text-muted-foreground">{lesson.duration}</span>
      </button>
    </li>
  );
}
