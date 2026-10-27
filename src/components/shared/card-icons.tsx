import type { SVGProps } from "react";

/**
 * Icons used on repeated cards, drawn from a shared sprite.
 *
 * A lucide icon renders as a ~450-byte inline `<svg>`, most of it identical
 * attribute boilerplate. A course card carries ten of them, so a 19-card catalog
 * shipped ~85 KB of icons — and the same card appears on the home, course and
 * category pages. `<CardIcon>` is the ~100-byte reference, and `<CardIconSprite>`
 * (rendered once, in the public layout) holds the paths.
 *
 * Stroke, fill and caps live on the `.ico` class in globals.css, so the result is
 * drawn exactly as the lucide original: the symbols contain bare paths and
 * everything else is inherited from the referencing `<svg>`.
 *
 * To add an icon, add its name here and its path import to the sprite; the
 * sprite is typed as `Record<CardIconName, …>`, so forgetting one is a compile
 * error rather than an icon that silently renders as nothing.
 */
export type CardIconName =
  | "flame"
  | "star"
  | "graduation-cap"
  | "radio"
  | "languages"
  | "calendar-days"
  | "users"
  | "monitor"
  | "arrow-right";

export function CardIcon({
  name,
  className,
  ...rest
}: { name: CardIconName } & Omit<SVGProps<SVGSVGElement>, "name" | "children">) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={className ? `ico ${className}` : "ico"}
      {...rest}
    >
      <use href={`#ic-${name}`} />
    </svg>
  );
}
