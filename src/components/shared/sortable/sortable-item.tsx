"use client";

import * as React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import { cn } from "@/lib/utils";

export interface DragHandleProps {
  /** Spread onto the element that should initiate the drag. */
  attributes: React.HTMLAttributes<HTMLElement>;
  listeners: Record<string, unknown> | undefined;
  isDragging: boolean;
}

interface SortableItemProps {
  id: string;
  className?: string;
  /** Render-prop receives handle props so consumers choose their own handle. */
  children: (handle: DragHandleProps) => React.ReactNode;
}

/**
 * Composable sortable row. Owns transform/transition + dragging state, but
 * delegates *where* the handle lives to the consumer via a render prop — so the
 * same primitive powers curriculum modules, lessons, and dashboard cards.
 */
export function SortableItem({ id, className, children }: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style: React.CSSProperties = {
    transform: CSS.Translate.toString(transform),
    transition,
    zIndex: isDragging ? 50 : undefined,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(isDragging && "opacity-80", className)}
    >
      {children({
        attributes: attributes as React.HTMLAttributes<HTMLElement>,
        listeners,
        isDragging,
      })}
    </div>
  );
}
