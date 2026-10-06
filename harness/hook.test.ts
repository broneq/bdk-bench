import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";

import { BudgetReached, readLedger, record } from "./budget.ts";
import {
  afterRun,
  extensionHook,
  measureRun,
  recordJudgement,
  runContext,
  startRun,
} from "./hook.ts";
import type { EvalResult, Measured, SuiteHooks } from "./hook.ts";
import { readRows } from "./results.ts";
import type { SeriesPlan, WorkflowPlan } from "./series.ts";

const dirs: string[] = [];
afterEach(() => {
  for (const dir of dirs.splice(0)) rmSync(dir, { recursive: true, force: true });
});

const SHA = "f".repeat(40);
const CLEAN_LOG = "Loaded 1 directory-loaded plugins\n[claudeai-mcp] Disabled via env var\n";

function setup(workflow: (dir: string) => Partial<WorkflowPlan> = () => ({})): {
  dir: string;
  plan: SeriesPlan;
} {
  const dir = mkdtempSync(join(tmpdir(), "bench-hook-"));
  dirs.push(dir);
  const plan: SeriesPlan = {
    suite: "tasks",
    series: "s1",
    ledgerFile: join(dir, "budget.json"),
    budgetUsd: 10,
    runCapUsd: 3,
    resultsFile: join(dir, "results/s1.jsonl"),
    rawDir: join(dir, "raw"),
    sandboxDir: join(dir, "sandbox"),
    debugDir: join(dir, "debug"),
    workflows: {
      a: {
        expectedPlugins: 1,
        fixtureBase: null,
        provenance: {
          fixtureCommit: SHA,
          benchCommit: SHA,
          adapter: { name: "plain", version: "1.0.0" },
        },
        settings: {},
        ...workflow(dir),
      },
    },
  };
  return { dir, plan };
}

const VARS = { bench_item: "task", bench_run: "2" };

/** Writes the session log of run 2 of `task` in workflow `a`. */
function sessionLog(dir: string, text: string): void {
  mkdirSync(join(dir, "debug/a"), { recursive: true });
  writeFileSync(join(dir, "debug/a/task.run-2.log"), text);
}

const RESULT: EvalResult = {
  response: {
    cost: 1.5,
    metadata: { modelUsage: { "claude-opus-5-5": { costUSD: 1.5 } }, toolCalls: [] },
  },
};

const SESSION_STATS: EvalResult = {
  response: {
    cost: 1.5,
    metadata: {
      modelUsage: { "claude-opus-5-5": { costUSD: 1.5 } },
      toolCalls: [],
      numTurns: 7,
      wallMs: 12500,
    },
  },
};

const MEASURE: SuiteHooks = {
  measure: () =>
    Promise.resolve({ metrics: { completed: 1 }, extraCost: 0.25, models: ["claude-sonnet-5"] }),
};

describe("runContext", () => {
  it("reads item and run from the test vars and gives the run its own paths", () => {
    const { dir, plan } = setup();
    expect(runContext(plan, "a", VARS)).toMatchObject({
      workflowName: "a",
      item: "task",
      run: 2,
      paths: {
        workDir: join(dir, "sandbox/runs/a/task.run-2/work"),
        configHome: join(dir, "sandbox/runs/a/task.run-2/config-home"),
        debugFile: join(dir, "debug/a/task.run-2.log"),
      },
    });
  });

  it("gives the suite a var value unwrapped from its raw block", () => {
    const { plan } = setup();
    const diff = "{% raw %}+ <div x={{ a: 1 }} />{% endraw %}";
    expect(runContext(plan, "a", { ...VARS, diff }).vars.diff).toBe("+ <div x={{ a: 1 }} />");
  });

  it("refuses a run of an unknown workflow", () => {
    const { plan } = setup();
    expect(() => runContext(plan, "zz", VARS)).toThrow(/zz/);
    expect(() => runContext(plan, "", VARS)).toThrow(/\(none\)/);
  });
});

describe("startRun", () => {
  it("stops at the budget before it touches the run's directories", async () => {
    const { dir, plan } = setup();
    record(plan.ledgerFile, { suite: "x", workflow: "a", run: 1, cost: 10 });
    await expect(startRun(runContext(plan, "a", VARS), MEASURE)).rejects.toThrow(BudgetReached);
    expect(existsSync(join(dir, "sandbox"))).toBe(false);
  });
});

describe("measureRun", () => {
  it("measures an isolated run and writes measurement.json", async () => {
    const { dir, plan } = setup();
    sessionLog(dir, CLEAN_LOG);
    const measured = await measureRun(runContext(plan, "a", VARS), RESULT, MEASURE);
    expect(measured).toEqual({
      discarded: null,
      metrics: { completed: 1 },
      extraCost: 0.25,
      models: ["claude-sonnet-5"],
    });
    const file = join(dir, "raw/a/task.run-2/measurement.json");
    expect(JSON.parse(readFileSync(file, "utf8"))).toEqual(measured);
  });

  it("discards a run whose session log shows no isolation, without measuring it", async () => {
    const { dir, plan } = setup();
    sessionLog(dir, "Loaded 0 directory-loaded plugins\n");
    const measured = await measureRun(runContext(plan, "a", VARS), RESULT, {
      measure: () => Promise.reject(new Error("must not run")),
    });
    expect(measured.discarded).toMatch(/expected 1 directory-loaded plugin/);
    expect(measured.metrics).toEqual({});
  });

  it("discards a run whose measurement throws", async () => {
    const { dir, plan } = setup();
    sessionLog(dir, CLEAN_LOG);
    const measured = await measureRun(runContext(plan, "a", VARS), RESULT, {
      measure: () => Promise.reject(new Error("judge down")),
    });
    expect(measured.discarded).toBe("harness error: judge down");
  });
});

describe("afterRun", () => {
  const measured = (dir: string, value: Partial<Measured> = {}): void => {
    mkdirSync(join(dir, "raw/a/task.run-2"), { recursive: true });
    writeFileSync(
      join(dir, "raw/a/task.run-2/measurement.json"),
      JSON.stringify({
        discarded: null,
        metrics: { completed: 1 },
        extraCost: 0.25,
        models: ["claude-sonnet-5"],
        ...value,
      }),
    );
  };

  it("appends the row from the run's measurement and charges session and judge cost", () => {
    const { dir, plan } = setup();
    sessionLog(dir, CLEAN_LOG);
    measured(dir);
    const row = afterRun(runContext(plan, "a", VARS), RESULT);
    expect(row).toMatchObject({
      workflow: "a",
      item: "task",
      run: 2,
      discarded: null,
      cost: 1.75,
      metrics: { completed: 1 },
      provenance: {
        models: ["claude-opus-5-5", "claude-sonnet-5"],
        fixtureCommit: SHA,
        benchCommit: SHA,
        adapter: { name: "plain", version: "1.0.0" },
      },
    });
    expect(row).not.toHaveProperty("cell");
    expect(row).not.toHaveProperty("variantHash");
    expect(row?.provenance).not.toHaveProperty("templateHashes");
    expect(readRows(plan.resultsFile)).toEqual([row]);
    expect(readLedger(plan.ledgerFile).entries.map((entry) => entry.cost)).toEqual([1.75]);
    expect(existsSync(join(plan.rawDir, "a/task.run-2/debug.log"))).toBe(true);
  });

  it("records the session's turns and wall seconds next to the suite's metrics", () => {
    const { dir, plan } = setup();
    measured(dir);
    const row = afterRun(runContext(plan, "a", VARS), SESSION_STATS);
    expect(row?.metrics).toEqual({ completed: 1, turns: 7, wall_s: 12.5 });
  });

  it("records only turns and wall seconds for a run discarded by isolation", () => {
    const { dir, plan } = setup();
    measured(dir, { discarded: "MCP tool call mcp__x", metrics: {} });
    const row = afterRun(runContext(plan, "a", VARS), SESSION_STATS);
    expect(row?.discarded).toBe("MCP tool call mcp__x");
    expect(row?.metrics).toEqual({ turns: 7, wall_s: 12.5 });
  });

  it("leaves out a metric the session did not report", () => {
    const { dir, plan } = setup();
    measured(dir);
    const row = afterRun(runContext(plan, "a", VARS), {
      response: { cost: 1, metadata: { wallMs: 2000 } },
    });
    expect(row?.metrics).toEqual({ completed: 1, wall_s: 2 });
    expect(row?.metrics).not.toHaveProperty("turns");
  });

  it("replaces a suite metric of the same name with the harness value", () => {
    const { dir, plan } = setup();
    measured(dir, { metrics: { turns: 99 } });
    const row = afterRun(runContext(plan, "a", VARS), SESSION_STATS);
    expect(row?.metrics).toEqual({ turns: 7, wall_s: 12.5 });
  });

  it("puts every metric in the response's metadata, where the viewer shows it", () => {
    const { dir, plan } = setup();
    measured(dir);
    const result: EvalResult = { response: { cost: 1, metadata: { numTurns: 4 } } };
    afterRun(runContext(plan, "a", VARS), result);
    expect(result.response?.metadata?.metrics).toEqual({ completed: 1, turns: 4 });
  });

  it("keeps the measurement's discard reason", () => {
    const { dir, plan } = setup();
    measured(dir, { discarded: "MCP tool call mcp__x", metrics: {} });
    expect(afterRun(runContext(plan, "a", VARS), RESULT)?.discarded).toBe("MCP tool call mcp__x");
  });

  it("discards a provider error and a run the assertion never measured", () => {
    const { dir, plan } = setup();
    measured(dir);
    const failed = afterRun(runContext(plan, "a", VARS), {
      ...RESULT,
      error: "max budget exceeded",
    });
    expect(failed?.discarded).toBe("provider error: max budget exceeded");
    rmSync(join(dir, "raw/a/task.run-2/measurement.json"));
    expect(afterRun(runContext(plan, "a", VARS), RESULT)?.discarded).toBe(
      "harness error: no measurement",
    );
  });

  it("counts a run whose assertion failed, since promptfoo reports that failure as its error", () => {
    const { dir, plan } = setup();
    measured(dir);
    const row = afterRun(runContext(plan, "a", VARS), {
      ...RESULT,
      error: "failed: hidden=0",
      failureReason: 1,
    });
    expect(row?.discarded).toBeNull();
  });

  it("scores the item's own assertions without the harness assertion", () => {
    const { dir, plan } = setup();
    measured(dir, { metrics: { completed: 1 } });
    const harness = { type: "javascript", value: "file:///x/bench/harness/assert.ts:grade" };
    const row = afterRun(runContext(plan, "a", VARS), {
      ...RESULT,
      gradingResult: {
        pass: false,
        score: 0.5,
        componentResults: [
          { pass: true, score: 1, assertion: harness },
          { pass: true, score: 1, assertion: { type: "contains", value: "x" } },
          { pass: false, score: 0, assertion: { type: "llm-rubric", value: "y" } },
        ],
      },
    });
    expect(row?.metrics).toEqual({ completed: 1, assert_pass: 0, assert_score: 0.5 });
  });

  it("charges the run cap and discards a run without a reported cost", () => {
    const { dir, plan } = setup();
    measured(dir);
    const row = afterRun(runContext(plan, "a", VARS), {
      response: { metadata: {} },
      error: "crash",
    });
    expect(row?.cost).toBe(3);
    expect(row?.discarded).toBe("provider error: crash");
    const silent = afterRun(runContext(plan, "a", VARS), { response: { output: "x" } });
    expect(silent?.discarded).toMatch(/no reported cost/);
  });

  it("writes no row and charges nothing for a run the provider refused at the budget", () => {
    const { plan } = setup();
    const row = afterRun(runContext(plan, "a", VARS), {
      response: { error: "budget reached", metadata: { benchWorkflow: "a", budgetStop: true } },
      error: "budget reached",
    });
    expect(row).toBeNull();
    expect(readRows(plan.resultsFile)).toEqual([]);
    expect(readLedger(plan.ledgerFile).entries).toEqual([]);
  });
});

describe("recordJudgement", () => {
  it("writes the judge's name, request and answer next to the run's raw records", () => {
    const { dir, plan } = setup();
    recordJudgement(
      runContext(plan, "a", VARS),
      "rubric",
      { system: "s", prompt: "p", schema: { type: "object" } },
      { output: { accurate: false, reason: "r" }, cost: 0.01, models: [] },
    );
    const file = join(dir, "raw/a/task.run-2/judge.json");
    expect(JSON.parse(readFileSync(file, "utf8"))).toEqual({
      judge: "rubric",
      system: "s",
      schema: { type: "object" },
      prompt: "p",
      answer: { accurate: false, reason: "r" },
    });
  });
});

describe("extensionHook", () => {
  it("passes other hooks through without a plan", async () => {
    const context = { test: { vars: {} } };
    await expect(extensionHook("beforeAll", context)).resolves.toBe(context);
  });
});
