"use client";

import type { Editor } from "@tiptap/react";
import {
  Bold,
  Italic,
  Strikethrough,
  List,
  ListOrdered,
  Heading2,
  Heading3,
  Quote,
  Undo2,
  Redo2,
  Link2,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Toggle } from "@/components/shared/rich-text-editor/toggle";
import { Separator } from "@/components/ui/separator";

interface Props {
  editor: Editor | null;
}

/** Formatting toolbar — reads/writes active state straight off the editor. */
export function EditorToolbar({ editor }: Props) {
  if (!editor) return null;

  const setLink = () => {
    const previous = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("Link URL", previous ?? "https://");
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };

  return (
    <div className="flex flex-wrap items-center gap-0.5 border-b bg-muted/40 p-1.5">
      <Toggle
        pressed={editor.isActive("bold")}
        onClick={() => editor.chain().focus().toggleBold().run()}
        label="Bold"
      >
        <Bold className="size-4" />
      </Toggle>
      <Toggle
        pressed={editor.isActive("italic")}
        onClick={() => editor.chain().focus().toggleItalic().run()}
        label="Italic"
      >
        <Italic className="size-4" />
      </Toggle>
      <Toggle
        pressed={editor.isActive("strike")}
        onClick={() => editor.chain().focus().toggleStrike().run()}
        label="Strikethrough"
      >
        <Strikethrough className="size-4" />
      </Toggle>

      <Separator orientation="vertical" className="mx-1 !h-6" />

      <Toggle
        pressed={editor.isActive("heading", { level: 2 })}
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        label="Heading 2"
      >
        <Heading2 className="size-4" />
      </Toggle>
      <Toggle
        pressed={editor.isActive("heading", { level: 3 })}
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        label="Heading 3"
      >
        <Heading3 className="size-4" />
      </Toggle>

      <Separator orientation="vertical" className="mx-1 !h-6" />

      <Toggle
        pressed={editor.isActive("bulletList")}
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        label="Bullet list"
      >
        <List className="size-4" />
      </Toggle>
      <Toggle
        pressed={editor.isActive("orderedList")}
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        label="Numbered list"
      >
        <ListOrdered className="size-4" />
      </Toggle>
      <Toggle
        pressed={editor.isActive("blockquote")}
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        label="Quote"
      >
        <Quote className="size-4" />
      </Toggle>
      <Toggle
        pressed={editor.isActive("link")}
        onClick={setLink}
        label="Link"
      >
        <Link2 className="size-4" />
      </Toggle>

      <Separator orientation="vertical" className="mx-1 !h-6" />

      <Toggle
        pressed={false}
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().undo()}
        label="Undo"
      >
        <Undo2 className="size-4" />
      </Toggle>
      <Toggle
        pressed={false}
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().redo()}
        label="Redo"
      >
        <Redo2 className={cn("size-4")} />
      </Toggle>
    </div>
  );
}
