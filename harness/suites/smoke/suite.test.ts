import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";

import type { RunOptions } from "../../cli.ts";
import { HARNESS_ASSERTION_SUFFIX } from "../../hook.ts";
import { renderSeries } from "../../runner.ts";
import { SMOKE_PROMPT, describeSmoke, sdkVersion, smokeRunner } from "./suite.ts";
import type { SmokeDeps, SmokeSpec } from "./suite.ts";

const dirs: string[] = [];
afterEach(() => {
  for (const dir of dirs.splice(0)) rmSync(dir, { recursive: true, force: true });
});

function tempDir(): string {
  const dir = mkdtempSync(join(tmpdir(), "bench-smoke-"));
  dirs.push(dir);
  return dir;
}

const SHA = "abcdef0123456789abcdef0123456789abcdef01";

function spec(dir: string, overrides: Partial<SmokeSpec> = {}): SmokeSpec {
  return {
    series: "s1",
    dir: join(dir, "series"),
    sandbox: join(dir, "sandbox"),
    runs: 2,
    budgetUsd: 10,
    runCapUsd: 2,
    ledgerFile: join(dir, "budget.json"),
    resultsFile: join(dir, "rows.jsonl"),
    concurrency: 3,
    fixtureBase: join(dir, "fixture"),
    fixtureCommit: SHA,
    benchCommit: SHA,
    sdkVersion: "0.3.284",
    ...overrides,
  };
}

interface RenderedConfig {
  defaultTest: { assert: { type: string; value: string }[] };
  providers: { label: string; prompts: string[] }[];
  prompts: { label: string }[];
  tests: { vars: Record<string, string> }[];
}

function readConfig(file: string): RenderedConfig {
  return JSON.parse(readFileSync(file, "utf8")) as RenderedConfig;
}

describe("sdkVersion", () => {
  it("reads the Agent SDK dependency of a package.json", () => {
    const text = '{"dependencies":{"@anthropic-ai/claude-agent-sdk":"0.3.284"}}';
    expect(sdkVersion(text)).toBe("0.3.284");
  });

  it("throws when the package does not depend on the Agent SDK", () => {
    expect(() => sdkVersion('{"dependencies":{}}')).toThrow(/claude-agent-sdk/);
    expect(() => sdkVersion("{}")).toThrow(/claude-agent-sdk/);
  });
});

describe("describeSmoke", () => {
  it("describes one plain workflow with no plugin and the spec's adapter version", () => {
    const setup = describeSmoke(spec(tempDir()));
    expect(Object.keys(setup.workflows)).toEqual(["plain"]);
    const plain = setup.workflows.plain;
    expect(plain?.provider.config.plugins).toEqual([]);
    expect(plain?.plan.expectedPlugins).toBe(0);
    expect(plain?.plan.provenance.adapter).toEqual({ name: "plain", version: "0.3.284" });
  });

  it("renders one test per run with the prompt and item vars", () => {
    const dir = tempDir();
    const config = readConfig(renderSeries(describeSmoke(spec(dir)), join(dir, "r")).configFile);
    expect(config.tests).toHaveLength(2);
    for (const test of config.tests) {
      expect(test.vars.bench_task).toBe(SMOKE_PROMPT);
      expect(test.vars.bench_item).toBe("hello");
    }
  });

  it("rejects a targeted workflow that does not exist", () => {
    const dir = tempDir();
    const setup = describeSmoke(spec(dir, { only: { workflows: ["nope"] } }));
    expect(() => renderSeries(setup, join(dir, "r"))).toThrow(
      "unknown workflow nope; known workflows: plain",
    );
  });

  it("renders the harness assertion and a prompt that every provider names", () => {
    const dir = tempDir();
    const config = readConfig(renderSeries(describeSmoke(spec(dir)), join(dir, "r")).configFile);
    expect(config.defaultTest.assert[0]?.value.endsWith(HARNESS_ASSERTION_SUFFIX)).toBe(true);
    const labels = config.prompts.map((prompt) => prompt.label);
    for (const provider of config.providers) expect(provider.prompts).toEqual(labels);
  });
});

interface Calls {
  assertCommitted: number;
  prepareFixture: unknown[][];
  evaluate: string[][];
  printed: string[];
  errors: string[];
}

function harness(assertCommitted: () => void = () => undefined): {
  deps: SmokeDeps;
  calls: Calls;
  root: string;
  runs: string;
} {
  const dir = tempDir();
  const root = join(dir, "root");
  mkdirSync(root);
  writeFileSync(
    join(root, "package.json"),
    '{"dependencies":{"@anthropic-ai/claude-agent-sdk":"9.9.9"}}',
  );
  const calls: Calls = {
    assertCommitted: 0,
    prepareFixture: [],
    evaluate: [],
    printed: [],
    errors: [],
  };
  const runs = join(dir, "runs");
  const deps: SmokeDeps = {
    assertCommitted: () => {
      calls.assertCommitted++;
      assertCommitted();
    },
    headCommit: () => SHA,
    prepareFixture: (...args: unknown[]) => {
      calls.prepareFixture.push(args);
      return join(dir, "fixture");
    },
    evaluate: (_root, config, output) => {
      calls.evaluate.push([config, output]);
      return Promise.resolve(0);
    },
    dirs: {
      rootDir: root,
      runsDir: runs,
      sandboxDir: join(dir, "sandbox"),
      ledgerFile: join(runs, "budget.json"),
      resultsDir: join(dir, "results"),
    },
  };
  return { deps, calls, root, runs };
}

const OPTIONS: RunOptions = {
  command: "run",
  suite: "smoke",
  probe: true,
  runs: 5,
  budget: 10,
  runCap: 2,
  concurrency: 2,
};

describe("smokeRunner", () => {
  it("runs a probe without the commit check, over one prepared fixture and one config", async () => {
    const { deps, calls, runs } = harness();
    const io = {
      print: (line: string) => calls.printed.push(line),
      printError: (line: string) => calls.errors.push(line),
    };
    const code = await smokeRunner(io, deps).run(OPTIONS);
    expect(code).toBe(0);
    expect(calls.assertCommitted).toBe(0);
    expect(calls.prepareFixture).toHaveLength(1);
    expect(calls.prepareFixture[0]?.[1]).toBe(join(runs, "cache"));
    expect(calls.evaluate).toHaveLength(1);
    const config = calls.evaluate[0]?.[0] ?? "";
    expect(config).toMatch(
      new RegExp(
        `^${join(runs, "series", "smoke", "probe-").replace(/[.\\]/g, "\\$&")}.+/promptfooconfig\\.json$`,
      ),
    );
    expect(readConfig(config).tests).toHaveLength(1);
    expect(calls.printed.some((line) => line.startsWith("probe: cost of one run"))).toBe(true);
    expect(
      calls.printed.some(
        (line) => line.includes("for 5 runs") || line.includes("projected series"),
      ),
    ).toBe(true);
  });

  it("refuses a series on an uncommitted tree before any other work", async () => {
    const { deps, calls } = harness(() => {
      throw new Error("commit the working tree");
    });
    const io = {
      print: (line: string) => calls.printed.push(line),
      printError: (line: string) => calls.errors.push(line),
    };
    const code = await smokeRunner(io, deps).run({ ...OPTIONS, probe: false });
    expect(code).toBe(1);
    expect(calls.errors).toEqual(["commit the working tree"]);
    expect(calls.prepareFixture).toHaveLength(0);
    expect(calls.evaluate).toHaveLength(0);
  });

  it("runs the requested number of runs in a series", async () => {
    const { deps, calls } = harness();
    const io = { print: () => undefined, printError: () => undefined };
    await smokeRunner(io, deps).run({ ...OPTIONS, probe: false, runs: 3 });
    const config = calls.evaluate[0]?.[0] ?? "";
    expect(readConfig(config).tests).toHaveLength(3);
    expect(existsSync(config)).toBe(true);
  });
});
