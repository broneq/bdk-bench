import { describe, expect, it } from "vitest";

import { UsageError, credentialsProblem, parseArgs, run } from "./cli.ts";
import type { CliDeps, SuiteRunner } from "./cli.ts";

const KNOWN = ["smoke"];

function deps(
  overrides: Partial<CliDeps> = {},
  names: readonly string[] = KNOWN,
): CliDeps & { out: string[]; err: string[]; calls: string[] } {
  const out: string[] = [];
  const err: string[] = [];
  const calls: string[] = [];
  const suite = (name: string): SuiteRunner => ({
    run: (options) => {
      calls.push(`${name}:run:${options.probe ? "probe" : "series"}`);
      return Promise.resolve(0);
    },
    check: () => {
      calls.push(`${name}:check`);
      return Promise.resolve();
    },
  });
  return {
    env: { ANTHROPIC_API_KEY: "sk-test" },
    authStatus: () => ({ loggedIn: false }),
    suites: Object.fromEntries(names.map((name) => [name, suite(name)])),
    view: () => {
      calls.push("view");
      return Promise.resolve(0);
    },
    compare: (suite, baseline, candidate) => {
      calls.push(`compare:${suite}:${baseline}:${candidate}`);
      return Promise.resolve(0);
    },
    regrade: (suite, series) => {
      calls.push(`regrade:${suite}:${series}`);
      return Promise.resolve(0);
    },
    print: (line) => out.push(line),
    printError: (line) => err.push(line),
    ...overrides,
    out,
    err,
    calls,
  };
}

describe("parseArgs", () => {
  it("defaults to one run, a 100 USD budget, a 15 USD run cap and 4 sessions at once", () => {
    expect(parseArgs(["smoke"], KNOWN)).toEqual({
      command: "run",
      suite: "smoke",
      probe: false,
      runs: 1,
      budget: 100,
      runCap: 15,
      concurrency: 4,
    });
  });

  it("parses every run flag", () => {
    expect(
      parseArgs(
        [
          "smoke",
          "--probe",
          "--runs",
          "3",
          "--budget",
          "40",
          "--run-cap",
          "8",
          "--concurrency",
          "2",
          "--workflows",
          "plain",
          "--items",
          "hello",
        ],
        KNOWN,
      ),
    ).toEqual({
      command: "run",
      suite: "smoke",
      probe: true,
      runs: 3,
      budget: 40,
      runCap: 8,
      concurrency: 2,
      workflows: ["plain"],
      items: ["hello"],
    });
  });

  it("accepts one run and refuses zero and a fraction", () => {
    expect(parseArgs(["smoke", "--runs", "1"], KNOWN)).toMatchObject({ runs: 1 });
    expect(() => parseArgs(["smoke", "--runs", "0"], KNOWN)).toThrow(UsageError);
    expect(() => parseArgs(["smoke", "--runs", "1.5"], KNOWN)).toThrow(UsageError);
  });

  it("parses check and view", () => {
    expect(parseArgs(["check"], KNOWN)).toEqual({ command: "check" });
    expect(parseArgs(["view"], KNOWN)).toEqual({ command: "view" });
  });

  it("parses a report as a compare of two series", () => {
    expect(parseArgs(["report", "smoke", "--baseline", "a", "--candidate", "b"], KNOWN)).toEqual({
      command: "compare",
      suite: "smoke",
      baseline: "a",
      candidate: "b",
    });
  });

  it("names both series flags when a report lacks them", () => {
    for (const argv of [
      ["report", "smoke"],
      ["report", "smoke", "--baseline", "a"],
    ]) {
      expect(() => parseArgs(argv, KNOWN)).toThrow(/--baseline.*--candidate/);
    }
    expect(() => parseArgs(["report", "smoke", "--baseline", "a"], KNOWN)).toThrow(UsageError);
  });

  it("parses a regrade and names --series when it is missing", () => {
    expect(parseArgs(["regrade", "smoke", "--series", "s1"], KNOWN)).toEqual({
      command: "regrade",
      suite: "smoke",
      series: "s1",
    });
    expect(() => parseArgs(["regrade", "smoke"], KNOWN)).toThrow(/--series/);
  });

  it("refuses an unknown suite, listing the known ones", () => {
    expect(() => parseArgs(["nosuch"], ["a", "b"])).toThrow(/known suites: a, b/);
    expect(() =>
      parseArgs(["report", "nosuch", "--baseline", "a", "--candidate", "b"], KNOWN),
    ).toThrow(/unknown suite nosuch/);
  });

  it("refuses removed flags, an unknown flag and a non-numeric value", () => {
    expect(() => parseArgs(["smoke", "--case", "x"], KNOWN)).toThrow(/unknown flag --case/);
    expect(() => parseArgs(["smoke", "--fast"], KNOWN)).toThrow(/unknown flag --fast/);
    expect(() => parseArgs(["smoke", "--runs", "many"], KNOWN)).toThrow(/--runs/);
    expect(() => parseArgs(["smoke", "--workflows", ","], KNOWN)).toThrow(/--workflows/);
  });
});

describe("credentialsProblem", () => {
  it("accepts an API key or a Claude Code login", () => {
    expect(credentialsProblem({ ANTHROPIC_API_KEY: "k" }, () => ({ loggedIn: false }))).toBeNull();
    expect(credentialsProblem({}, () => ({ loggedIn: true }))).toBeNull();
  });

  it("names both ways when neither is there", () => {
    const problem = credentialsProblem({}, () => ({ loggedIn: false }));
    expect(problem).toMatch(/ANTHROPIC_API_KEY/);
    expect(problem).toMatch(/claude auth login/);
    expect(credentialsProblem({}, () => undefined)).toMatch(/ANTHROPIC_API_KEY/);
  });
});

describe("run", () => {
  it("runs the suite and returns its exit code", async () => {
    const d = deps();
    expect(await run(["smoke", "--probe"], d)).toBe(0);
    expect(d.calls).toEqual(["smoke:run:probe"]);
  });

  it("exits 1 without credentials before the suite starts", async () => {
    const d = deps({ env: {}, authStatus: () => ({ loggedIn: false }) });
    expect(await run(["smoke"], d)).toBe(1);
    expect(d.calls).toEqual([]);
    expect(d.err.join("\n")).toMatch(/ANTHROPIC_API_KEY.*claude auth login/);
  });

  it("exits 1 on a regrade without credentials", async () => {
    const d = deps({ env: {}, authStatus: () => undefined });
    expect(await run(["regrade", "smoke", "--series", "s1"], d)).toBe(1);
    expect(d.calls).toEqual([]);
  });

  it("regrades with credentials", async () => {
    const d = deps();
    expect(await run(["regrade", "smoke", "--series", "s1"], d)).toBe(0);
    expect(d.calls).toEqual(["regrade:smoke:s1"]);
  });

  it("checks every suite and view and report run without credentials", async () => {
    const d = deps({ env: {}, authStatus: () => undefined }, ["a", "b"]);
    expect(await run(["check"], d)).toBe(0);
    expect(d.calls).toEqual(["a:check", "b:check"]);
    expect(d.out).toEqual(["checked a, b"]);
    expect(await run(["view"], d)).toBe(0);
    expect(await run(["report", "a", "--baseline", "x", "--candidate", "y"], d)).toBe(0);
    expect(d.calls.slice(2)).toEqual(["view", "compare:a:x:y"]);
  });

  it("prints the message and the usage text and exits 2 on a usage error", async () => {
    const d = deps();
    expect(await run(["nosuch"], d)).toBe(2);
    expect(d.err.join("\n")).toMatch(/unknown suite nosuch[\s\S]*usage: pnpm bench/);
  });
});
