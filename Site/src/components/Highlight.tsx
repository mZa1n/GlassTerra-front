import { useMemo, type ReactNode } from "react";
import { highlightRanges, type MatchRange } from "@/lib/search";

interface HighlightProps {
  text: string;
  /** Precomputed ranges, or a query to derive them from. */
  ranges?: readonly MatchRange[];
  query?: string;
  className?: string;
}

/** Renders `text` with the matched fragments wrapped in <mark>. */
export function Highlight({ text, ranges, query, className }: HighlightProps) {
  const resolved = useMemo(
    () => ranges ?? (query ? highlightRanges(text, query) : []),
    [ranges, query, text],
  );

  if (resolved.length === 0) return <span className={className}>{text}</span>;

  const parts: ReactNode[] = [];
  let cursor = 0;

  resolved.forEach((range, index) => {
    if (range.start > cursor) parts.push(text.slice(cursor, range.start));

    parts.push(
      <mark
        key={index}
        className="rounded-[3px] bg-primary/15 px-0 font-medium text-primary dark:bg-primary/25"
      >
        {text.slice(range.start, range.end)}
      </mark>,
    );

    cursor = range.end;
  });

  if (cursor < text.length) parts.push(text.slice(cursor));

  return <span className={className}>{parts}</span>;
}
