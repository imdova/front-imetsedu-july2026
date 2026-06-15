import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Link from "@tiptap/extension-link";
import type { Extensions } from "@tiptap/react";

/**
 * Editor extensions are configured in one place so every Tiptap instance in the
 * app shares the same baseline. Add/remove capabilities here, not in the editor
 * component (keeps the wrapper a pure renderer).
 */
export function buildExtensions(placeholder: string): Extensions {
  return [
    StarterKit.configure({
      heading: { levels: [2, 3] },
      // keep the toolbar surface focused for course descriptions
      horizontalRule: false,
      codeBlock: false,
      // StarterKit v3 bundles Link; disable it so our configured one is the
      // single source (avoids the "duplicate extension" warning).
      link: false,
    }),
    Placeholder.configure({ placeholder }),
    Link.configure({
      openOnClick: false,
      autolink: true,
      HTMLAttributes: { class: "text-primary underline underline-offset-2" },
    }),
  ];
}
