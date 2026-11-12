export interface FuzzyEntry {
  id: string;
  label: string;
  group: string;
  href: string;
  hint?: string;
  keywords?: string;
}

/** Subsequence match: "mdrtn" finds "moderation". Contiguous runs score higher. */
export function fuzzyScore(query: string, text: string): number | null {
  if (!query) return 0;
  const q = query.toLowerCase();
  const t = text.toLowerCase();
  const direct = t.indexOf(q);
  if (direct !== -1) return 100 - direct + (direct === 0 ? 50 : 0);

  let score = 0;
  let ti = 0;
  let last = -2;
  for (let qi = 0; qi < q.length; qi += 1) {
    const found = t.indexOf(q[qi], ti);
    if (found === -1) return null;
    score += found === last + 1 ? 3 : 1;
    if (found === 0) score += 2;
    last = found;
    ti = found + 1;
  }
  return score;
}

export function filterEntries<T extends FuzzyEntry>(
  entries: T[],
  query: string,
  limit = 12,
): T[] {
  return entries
    .map((entry) => ({
      entry,
      score: fuzzyScore(query.trim(), `${entry.label} ${entry.keywords ?? ""}`),
    }))
    .filter((row): row is { entry: T; score: number } => row.score !== null)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((row) => row.entry);
}
