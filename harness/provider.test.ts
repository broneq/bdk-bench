import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";

import { record } from "./budget.ts";
import type { RunContext, SuiteHooks } from "./hook.ts";
import RunProvider, { callRun } from "./provider.ts";
import type { InnerProvider, RunDeps } from "./provider.ts";
import type { SeriesPlan } from "./series.ts";

const dirs: string[] = [];
afterEach(() => {
  for (const dir of dirs.splice(0)) rmSync(dir, { recursive: true, force: true });
});

const SHA = "a".repeat(40);

function series(base: "fixture" | "none" = "fixture"): { dir: string; plan: SeriesPlan } {
  const dir = mkdtempSync(join(tmpdir(), "bench-provider-"));
  dirs.push(dir);
  mkdirSync(join(dir, "base"));
  writeFileSync(join(dir, "base/f.txt"), "base");
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
        expectedPlugins: 0,
        fixtureBase: base === "fixture" ? join(dir, "base") : null,
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

interface Seen {
  config?: Readonly<Record<string, unknown>>;
  prompt?: string;
  before?: RunContext;
}

function deps(plan: SeriesPlan, seen: Seen, hooks: Partial<SuiteHooks> = {}): RunDeps {
  let clock = 1000;
  const inner: InnerProvider = {
    callApi: (prompt) => {
      seen.prompt = prompt;
      return Promise.resolve({
        output: "done",
        cost: 1.25,
        metadata: {
          numTurns: 3,
          toolCalls: [{ name: "Bash", input: { command: "git status" }, output: "{}" }],
        },
      });
    },
  };
  return {
    plan: () => plan,
    hooks: () =>
      Promise.resolve({
        measure: () => Promise.reject(new Error("not measured here")),
        beforeRun: (context) => {
          seen.before = context;
        },
        ...hooks,
      }),
    load: (config) => {
      seen.config = config;
      return Promise.resolve(inner);
    },
    now: () => (clock += 4500),
  };
}

const VARS = { bench_item: "add-filter", bench_run: "2" };
const SDK = { model: "claude-opus-5-5", env: { ENABLE_CLAUDEAI_MCP_SERVERS: "false" } };
const RUN_DIR = "sandbox/runs/plain/add-filter.run-2";

describe("callRun", () => {
  it("copies the workflow's base into the run's own working copy and runs the suite's preparation there", async () => {
    const { dir, plan } = series();
    const seen: Seen = {};
    await callRun("plain", SDK, "build it", { vars: VARS }, undefined, deps(plan, seen));
    const work = join(dir, RUN_DIR, "work");
    expect(readFileSync(join(work, "f.txt"), "utf8")).toBe("base");
    expect(seen.before?.paths).toEqual({
      workDir: work,
      configHome: join(dir, RUN_DIR, "config-home"),
      debugFile: join(dir, "debug/plain/add-filter.run-2.log"),
    });
    expect(existsSync(seen.before?.paths.configHome ?? "")).toBe(true);
    expect(seen.before).toMatchObject({ workflowName: "plain", item: "add-filter", run: 2 });
  });

  it("starts the wrapped session in the run's directory with its own debug log and config home", async () => {
    const { dir, plan } = series();
    const seen: Seen = {};
    await callRun("plain", SDK, "build it", { vars: VARS }, undefined, deps(plan, seen));
    expect(seen.prompt).toBe("build it");
    expect(seen.config).toEqual({
      model: "claude-opus-5-5",
      working_dir: join(dir, RUN_DIR, "work"),
      debug_file: join(dir, "debug/plain/add-filter.run-2.log"),
      env: {
        ENABLE_CLAUDEAI_MCP_SERVERS: "false",
        XDG_CONFIG_HOME: join(dir, RUN_DIR, "config-home"),
      },
    });
  });

  it("gives a workflow without a base an empty working copy", async () => {
    const { dir, plan } = series("none");
    await callRun("plain", SDK, "q", { vars: VARS }, undefined, deps(plan, {}));
    const work = join(dir, RUN_DIR, "work");
    expect(existsSync(work)).toBe(true);
    expect(existsSync(join(work, "f.txt"))).toBe(false);
  });

  it("replaces what an earlier series left in the run's working copy and debug log", async () => {
    const { dir, plan } = series();
    const work = join(dir, RUN_DIR, "work");
    mkdirSync(work, { recursive: true });
    writeFileSync(join(work, "stale.txt"), "old");
    mkdirSync(join(dir, "debug/plain"), { recursive: true });
    writeFileSync(join(dir, "debug/plain/add-filter.run-2.log"), "old log");
    await callRun("plain", SDK, "q", { vars: VARS }, undefined, deps(plan, {}));
    expect(existsSync(join(work, "stale.txt"))).toBe(false);
    expect(existsSync(join(dir, "debug/plain/add-filter.run-2.log"))).toBe(false);
  });

  it("adds the workflow, the wall time and the transcript to the response's metadata", async () => {
    const { plan } = series();
    const response = await callRun("plain", SDK, "q", { vars: VARS }, undefined, deps(plan, {}));
    expect(response).toMatchObject({
      output: "done",
      cost: 1.25,
      metadata: {
        numTurns: 3,
        benchWorkflow: "plain",
        wallMs: 4500,
        transcript: "1. [main] Bash: git status -> ok",
      },
    });
  });

  it("starts no session once the budget is spent, and says so in the response's error", async () => {
    const { plan } = series();
    record(plan.ledgerFile, { suite: "tasks", workflow: "plain", run: 1, cost: 10 });
    const seen: Seen = {};
    const response = await callRun("plain", SDK, "q", { vars: VARS }, undefined, deps(plan, seen));
    expect(response.error).toMatch(/^budget reached: 10.00 USD spent of 10 USD/);
    expect(response.metadata).toEqual({ benchWorkflow: "plain", budgetStop: true });
    expect(seen.config).toBeUndefined();
    expect(seen.before).toBeUndefined();
  });

  it("reports a failed preparation as an error of a run that cost nothing", async () => {
    const { plan } = series();
    const seen: Seen = {};
    const failing = deps(plan, seen, { beforeRun: () => Promise.reject(new Error("seed failed")) });
    const response = await callRun("plain", SDK, "q", { vars: VARS }, undefined, failing);
    expect(response).toEqual({
      error: "harness error: seed failed",
      cost: 0,
      metadata: { benchWorkflow: "plain" },
    });
    expect(seen.config).toBeUndefined();
  });

  it("refuses a workflow the series plan does not have", async () => {
    const { plan } = series();
    await expect(
      callRun("zz", SDK, "q", { vars: VARS }, undefined, deps(plan, {})),
    ).rejects.toThrow(/zz/);
  });
});

describe("RunProvider", () => {
  it("is named after the workflow its config declares", () => {
    const provider = new RunProvider({ config: { workflow: "plain", sdk: {} } });
    expect(provider.id()).toBe("bench:plain");
  });
});
