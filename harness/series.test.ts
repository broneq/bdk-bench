import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";

import {
  expandTests,
  freshSeriesName,
  seriesStamp,
  literalVar,
  readPlan,
  runPaths,
  varValue,
  writePlan,
} from "./series.ts";
import type { SeriesPlan } from "./series.ts";

const dirs: string[] = [];
afterEach(() => {
  for (const dir of dirs.splice(0)) rmSync(dir, { recursive: true, force: true });
});

function planIn(dir: string): SeriesPlan {
  return {
    suite: "smoke",
    series: "probe-x",
    ledgerFile: join(dir, "budget.json"),
    budgetUsd: 100,
    runCapUsd: 15,
    resultsFile: join(dir, "rows.jsonl"),
    rawDir: join(dir, "raw"),
    sandboxDir: join(dir, "sandbox"),
    debugDir: join(dir, "debug"),
    workflows: {},
  };
}

describe("expandTests", () => {
  it("emits one test per run and item, runs outermost, each holding its item and run", () => {
    const tests = expandTests(
      [
        { id: "a", vars: { q: "x" } },
        { id: "b", vars: { q: "y" } },
      ],
      3,
    );
    expect(tests.map((test) => test.description)).toEqual([
      "a run 1",
      "b run 1",
      "a run 2",
      "b run 2",
      "a run 3",
      "b run 3",
    ]);
    expect(tests[1]).toEqual({
      description: "b run 1",
      vars: { q: "y", bench_item: "b", bench_run: "1" },
      options: { disableVarExpansion: true },
    });
  });

  it("wraps a var with template syntax in a raw block and varValue returns the original", () => {
    const [test] = expandTests([{ id: "p", vars: { x: "{{ x }}" } }], 1);
    expect(test?.vars.x).toBe("{% raw %}{{ x }}{% endraw %}");
    expect(varValue(test?.vars.x ?? "")).toBe("{{ x }}");
  });

  it("keeps an item's assertions", () => {
    const [test] = expandTests(
      [{ id: "t", vars: {}, assert: [{ type: "contains", value: "x" }] }],
      1,
    );
    expect(test?.assert).toEqual([{ type: "contains", value: "x" }]);
  });
});

describe("literalVar", () => {
  it("leaves a value without template syntax as it is", () => {
    expect(literalVar("plain { text }")).toBe("plain { text }");
    expect(varValue("plain { text }")).toBe("plain { text }");
  });

  it("refuses a value that contains an endraw tag", () => {
    expect(() => literalVar("{{ x }} {% endraw %}")).toThrow(/endraw/);
  });
});

describe("runPaths", () => {
  it("keeps the layout of a run's working copy, config home and debug log", () => {
    const plan = planIn("/s");
    expect(runPaths(plan, "plain", "hello", 2)).toEqual({
      workDir: "/s/sandbox/runs/plain/hello.run-2/work",
      configHome: "/s/sandbox/runs/plain/hello.run-2/config-home",
      debugFile: "/s/debug/plain/hello.run-2.log",
    });
  });

  it("shares no directory or debug file between workflows or runs", () => {
    const plan = planIn("/s");
    const all = [
      runPaths(plan, "a", "t", 1),
      runPaths(plan, "b", "t", 1),
      runPaths(plan, "a", "t", 2),
    ];
    for (const key of ["workDir", "configHome", "debugFile"] as const) {
      expect(new Set(all.map((paths) => paths[key])).size).toBe(all.length);
    }
  });
});

describe("series plan", () => {
  it("round-trips through its file", () => {
    const dir = mkdtempSync(join(tmpdir(), "bench-series-"));
    dirs.push(dir);
    const plan: SeriesPlan = {
      ...planIn(dir),
      workflows: {
        plain: {
          expectedPlugins: 0,
          fixtureBase: "/base",
          provenance: {
            fixtureCommit: "abc",
            benchCommit: "def",
            adapter: { name: "plain", version: "1.0.0" },
          },
          settings: {},
        },
      },
    };
    writePlan(join(dir, "plan.json"), plan);
    expect(readPlan(join(dir, "plan.json"))).toEqual(plan);
  });

  it("refuses a missing plan, naming the variable", () => {
    expect(() => readPlan(undefined)).toThrow(/BENCH_SERIES/);
    expect(() => readPlan("/nonexistent/plan.json")).toThrow(/BENCH_SERIES/);
  });
});

describe("seriesStamp", () => {
  it("names the UTC date and time to the second", () => {
    expect(seriesStamp(new Date("2026-10-05T08:00:13Z"))).toBe("2026-10-05-080013");
  });
});

describe("freshSeriesName", () => {
  it("adds a counter when the name is taken", () => {
    const taken = new Set(["probe-x"]);
    expect(freshSeriesName("probe-x", (name) => taken.has(name))).toBe("probe-x-2");
    expect(freshSeriesName("probe-y", (name) => taken.has(name))).toBe("probe-y");
  });
});
