import { createElement } from "react";
import { __iconNode as flame } from "lucide-react/dist/esm/icons/flame.mjs";
import { __iconNode as star } from "lucide-react/dist/esm/icons/star.mjs";
import { __iconNode as graduationCap } from "lucide-react/dist/esm/icons/graduation-cap.mjs";
import { __iconNode as radio } from "lucide-react/dist/esm/icons/radio.mjs";
import { __iconNode as languages } from "lucide-react/dist/esm/icons/languages.mjs";
import { __iconNode as calendarDays } from "lucide-react/dist/esm/icons/calendar-days.mjs";
import { __iconNode as users } from "lucide-react/dist/esm/icons/users.mjs";
import { __iconNode as monitor } from "lucide-react/dist/esm/icons/monitor.mjs";
import { __iconNode as arrowRight } from "lucide-react/dist/esm/icons/arrow-right.mjs";

import type { CardIconName } from "./card-icons";

type IconNode = [tag: string, attrs: Record<string, string>][];

/** Must list every name in `CardIconName`; the type below enforces it. */
const ICONS: Record<CardIconName, IconNode> = {
  flame,
  star,
  "graduation-cap": graduationCap,
  radio,
  languages,
  "calendar-days": calendarDays,
  users,
  monitor,
  "arrow-right": arrowRight,
};

/**
 * The paths behind `<CardIcon>`. Server-rendered, once per page, hidden.
 *
 * `width`/`height` of 0 with absolute positioning rather than `display: none`:
 * some browsers do not resolve `<use>` into a `display: none` subtree.
 */
export function CardIconSprite() {
  return (
    <svg aria-hidden="true" focusable="false" width="0" height="0" style={{ position: "absolute" }}>
      {Object.entries(ICONS).map(([name, nodes]) => (
        <symbol key={name} id={`ic-${name}`} viewBox="0 0 24 24">
          {nodes.map(([tag, { key, ...attrs }]) => createElement(tag, { key, ...attrs }))}
        </symbol>
      ))}
    </svg>
  );
}
