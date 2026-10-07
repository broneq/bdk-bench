import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";

import { compareSeries, runCompare } from "./compare.ts";
import type { ResultRow } from "./results.ts";

const dirs: string[] = [];
afterEach(() => {
  for (const dir of dirs.splice(0)) rmSync(dir, { recursive: true, force: true });
});

const A = "a".repeat(40);
const B = "b".repeat(40);

function row(
  series: string,
  run: number,
  metrics: Record<string, number | null>,
  over: Partial<ResultRow> = {},
): ResultRow {
  return {
    suite: "regression",
    series,
    workflow: "plain",
    item: "audit-csv",
    run,
    discarded: null,
    cost: 10 + run,
    metrics,
    provenance: {
      models: ["claude-opus-5-5"],
      fixtureCommit: null,
      benchCommit: series === "old" ? A : B,
      adapter: { name: "plain", version: "1" },
    },
    ...over,
  };
}

describe("compareSeries", () => {
  const baseline = [row("old", 1, { hidden: 0 }), row("old", 2, { hidden: 0 })];
  const candidate = [
    row("new", 1, { hidden: 1 }),
    row("new", 2, { hidden: 1 }),
    row("new", 3, { hidden: 0 }, { discarded: "MCP tool call mcp__x" }),
  ];

  it("names both series' models and bench commits", () => {
    const lines = compareSeries(
      "regression",
      { name: "old", rows: baseline },
      { name: "new", rows: candidate },
    );
    expect(lines.slice(0, 5)).toEqual([
      "# regression: old vs new",
      "",
      "- baseline old: models claude-opus-5-5; bench aaaaaaa; 2 counted, 0 discarded",
      "- candidate new: models claude-opus-5-5; bench bbbbbbb; 2 counted, 1 discarded",
      "",
    ]);
  });

  it("applies the difference rule per workflow, item and metric, cost included, without discarded rows", () => {
    const lines = compareSeries(
      "regression",
      { name: "old", rows: baseline },
      { name: "new", rows: candidate },
    );
    expect(lines).toContain(
      "| plain | audit-csv | hidden | 0 [0..0] | 1 [1..1] | candidate higher (gap 1, noise 0) |",
    );
    expect(lines).toContain(
      "| plain | audit-csv | cost | 11.50 [11..12] | 11.50 [11..12] | no measurable difference (gap 0, noise 1) |",
    );
  });

  it("marks a workflow or item that one series lacks", () => {
    const other = [row("new", 1, { hidden: 1 }, { workflow: "other" })];
    const lines = compareSeries(
      "regression",
      { name: "old", rows: baseline },
      { name: "new", rows: other },
    );
    expect(lines).toContain(
      "| plain | audit-csv | hidden | 0 [0..0] | n/a | fewer than 2 counted runs |",
    );
    expect(lines).toContain(
      "| other | audit-csv | hidden | n/a | 1 [1..1] | fewer than 2 counted runs |",
    );
  });
});

describe("compareSeries with one counted run per side", () => {
  it("prints both values and says fewer than 2 counted runs", () => {
    const lines = compareSeries(
      "regression",
      { name: "old", rows: [row("old", 1, { hidden: 0 })] },
      { name: "new", rows: [row("new", 1, { hidden: 1 })] },
    );
    expect(lines).toContain(
      "| plain | audit-csv | hidden | 0 [0..0] | 1 [1..1] | fewer than 2 counted runs |",
    );
  });
});

describe("runCompare", () => {
  function results(): string {
    const dir = mkdtempSync(join(tmpdir(), "bench-compare-"));
    dirs.push(dir);
    mkdirSync(join(dir, "regression"));
    writeFileSync(
      join(dir, "regression/old.jsonl"),
      `${JSON.stringify(row("old", 1, { hidden: 0 }))}\n`,
    );
    writeFileSync(
      join(dir, "regression/new.jsonl"),
      `${JSON.stringify(row("new", 1, { hidden: 1 }))}\n`,
    );
    return dir;
  }

  it("prints the comparison of two series", () => {
    const out: string[] = [];
    expect(
      runCompare(results(), "regression", "old", "new", {
        print: (line) => out.push(line),
        printError: () => undefined,
      }),
    ).toBe(0);
    expect(out[0]).toBe("# regression: old vs new");
  });

  it("exits 2 for a series without rows, listing the suite's series", () => {
    const err: string[] = [];
    const code = runCompare(results(), "regression", "old", "nope", {
      print: () => undefined,
      printError: (line) => err.push(line),
    });
    expect(code).toBe(2);
    expect(err).toEqual(["regression has no rows of series nope; its series: new, old"]);
  });
});
