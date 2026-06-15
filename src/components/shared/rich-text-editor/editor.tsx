"use client";

import * as React from "react";
import { useEditor, EditorContent } from "@tiptap/react";

import { cn } from "@/lib/utils";
import { buildExtensions } from "./extensions";
import { EditorToolbar } from "./toolbar";

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  dir?: "ltr" | "rtl";
  className?: string;
  editable?: boolean;
}

/**
 * Controlled Tiptap wrapper. `value` is the source of truth (HTML); external
 * resets (e.g. form.reset) are synced in without clobbering the cursor on
 * normal typing. `immediatelyRender: false` is required for Next.js SSR.
 */
export function RichTextEditor({
  value,
  onChange,
  placeholder = "Start writing…",
  dir = "ltr",
  className,
  editable = true,
}: RichTextEditorProps) {
  const editor = useEditor({
    immediatelyRender: false,
    editable,
    extensions: buildExtensions(placeholder),
    content: value,
    editorProps: {
      attributes: {
        dir,
        class: cn(
          "prose prose-sm dark:prose-invert max-w-none min-h-[160px] px-3.5 py-3 focus:outline-none",
          "prose-headings:font-semibold prose-p:my-2 prose-a:text-primary",
        ),
      },
    },
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
  });

  // Keep the editor in sync when the value is reset/replaced externally.
  React.useEffect(() => {
    if (!editor) return;
    if (value !== editor.getHTML()) {
      editor.commands.setContent(value, { emitUpdate: false });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, editor]);

  return (
    <div
      className={cn(
        "overflow-hidden rounded-lg border bg-background focus-within:ring-2 focus-within:ring-ring/40",
        className,
      )}
    >
      {editable && <EditorToolbar editor={editor} />}
      <EditorContent editor={editor} />
    </div>
  );
}
