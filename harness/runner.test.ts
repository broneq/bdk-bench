import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";

import { record } from "./budget.ts";
import { UsageError } from "./cli.ts";
import { sessionProvider } from "./providers.ts";
import type { ResultRow } from "./results.ts";
import { probeSummary, renderSeries, runSeries, seriesFilter } from "./runner.ts";
import type { SeriesSetup } from "./runner.ts";
import { SERIES_ENV, readPlan } from "./series.ts";

const dirs: string[] = [];
afterEach(() => {
  for (const dir of dirs.splice(0)) rmSync(dir, { recursive: true, force: true });
});

const SHA = "abcdef0123456789abcdef0123456789abcdef01";

function series(): { dir: string; setup: SeriesSetup } {
  const dir = mkdtempSync(join(tmpdir(), "bench-runner-"));
  dirs.push(dir);
  const workflow = (label: string) => ({
    provider: sessionProvider({ label, model: "m", plugin: null, maxBudgetUsd: 1 }),
    plan: {
      expectedPlugins: 0,
      fixtureBase: null,
      provenance: {
        fixtureCommit: null,
        benchCommit: SHA,
        adapter: { name: label, version: "1" },
      },
      settings: {},
    },
  });
  return {
    dir,
    setup: {
      plan: {
        suite: "smoke",
        series: "s1",
        ledgerFile: join(dir, "budget.json"),
        budgetUsd: 5,
        runCapUsd: 1,
        resultsFile: join(dir, "s1.jsonl"),
        rawDir: join(dir, "raw"),
        sandboxDir: join(dir, "sandbox"),
        debugDir: join(dir, "debug"),
      },
      prompt: "{{task}}",
      workflows: { plain: workflow("plain"), other: workflow("other") },
      items: [
        { id: "a", vars: { task: "A" } },
        { id: "b", vars: { task: "B" } },
      ],
      runs: 3,
      concurrency: 4,
    },
  };
}

type Config = Record<string, unknown> & {
  providers: { label: string; prompts: string[] }[];
  prompts: { id: string; label: string; raw: string }[];
  tests: { description: string }[];
};

function configOf(file: string): Config {
  return JSON.parse(readFileSync(file, "utf8")) as Config;
}

describe("renderSeries", () => {
  it("runs every test in every workflow, with the hook, the harness assertion and the concurrency", () => {
    const { dir, setup } = series();
    const rendered = renderSeries(setup, join(dir, "render"));
    const config = configOf(rendered.configFile);
    expect(config).toMatchObject({
      evaluateOptions: { maxConcurrency: 4, repeat: 1 },
      defaultTest: {
        assert: [
          {
            type: "javascript",
            value: expect.stringMatching(/^file:\/\/.*\/harness\/assert\.ts:grade$/) as unknown,
          },
        ],
      },
    });
    expect(config.providers.map((provider) => provider.label)).toEqual(["plain", "other"]);
    expect(config.extensions).toEqual([
      expect.stringMatching(/^file:\/\/.*\/harness\/hook\.ts:extensionHook$/),
    ]);
    expect(config.tests).toHaveLength(6);
    expect(Object.keys(readPlan(rendered.planFile).workflows)).toEqual(["plain", "other"]);
  });

  it("labels the series with suite, series, bench commit and models", () => {
    const { dir, setup } = series();
    const config = configOf(renderSeries(setup, join(dir, "render")).configFile);
    expect(config.description).toBe("smoke s1 bench@abcdef0 m");
    expect(config.tags).toEqual({ suite: "smoke", series: "s1", benchCommit: SHA, model: "m" });
  });

  it("shares one prompt between workflows with the same prompt and labels a own prompt by its workflow", () => {
    const { dir, setup } = series();
    const shared = configOf(renderSeries(setup, join(dir, "shared")).configFile);
    expect(shared.prompts).toEqual([{ id: "plain", label: "plain", raw: "{{task}}" }]);
    expect(shared.providers.map((provider) => provider.prompts)).toEqual([["plain"], ["plain"]]);

    const other = setup.workflows.other;
    if (other === undefined) throw new Error("no other workflow");
    const own = configOf(
      renderSeries(
        { ...setup, workflows: { ...setup.workflows, other: { ...other, prompt: "/x {{task}}" } } },
        join(dir, "own"),
      ).configFile,
    );
    expect(own.prompts).toEqual([
      { id: "plain", label: "plain", raw: "{{task}}" },
      { id: "other", label: "other", raw: "/x {{task}}" },
    ]);
    expect(own.providers.map((provider) => provider.prompts)).toEqual([["plain"], ["other"]]);
  });

  it("keeps only the workflows and items of a targeted run", () => {
    const { dir, setup } = series();
    const rendered = renderSeries(
      { ...setup, only: { workflows: ["plain"], items: ["b"] } },
      join(dir, "render"),
    );
    const config = configOf(rendered.configFile);
    expect(config.providers.map((provider) => provider.label)).toEqual(["plain"]);
    expect(config.tests.map((test) => test.description)).toEqual(["b run 1", "b run 2", "b run 3"]);
    expect(Object.keys(readPlan(rendered.planFile).workflows)).toEqual(["plain"]);
  });

  it("refuses an unknown workflow or item, listing the known ones", () => {
    const { dir, setup } = series();
    const only = setup.workflows.other;
    if (only === undefined) throw new Error("no other workflow");
    const single = { ...setup, workflows: { plain: setup.workflows.plain ?? only } };
    expect(() => renderSeries({ ...single, only: { workflows: ["nope"] } }, dir)).toThrow(
      new UsageError("unknown workflow nope; known workflows: plain"),
    );
    expect(() => renderSeries({ ...setup, only: { items: ["z"] } }, dir)).toThrow(
      /unknown item z; known items: a, b/,
    );
  });
});

describe("seriesFilter", () => {
  it("is undefined for a full run and carries only the flags given", () => {
    expect(seriesFilter({})).toBeUndefined();
    expect(seriesFilter({ workflows: ["plain"] })).toEqual({ workflows: ["plain"] });
    expect(seriesFilter({ workflows: ["plain"], items: ["a"] })).toEqual({
      workflows: ["plain"],
      items: ["a"],
    });
  });
});

describe("runSeries", () => {
  const io = (code: number, calls: string[] = []) => ({
    evaluate: (_config: string, _output: string, env: Readonly<Record<string, string>>) => {
      calls.push(env[SERIES_ENV] ?? "");
      return Promise.resolve(code);
    },
    print: () => undefined,
    printError: (line: string) => calls.push(line),
  });

  it("points promptfoo at the plan and treats failed assertions as a finished series", async () => {
    const { dir, setup } = series();
    const rendered = renderSeries(setup, join(dir, "render"));
    const calls: string[] = [];
    await expect(runSeries(setup, rendered, io(100, calls))).resolves.toBe(0);
    expect(calls).toEqual([rendered.planFile]);
  });

  it("reports other promptfoo failures with the output file", async () => {
    const { dir, setup } = series();
    const rendered = renderSeries(setup, join(dir, "render"));
    const crash: string[] = [];
    await expect(runSeries(setup, rendered, io(3, crash))).resolves.toBe(3);
    expect(crash[1]).toBe(`promptfoo exited with 3; raw output in ${rendered.outputFile}`);
  });

  it("stops with the budget message when the ledger reached the budget", async () => {
    const { dir, setup } = series();
    const rendered = renderSeries(setup, join(dir, "render"));
    record(setup.plan.ledgerFile, { suite: "smoke", workflow: "plain", run: 1, cost: 5 });
    const stop: string[] = [];
    await expect(runSeries(setup, rendered, io(1, stop))).resolves.toBe(1);
    expect(stop[1]).toMatch(/budget reached: 5.00 USD spent of 5 USD/);
  });
});

describe("probeSummary", () => {
  const row = (workflow: string, cost: number, discarded: string | null = null): ResultRow => ({
    suite: "smoke",
    series: "probe",
    workflow,
    item: "hello",
    run: 1,
    discarded,
    cost,
    metrics: {},
    provenance: {
      models: ["m"],
      fixtureCommit: null,
      benchCommit: SHA,
      adapter: { name: workflow, version: "1" },
    },
  });

  it("projects the per-workflow probe cost to the series and lists discarded runs", () => {
    const lines = probeSummary([row("plain", 0.5), row("bdk", 1, "no model")], 5, 100, 6);
    expect(lines).toContain("  plain: 0.50 USD per run, 2.50 USD for 5 runs");
    expect(lines).toContain("projected series: 7.50 USD; budget left: 94.00 USD of 100 USD");
    expect(lines).toContain("  discarded bdk hello: no model");
  });

  it("prints the projection of a single row", () => {
    const lines = probeSummary([row("plain", 0.5)], 5, 100, 0);
    expect(lines).toContain("  plain: 0.50 USD per run, 2.50 USD for 5 runs");
    expect(lines.some((line) => line.startsWith("projected series: 2.50 USD"))).toBe(true);
  });

  it("scales the cost of a probe over a sample of the items to all items", () => {
    const lines = probeSummary([row("plain", 0.5)], 5, 100, 0, { probed: 1, total: 4 });
    expect(lines).toContain("  (the probe ran 1 of 4 items; costs are scaled to all items)");
    expect(lines).toContain("  plain: 2.00 USD per run, 10.00 USD for 5 runs");
  });
});
