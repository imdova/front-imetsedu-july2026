"use client";

import * as React from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";

import { SortableItem, type DragHandleProps } from "./sortable-item";
import { useMounted } from "@/hooks/use-mounted";

interface SortableListProps<T extends { id: string }> {
  items: T[];
  onReorder: (items: T[]) => void;
  renderItem: (item: T, handle: DragHandleProps) => React.ReactNode;
  className?: string;
}

/** Inert handle props for the pre-hydration (server + first client) render. */
const INERT_HANDLE: DragHandleProps = {
  attributes: {},
  listeners: undefined,
  isDragging: false,
};

/**
 * Drop-in vertical sortable list. Handles sensors (pointer + keyboard for a11y),
 * collision detection and the array reorder; consumers only render each item.
 *
 * dnd-kit assigns incrementing accessibility ids that differ between the server
 * and client renders, causing hydration warnings. We sidestep this by rendering
 * a static (non-dnd) tree until mounted, then upgrading to the interactive
 * DndContext on the client — server and first client render stay identical.
 */
export function SortableList<T extends { id: string }>({
  items,
  onReorder,
  renderItem,
  className,
}: SortableListProps<T>) {
  const mounted = useMounted();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = items.findIndex((i) => i.id === active.id);
    const newIndex = items.findIndex((i) => i.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;
    onReorder(arrayMove(items, oldIndex, newIndex));
  }

  if (!mounted) {
    return (
      <div className={className}>
        {items.map((item) => (
          <div key={item.id}>{renderItem(item, INERT_HANDLE)}</div>
        ))}
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      modifiers={[restrictToVerticalAxis]}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={items.map((i) => i.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className={className}>
          {items.map((item) => (
            <SortableItem key={item.id} id={item.id}>
              {(handle) => renderItem(item, handle)}
            </SortableItem>
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
