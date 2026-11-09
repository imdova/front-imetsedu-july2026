/**
 * Invisible and look-alike characters that end up in emails entered by an
 * Arabic-speaking team, which make an address that LOOKS right fail validation:
 *
 *  - direction marks (LRM/RLM/ALM) and zero-width characters, which come along
 *    when an address is copied out of WhatsApp, Excel or an RTL chat — they are
 *    invisible and `String.trim()` does not remove them;
 *  - Arabic-Indic / Eastern Arabic-Indic digits (٠-٩, ۰-۹), which an Arabic
 *    keyboard produces and which render almost identically to 0-9.
 *
 * Neither can be part of a real address, so stripping/converting them recovers
 * what the person meant. Anything else that is wrong with the address is left
 * alone for the validator to report.
 */
const INVISIBLE = /[­؜​-‏‪-‮⁠-⁤﻿]/g;

export function cleanEmail(raw: string): string {
  return String(raw ?? "")
    .replace(INVISIBLE, "")
    .replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 0x0660))
    .replace(/[۰-۹]/g, (d) => String(d.charCodeAt(0) - 0x06f0))
    .trim();
}
