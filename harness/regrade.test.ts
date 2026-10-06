import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";

import { readLedger } from "./budget.ts";
import type { RecordedJudgement, SuiteHooks } from "./hook.ts";
import type { JudgeRequest } from "./judge.ts";
import { judgeHash, regradeSeries } from "./regrade.ts";
import type { RegradeDeps } from "./regrade.ts";
import { readRows } from "./results.ts";
import type { ResultRow } from "./results.ts";

const dirs: string[] = [];
afterEach(() => {
  for (const dir of dirs.splice(0)) rmSync(dir, { recursive: true, force: true });
});

const SHA = "c".repeat(40);

function row(run: number, over: Partial<ResultRow> = {}): ResultRow {
  return {
    suite: "bench",
    series: "m1",
    workflow: "plain",
    item: "task-one",
    run,
    discarded: null,
    cost: 0.1,
    metrics: { knowledge: 0, uncertain: 0 },
    provenance: {
      models: ["claude-sonnet-5"],
      fixtureCommit: null,
      benchCommit: SHA,
      adapter: { name: "plain", version: "1" },
    },
    ...over,
  };
}

const NEW_SYSTEM = "Grade strictly.";
const SCHEMA = { type: "object" };

const HOOKS: SuiteHooks = {
  measure: () => Promise.reject(new Error("no measurement in a re-grade")),
  judges: {
    knowledge: {
      system: NEW_SYSTEM,
      schema: SCHEMA,
      metrics: (output) => ({ knowledge: (output as { value: number }).value, uncertain: 0 }),
    },
  },
};

function series(
  rows: readonly ResultRow[],
  judged: readonly number[],
): { dir: string; deps: (requests: JudgeRequest[], hooks?: SuiteHooks) => RegradeDeps } {
  const dir = mkdtempSync(join(tmpdir(), "bench-regrade-"));
  dirs.push(dir);
  writeFileSync(join(dir, "m1.jsonl"), rows.map((entry) => `${JSON.stringify(entry)}\n`).join(""));
  for (const run of judged) {
    const raw = join(dir, "raw/plain", `task-one.run-${String(run)}`);
    mkdirSync(raw, { recursive: true });
    const saved: RecordedJudgement = {
      judge: "knowledge",
      system: "Grade.",
      schema: SCHEMA,
      prompt: `prompt ${String(run)}`,
      answer: { value: 0 },
    };
    writeFileSync(join(raw, "judge.json"), JSON.stringify(saved));
  }
  return {
    dir,
    deps: (requests, hooks = HOOKS) => ({
      hooks: () => Promise.resolve(hooks),
      judge: (request) => {
        requests.push(request);
        return Promise.resolve({ output: { value: 1 }, cost: 0.01, models: ["claude-sonnet-5"] });
      },
      resultsFile: join(dir, "m1.jsonl"),
      rawDir: join(dir, "raw"),
      ledgerFile: join(dir, "budget.json"),
    }),
  };
}

const io = (err: string[] = [], out: string[] = []) => ({
  print: (line: string) => out.push(line),
  printError: (line: string) => err.push(line),
});

describe("regradeSeries", () => {
  it("re-judges every counted row from its saved request with the current instructions", async () => {
    const discarded = row(3, { discarded: "provider error: x", metrics: {} });
    const { dir, deps } = series([row(1), row(2), discarded], [1, 2]);
    const requests: JudgeRequest[] = [];
    expect(await regradeSeries("bench", "m1", deps(requests), io())).toBe(0);
    expect(requests).toEqual([
      { system: NEW_SYSTEM, schema: SCHEMA, prompt: "prompt 1" },
      { system: NEW_SYSTEM, schema: SCHEMA, prompt: "prompt 2" },
    ]);
    const rows = readRows(join(dir, "m1.jsonl"));
    expect(rows.map((entry) => entry.metrics)).toEqual([
      { knowledge: 1, uncertain: 0 },
      { knowledge: 1, uncertain: 0 },
      {},
    ]);
    expect(rows[0]?.provenance.judgeHash).toBe(judgeHash(NEW_SYSTEM, SCHEMA));
    expect(rows[2]).toEqual(discarded);
    expect(readLedger(join(dir, "budget.json")).entries.map((entry) => entry.cost)).toEqual([
      0.01, 0.01,
    ]);
    const saved = JSON.parse(
      readFileSync(join(dir, "raw/plain/task-one.run-1/judge.json"), "utf8"),
    ) as RecordedJudgement;
    expect(saved).toMatchObject({ system: NEW_SYSTEM, prompt: "prompt 1", answer: { value: 1 } });
  });

  it("exits 2 for a suite without a re-gradable judge, before any judge call", async () => {
    const { deps } = series([row(1)], [1]);
    const requests: JudgeRequest[] = [];
    const err: string[] = [];
    const code = await regradeSeries(
      "other",
      "m1",
      deps(requests, { measure: HOOKS.measure }),
      io(err),
    );
    expect(code).toBe(2);
    expect(err).toEqual(["other declares no re-gradable judge"]);
    expect(requests).toEqual([]);
  });

  it("exits 2 when a counted row's raw records are missing, before any judge call", async () => {
    const { deps } = series([row(1), row(2)], [1]);
    const requests: JudgeRequest[] = [];
    const err: string[] = [];
    expect(await regradeSeries("bench", "m1", deps(requests), io(err))).toBe(2);
    expect(err[0]).toMatch(/^no raw records of bench m1 plain task-one run 2: /);
    expect(requests).toEqual([]);
  });

  it("charges the ledger with the workflow, run and cost of each judge call", async () => {
    const { dir, deps } = series([row(1), row(2)], [1, 2]);
    await regradeSeries("bench", "m1", deps([]), io());
    expect(
      readLedger(join(dir, "budget.json")).entries.map(({ suite, workflow, run, cost }) => ({
        suite,
        workflow,
        run,
        cost,
      })),
    ).toEqual([
      { suite: "bench", workflow: "plain", run: 1, cost: 0.01 },
      { suite: "bench", workflow: "plain", run: 2, cost: 0.01 },
    ]);
  });

  it("exits 2 for a series without rows", async () => {
    const { deps } = series([], []);
    const err: string[] = [];
    expect(await regradeSeries("bench", "m1", deps([]), io(err))).toBe(2);
    expect(err).toEqual(["bench has no rows of series m1"]);
  });
});
