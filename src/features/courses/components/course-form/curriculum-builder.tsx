"use client";

import * as React from "react";
import { useFormContext, useWatch } from "react-hook-form";
import { useTranslations } from "next-intl";
import {
  GripVertical,
  Plus,
  Trash2,
  ChevronDown,
  Play,
  FileText,
  ListChecks,
  AlignLeft,
  Link,
  Clock,
} from "lucide-react";

import type { CourseFormValues } from "@/validations/course-schema";
import { createId, cn } from "@/lib/utils";
import { LESSON_TYPE_OPTIONS } from "@/constants/course-options";
import type { LessonType } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SortableList } from "@/components/shared/sortable/sortable-list";
import type { DragHandleProps } from "@/components/shared/sortable/sortable-item";

const LESSON_ICONS: Record<LessonType, React.ElementType> = {
  video: Play,
  pdf: FileText,
  quiz: ListChecks,
  text: AlignLeft,
};

const LESSON_TYPE_LABEL: Record<LessonType, string> = {
  video: "lessonVideo",
  pdf: "lessonPdf",
  quiz: "lessonQuiz",
  text: "lessonText",
};

type Module = CourseFormValues["modules"][number];
type Lesson = Module["lessons"][number];

/**
 * The curriculum builder. Modules and their lessons are both drag-sortable.
 * State lives in react-hook-form (`modules`); mutations go through setValue so
 * Zod validation + dirty tracking stay intact.
 */
export function CurriculumBuilder() {
  const { control, setValue } = useFormContext<CourseFormValues>();
  const t = useTranslations("CourseForm");
  const modules = useWatch({ control, name: "modules" }) ?? [];

  const update = (next: Module[]) =>
    setValue("modules", next, { shouldValidate: true, shouldDirty: true });

  const addModule = () =>
    update([
      ...modules,
      {
        id: createId("mod"),
        titleEn: `Module ${modules.length + 1}`,
        titleAr: "",
        order: modules.length,
        lessons: [],
      },
    ]);

  const removeModule = (id: string) =>
    update(modules.filter((m) => m.id !== id));

  const patchModule = (id: string, patch: Partial<Module>) =>
    update(modules.map((m) => (m.id === id ? { ...m, ...patch } : m)));

  return (
    <div className="space-y-4">
      <SortableList
        items={modules}
        onReorder={(next) =>
          update(next.map((m, i) => ({ ...m, order: i })))
        }
        className="space-y-4"
        renderItem={(module, handle) => (
          <ModuleCard
            module={module}
            handle={handle}
            t={t}
            onRemove={() => removeModule(module.id)}
            onPatch={(patch) => patchModule(module.id, patch)}
          />
        )}
      />

      <Button
        type="button"
        variant="outline"
        onClick={addModule}
        className="w-full gap-1.5 border-dashed"
      >
        <Plus className="size-4" />
        {t("addModule")}
      </Button>
    </div>
  );
}

type FormT = ReturnType<typeof useTranslations<"CourseForm">>;

interface ModuleCardProps {
  module: Module;
  handle: DragHandleProps;
  t: FormT;
  onRemove: () => void;
  onPatch: (patch: Partial<Module>) => void;
}

function ModuleCard({ module, handle, t, onRemove, onPatch }: ModuleCardProps) {
  const [open, setOpen] = React.useState(true);

  const addLesson = () =>
    onPatch({
      lessons: [
        ...module.lessons,
        {
          id: createId("les"),
          lesson_type: "video",
          titleEn: "",
          titleAr: "",
          order: module.lessons.length,
          isFreePreview: false,
        },
      ],
    });

  const patchLesson = (id: string, patch: Partial<Lesson>) =>
    onPatch({
      lessons: module.lessons.map((l) =>
        l.id === id ? { ...l, ...patch } : l,
      ),
    });

  const removeLesson = (id: string) =>
    onPatch({ lessons: module.lessons.filter((l) => l.id !== id) });

  return (
    <div
      className={cn(
        "rounded-xl border bg-card",
        handle.isDragging && "shadow-lg ring-1 ring-primary/30",
      )}
    >
      <div className="flex items-center gap-2 p-3">
        <button
          type="button"
          className="cursor-grab touch-none text-muted-foreground/60 hover:text-foreground active:cursor-grabbing"
          aria-label="Drag module"
          {...handle.attributes}
          {...handle.listeners}
        >
          <GripVertical className="size-4" />
        </button>

        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-label={open ? "Collapse" : "Expand"}
        >
          <ChevronDown
            className={cn(
              "size-4 text-muted-foreground transition-transform",
              !open && "-rotate-90 rtl:rotate-90",
            )}
          />
        </button>

        <div className="grid flex-1 gap-2 sm:grid-cols-2">
          <Input
            value={module.titleEn}
            onChange={(e) => onPatch({ titleEn: e.target.value })}
            placeholder={t("moduleTitleEn")}
            className="h-9 font-medium"
          />
          <Input
            dir="rtl"
            value={module.titleAr}
            onChange={(e) => onPatch({ titleAr: e.target.value })}
            placeholder={t("moduleTitleAr")}
            className="h-9"
          />
        </div>

        <Badge variant="secondary" className="hidden sm:inline-flex">
          {t("lessonsCount", { count: module.lessons.length })}
        </Badge>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-8 text-muted-foreground hover:text-destructive"
          onClick={onRemove}
          aria-label="Delete module"
        >
          <Trash2 className="size-4" />
        </Button>
      </div>

      {open && (
        <div className="space-y-2 border-t p-3">
          {module.lessons.length > 0 && (
            <SortableList
              items={module.lessons}
              onReorder={(next) =>
                onPatch({ lessons: next.map((l, i) => ({ ...l, order: i })) })
              }
              className="space-y-2"
              renderItem={(lesson, lHandle) => (
                <LessonRow
                  lesson={lesson}
                  handle={lHandle}
                  t={t}
                  onPatch={(patch) => patchLesson(lesson.id, patch)}
                  onRemove={() => removeLesson(lesson.id)}
                />
              )}
            />
          )}

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={addLesson}
            className="gap-1.5 text-primary hover:text-primary"
          >
            <Plus className="size-4" />
            {t("addLesson")}
          </Button>
        </div>
      )}
    </div>
  );
}

interface LessonRowProps {
  lesson: Lesson;
  handle: DragHandleProps;
  t: FormT;
  onPatch: (patch: Partial<Lesson>) => void;
  onRemove: () => void;
}

function LessonRow({ lesson, handle, t, onPatch, onRemove }: LessonRowProps) {
  const Icon = LESSON_ICONS[lesson.lesson_type];
  const [open, setOpen] = React.useState(false);

  return (
    <div
      className={cn(
        "rounded-lg border bg-background",
        handle.isDragging && "ring-1 ring-primary/30",
      )}
    >
      {/* main row */}
      <div className="flex items-center gap-2 p-2">
        <button
          type="button"
          className="cursor-grab touch-none text-muted-foreground/50 hover:text-foreground active:cursor-grabbing"
          aria-label="Drag lesson"
          {...handle.attributes}
          {...handle.listeners}
        >
          <GripVertical className="size-4" />
        </button>

        <span className="grid size-7 shrink-0 place-items-center rounded-md bg-primary/10 text-primary">
          <Icon className="size-3.5" />
        </span>

        <Input
          value={lesson.titleEn}
          onChange={(e) => onPatch({ titleEn: e.target.value })}
          placeholder={t("lessonTitle")}
          className="h-8 flex-1 border-0 bg-transparent px-1 shadow-none focus-visible:ring-0 dark:bg-transparent"
        />

        <Select
          value={lesson.lesson_type}
          onValueChange={(v) => onPatch({ lesson_type: v as LessonType })}
        >
          <SelectTrigger size="sm" className="w-27.5">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {LESSON_TYPE_OPTIONS.map((o) => (
              <SelectItem key={o.value} value={o.value}>
                {t(LESSON_TYPE_LABEL[o.value])}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <label className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Switch
            checked={lesson.isFreePreview}
            onCheckedChange={(v) => onPatch({ isFreePreview: v })}
          />
          <span className="hidden lg:inline">{t("free")}</span>
        </label>

        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-label={open ? "Collapse" : "Expand"}
          className="text-muted-foreground/60 hover:text-foreground"
        >
          <ChevronDown
            className={cn(
              "size-4 transition-transform",
              open && "rotate-180",
            )}
          />
        </button>

        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-8 text-muted-foreground hover:text-destructive"
          onClick={onRemove}
          aria-label="Delete lesson"
        >
          <Trash2 className="size-4" />
        </Button>
      </div>

      {/* expandable details */}
      {open && (
        <div className="grid gap-3 border-t px-3 py-3 sm:grid-cols-2">
          <div className="flex items-center gap-2">
            <Input
              dir="rtl"
              value={lesson.titleAr ?? ""}
              onChange={(e) => onPatch({ titleAr: e.target.value })}
              placeholder={t("lessonTitleAr")}
              className="h-8 text-sm"
            />
          </div>

          {lesson.lesson_type === "video" && (
            <div className="flex items-center gap-2 sm:col-span-2">
              <Link className="size-4 shrink-0 text-muted-foreground" />
              <Input
                value={lesson.videoUrl ?? ""}
                onChange={(e) => onPatch({ videoUrl: e.target.value })}
                placeholder={t("lessonVideoUrl")}
                className="h-8 text-sm"
              />
            </div>
          )}

          <div className="flex items-center gap-2">
            <Clock className="size-4 shrink-0 text-muted-foreground" />
            <Input
              value={lesson.duration ?? ""}
              onChange={(e) => onPatch({ duration: e.target.value })}
              placeholder={t("lessonDuration")}
              className="h-8 text-sm"
            />
          </div>
        </div>
      )}
    </div>
  );
}
