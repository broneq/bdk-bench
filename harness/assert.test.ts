import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";

import { gradeOf, gradeRun, namedScores } from "./assert.ts";
import type { SuiteHooks } from "./hook.ts";
import type { SeriesPlan } from "./series.ts";

const dirs: string[] = [];
afterEach(() => {
  for (const dir of dirs.splice(0)) rmSync(dir, { recursive: true, force: true });
});

const SHA = "b".repeat(40);
const CLEAN_LOG = "Loaded 1 directory-loaded plugins\n[claudeai-mcp] Disabled via env var\n";

function series(): { dir: string; plan: SeriesPlan } {
  const dir = mkdtempSync(join(tmpdir(), "bench-assert-"));
  dirs.push(dir);
  const plan: SeriesPlan = {
    suite: "tasks",
    series: "s1",
    ledgerFile: join(dir, "budget.json"),
    budgetUsd: 10,
    runCapUsd: 3,
    resultsFile: join(dir, "rows.jsonl"),
    rawDir: join(dir, "raw"),
    sandboxDir: join(dir, "sandbox"),
    debugDir: join(dir, "debug"),
    workflows: {
      plain: {
        expectedPlugins: 1,
        fixtureBase: null,
        provenance: {
          fixtureCommit: SHA,
          benchCommit: SHA,
          adapter: { name: "plain", version: "1.0.0" },
        },
        settings: {},
      },
    },
  };
  return { dir, plan };
}

const HOOKS: SuiteHooks = {
  measure: () =>
    Promise.resolve({
      metrics: { hidden: 1, quality: 0.5, cost_usd: 4.2, turns: 80, wall_s: null },
      extraCost: 0.1,
      models: ["claude-sonnet-5-5"],
    }),
  passOf: (metrics) => metrics.hidden === 1,
};

const CONTEXT = {
  vars: { bench_item: "audit-csv", bench_run: "1" },
  providerResponse: { cost: 4, metadata: { benchWorkflow: "plain", toolCalls: [] } },
};

function log(dir: string, text: string): void {
  mkdirSync(join(dir, "debug/plain"), { recursive: true });
  writeFileSync(join(dir, "debug/plain/audit-csv.run-1.log"), text);
}

describe("namedScores", () => {
  it("keeps only the metrics in [0, 1], which the viewer shows as a share of their maximum", () => {
    expect(namedScores({ a: 1, b: 0.5, c: 7, d: null, e: -1 })).toEqual({ a: 1, b: 0.5 });
  });
});

describe("gradeOf", () => {
  const measured = {
    discarded: null,
    metrics: { hidden: 0, quality: 0.5, turns: 3 },
    extraCost: 0,
    models: [],
  };

  it("fails from the suite's passOf and lists the scores below 1", () => {
    expect(gradeOf(measured, HOOKS)).toEqual({
      pass: false,
      score: 0,
      reason: "failed: hidden=0, quality=0.5",
      namedScores: { hidden: 0, quality: 0.5 },
    });
  });

  it("passes every counted run of a suite without passOf", () => {
    expect(gradeOf(measured, {})).toMatchObject({ pass: true, score: 1, reason: "counted" });
  });

  it("fails a discarded run with its reason", () => {
    expect(gradeOf({ ...measured, discarded: "MCP tool call mcp__x" }, HOOKS)).toEqual({
      pass: false,
      score: 0,
      reason: "discarded: MCP tool call mcp__x",
      namedScores: {},
    });
  });
});

describe("gradeRun", () => {
  it("measures the run of the response's workflow and writes measurement.json in its raw directory", async () => {
    const { dir, plan } = series();
    log(dir, CLEAN_LOG);
    const grade = await gradeRun(CONTEXT, {
      plan: () => plan,
      hooks: () => Promise.resolve(HOOKS),
    });
    expect(grade).toMatchObject({ pass: true, namedScores: { hidden: 1, quality: 0.5 } });
    const file = join(dir, "raw/plain/audit-csv.run-1/measurement.json");
    expect(JSON.parse(readFileSync(file, "utf8"))).toEqual({
      discarded: null,
      metrics: { hidden: 1, quality: 0.5, cost_usd: 4.2, turns: 80, wall_s: null },
      extraCost: 0.1,
      models: ["claude-sonnet-5-5"],
    });
  });

  it("discards a run that is not isolated without measuring it", async () => {
    const { dir, plan } = series();
    log(dir, CLEAN_LOG.replace("Loaded 1", "Loaded 2"));
    let measured = false;
    const hooks: SuiteHooks = {
      measure: (context, result) => {
        measured = true;
        return HOOKS.measure(context, result);
      },
    };
    const grade = await gradeRun(CONTEXT, {
      plan: () => plan,
      hooks: () => Promise.resolve(hooks),
    });
    expect(measured).toBe(false);
    expect(grade.reason).toMatch(/^discarded: .*2 directory-loaded plugins/);
  });

  it("discards a run whose measurement throws, with the error text", async () => {
    const { dir, plan } = series();
    log(dir, CLEAN_LOG);
    const hooks: SuiteHooks = { measure: () => Promise.reject(new Error("vitest crashed")) };
    const grade = await gradeRun(CONTEXT, {
      plan: () => plan,
      hooks: () => Promise.resolve(hooks),
    });
    expect(grade.reason).toBe("discarded: harness error: vitest crashed");
  });
});
