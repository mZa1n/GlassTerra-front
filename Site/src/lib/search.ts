/**
 * Catalog search.
 *
 * Matching is word-oriented rather than a raw substring test: "кр" finds
 * «Кружка» because it is a prefix of a word, and a match near the start of the
 * name outranks one buried in the description. Every match reports the exact
 * character ranges it covered, so the UI can highlight what the user typed.
 */

export interface MatchRange {
  start: number;
  end: number;
}

interface FieldMatch {
  score: number;
  ranges: MatchRange[];
}

/** How a single term lined up with the text, best first. */
const KIND_SCORE = {
  exactWord: 1000,
  textPrefix: 900,
  wordPrefix: 700,
  infix: 350,
  subsequence: 120,
} as const;

/** RU layout typed on an EN keyboard: "rhe;rf" is "кружка". */
const LAYOUT_EN_TO_RU: Record<string, string> = {
  q: "й", w: "ц", e: "у", r: "к", t: "е", y: "н", u: "г", i: "ш", o: "щ", p: "з",
  "[": "х", "]": "ъ", a: "ф", s: "ы", d: "в", f: "а", g: "п", h: "р", j: "о",
  k: "л", l: "д", ";": "ж", "'": "э", z: "я", x: "ч", c: "с", v: "м", b: "и",
  n: "т", m: "ь", ",": "б", ".": "ю",
};

/**
 * Lowercases and folds ё→е one character at a time, so every index in the
 * result still points at the same character in the original string.
 */
function normalize(text: string): string {
  let out = "";

  for (const char of text) {
    const lower = char.toLowerCase();
    const folded = lower === "ё" ? "е" : lower;
    // A character whose lowercase form has a different length would break the
    // index mapping; keep the original in that case.
    out += folded.length === char.length ? folded : char;
  }

  return out;
}

const switchLayout = (text: string) =>
  [...text].map((char) => LAYOUT_EN_TO_RU[char] ?? char).join("");

const isWordChar = (char: string) => /[\p{L}\p{N}]/u.test(char);

/** Start index of every word in the normalised text. */
function wordStarts(text: string): number[] {
  const starts: number[] = [];

  for (let index = 0; index < text.length; index += 1) {
    const current = text[index] ?? "";
    const previous = index === 0 ? "" : (text[index - 1] ?? "");
    if (isWordChar(current) && !isWordChar(previous)) starts.push(index);
  }

  return starts;
}

const wordEnd = (text: string, start: number) => {
  let end = start;
  while (end < text.length && isWordChar(text[end] ?? "")) end += 1;
  return end;
};

/** Shortest term that may be matched out of order — below this it is noise. */
const MIN_FUZZY_TERM = 4;

/** A fuzzy match may not sprawl further than this multiple of the term length. */
const MAX_FUZZY_SPREAD = 3;

/**
 * In-order character match, used only as a last resort. Deliberately strict:
 * the matched characters must stay close together, otherwise a short query
 * would match almost every product in the catalog.
 */
function subsequenceRanges(text: string, term: string): MatchRange[] | null {
  if (term.length < MIN_FUZZY_TERM) return null;

  const starts = new Set(wordStarts(text));

  // Try every word as an anchor: a fuzzy match that begins mid-word is almost
  // always a coincidence ("таре" would otherwise reach into «сТАкan … гРанЕный»).
  for (const anchor of starts) {
    if (text[anchor] !== term[0]) continue;

    const ranges: MatchRange[] = [];
    let cursor = anchor;
    let matched = true;

    for (const char of term) {
      const found = text.indexOf(char, cursor);
      if (found === -1) {
        matched = false;
        break;
      }

      const last = ranges.at(-1);
      if (last && last.end === found) last.end = found + 1;
      else ranges.push({ start: found, end: found + 1 });

      cursor = found + 1;
    }

    const final = ranges.at(-1);
    if (!matched || !final) continue;
    if (final.end - anchor > term.length * MAX_FUZZY_SPREAD) continue;

    return ranges;
  }

  return null;
}

/**
 * Best match of one term against one already-normalised field.
 * `allowFuzzy` is off for long free text, where an out-of-order match says
 * almost nothing about relevance.
 */
function matchTerm(text: string, term: string, allowFuzzy: boolean): FieldMatch | null {
  if (text.startsWith(term)) {
    return { score: KIND_SCORE.textPrefix, ranges: [{ start: 0, end: term.length }] };
  }

  for (const start of wordStarts(text)) {
    if (!text.startsWith(term, start)) continue;

    const end = wordEnd(text, start);
    const isWholeWord = end - start === term.length;
    return {
      score: (isWholeWord ? KIND_SCORE.exactWord : KIND_SCORE.wordPrefix) - start,
      ranges: [{ start, end: start + term.length }],
    };
  }

  const infix = text.indexOf(term);
  if (infix !== -1) {
    return { score: KIND_SCORE.infix - infix, ranges: [{ start: infix, end: infix + term.length }] };
  }

  if (allowFuzzy) {
    const ranges = subsequenceRanges(text, term);
    if (ranges) return { score: KIND_SCORE.subsequence, ranges };
  }

  return null;
}

function mergeRanges(ranges: MatchRange[]): MatchRange[] {
  if (ranges.length < 2) return ranges;

  const sorted = [...ranges].sort((a, b) => a.start - b.start);
  const merged: MatchRange[] = [];

  for (const range of sorted) {
    const last = merged.at(-1);
    if (last && range.start <= last.end) last.end = Math.max(last.end, range.end);
    else merged.push({ ...range });
  }

  return merged;
}

/** Splits a query into terms, retrying in the other keyboard layout if needed. */
export function parseQuery(query: string): { terms: string[]; layoutFixed: string[] } {
  const split = (value: string) =>
    normalize(value)
      .split(/[^\p{L}\p{N}]+/u)
      .filter(Boolean);

  return { terms: split(query), layoutFixed: split(switchLayout(normalize(query))) };
}

/** Matches every term against one field. Returns null unless all of them hit. */
export function matchField(
  text: string,
  terms: readonly string[],
  allowFuzzy = true,
): FieldMatch | null {
  if (terms.length === 0) return { score: 0, ranges: [] };

  const normalized = normalize(text);
  const ranges: MatchRange[] = [];
  let score = 0;

  for (const term of terms) {
    const match = matchTerm(normalized, term, allowFuzzy);
    if (!match) return null;

    score += match.score;
    ranges.push(...match.ranges);
  }

  return { score, ranges: mergeRanges(ranges) };
}

/**
 * Character ranges to highlight in `text` for `query`.
 * Safe to call per render — it does no allocation beyond the ranges.
 */
export function highlightRanges(text: string, query: string): MatchRange[] {
  const { terms, layoutFixed } = parseQuery(query);
  return matchField(text, terms)?.ranges ?? matchField(text, layoutFixed)?.ranges ?? [];
}

export interface SearchableFields {
  name: string;
  category: string;
  description: string;
}

export interface SearchHit<T> {
  item: T;
  score: number;
  nameRanges: MatchRange[];
  categoryRanges: MatchRange[];
}

const FIELD_WEIGHT = { name: 1, category: 0.6, description: 0.3 } as const;

function scoreWith<T>(
  items: readonly T[],
  terms: readonly string[],
  fields: (item: T) => SearchableFields,
): SearchHit<T>[] {
  const hits: SearchHit<T>[] = [];

  for (const item of items) {
    const { name, category, description } = fields(item);

    const nameMatch = matchField(name, terms);
    const categoryMatch = matchField(category, terms);
    // Descriptions are long: an out-of-order hit there is almost always noise.
    const descriptionMatch = matchField(description, terms, false);

    // A term may be satisfied by any field, but at least one field must match
    // all of them — otherwise "кружка ваза" would match everything.
    if (!nameMatch && !categoryMatch && !descriptionMatch) continue;

    const score =
      (nameMatch?.score ?? 0) * FIELD_WEIGHT.name +
      (categoryMatch?.score ?? 0) * FIELD_WEIGHT.category +
      (descriptionMatch?.score ?? 0) * FIELD_WEIGHT.description;

    hits.push({
      item,
      // Shorter names win ties: «Кружка «Уют»» before «Кружка с крышкой, термо».
      score: score - name.length * 0.1,
      nameRanges: nameMatch?.ranges ?? [],
      categoryRanges: categoryMatch?.ranges ?? [],
    });
  }

  return hits.sort((a, b) => b.score - a.score);
}

/**
 * Ranks `items` against `query`. Falls back to the swapped keyboard layout
 * when the query as typed matches nothing.
 */
export function search<T>(
  items: readonly T[],
  query: string,
  fields: (item: T) => SearchableFields,
): SearchHit<T>[] {
  const { terms, layoutFixed } = parseQuery(query);
  if (terms.length === 0) return [];

  const direct = scoreWith(items, terms, fields);
  if (direct.length > 0) return direct;

  const sameQuery = layoutFixed.join(" ") === terms.join(" ");
  return sameQuery ? [] : scoreWith(items, layoutFixed, fields);
}
