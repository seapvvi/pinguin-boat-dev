import { describe, it, expect } from "vitest";
import { filterEntries, fuzzyScore } from "../fuzzy";

const entries = [
  { id: "a", label: "the harbour", group: "servers", href: "/servers/1" },
  { id: "b", label: "moderation", group: "pages", href: "/moderation" },
  {
    id: "c",
    label: "welcome",
    group: "pages",
    href: "/welcome",
    keywords: "autorole",
  },
];

describe("command palette search", () => {
  it("ranks a direct substring above a scattered subsequence", () => {
    expect(fuzzyScore("mod", "moderation")!).toBeGreaterThan(
      fuzzyScore("mdrtn", "moderation")!,
    );
    expect(fuzzyScore("xyz", "moderation")).toBeNull();
    expect(fuzzyScore("", "anything")).toBe(0);
  });

  it("returns every entry (capped) for an empty query and filters otherwise", () => {
    expect(filterEntries(entries, "", 2)).toHaveLength(2);
    expect(filterEntries(entries, "harb", 5).map((e) => e.id)).toEqual(["a"]);
    expect(filterEntries(entries, "wel", 5)[0].id).toBe("c");
    expect(filterEntries(entries, "autorole", 5).map((e) => e.id)).toEqual([
      "c",
    ]);
  });
});
