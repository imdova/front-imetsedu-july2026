"use client";

import * as React from "react";

/** Animated typed text — types each phrase, pauses, deletes, then rotates to
 *  the next. Client island used by the block renderer; SSR emits the static
 *  prefix + empty phrase so hydration is stable and animation starts on mount. */
export function TypedTextBlock({ text, items }: { text?: string; items?: string[] }) {
  const key = (items ?? []).join("␟");
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const words = React.useMemo(() => (items && items.length ? items : []), [key]);
  const [wordIndex, setWordIndex] = React.useState(0);
  const [length, setLength] = React.useState(0);
  const [deleting, setDeleting] = React.useState(false);

  React.useEffect(() => {
    if (!words.length) return;
    const word = words[wordIndex % words.length] ?? "";
    let delay = deleting ? 45 : 95;
    if (!deleting && length >= word.length) delay = 1700; // hold the full phrase
    if (deleting && length === 0) delay = 350;
    const id = setTimeout(() => {
      if (!deleting) {
        if (length < word.length) setLength((l) => l + 1);
        else setDeleting(true);
      } else if (length > 0) {
        setLength((l) => l - 1);
      } else {
        setDeleting(false);
        setWordIndex((i) => (i + 1) % words.length);
      }
    }, delay);
    return () => clearTimeout(id);
  }, [words, wordIndex, length, deleting]);

  const current = words.length
    ? (words[wordIndex % words.length] ?? "").slice(0, length)
    : "";

  return (
    <div className="font-heading text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
      {text ? <span>{text} </span> : null}
      <span className="text-primary">
        {current}
        <span aria-hidden className="ms-0.5 inline-block animate-pulse select-none">|</span>
      </span>
    </div>
  );
}
