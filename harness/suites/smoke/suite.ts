// The smoke suite: one plain Claude Code session asked to create a file in the
// fixture. It proves the harness end to end and costs about one run of `plain`.
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { DEFAULT_BUDGET_USD, DEFAULT_RUN_CAP_USD, readLedger, spent } from "../../budget.ts";
import { DEFAULT_CONCURRENCY } from "../../cli.ts";
import type { RunOptions, SuiteRunner } from "../../cli.ts";
import { npmCi, prepareFixture } from "../../fixture.ts";
import {
  LEDGER_FILE,
  RESULTS_DIR,
  ROOT_DIR,
  RUNS_DIR,
  SANDBOX_DIR,
  readVersions,
  resultsFile,
  sandboxOf,
} from "../../paths.ts";
import { sessionProvider } from "../../providers.ts";
import { readRows } from "../../results.ts";
import { probeSummary, renderSeries, runSeries, seriesFilter } from "../../runner.ts";
import type { SeriesFilter, SeriesIo, SeriesSetup } from "../../runner.ts";
import { freshSeriesName, seriesStamp } from "../../series.ts";
import { evaluate, validateConfig } from "../../tools.ts";
import { assertCommitted, headCommit } from "../../tree.ts";

const SUITE = "smoke";
const WORKFLOW = "plain";
const ITEM = "hello";
const MODEL = "claude-opus-5-5";
const PROMPT_VAR = "bench_task";
const SDK_PACKAGE = "@anthropic-ai/claude-agent-sdk";

export const SMOKE_PROMPT = "Create a file HELLO.md that contains the single line hello.";

/** The Agent SDK version the package pins, recorded as the plain workflow's adapter version. */
export function sdkVersion(packageJsonText: string): string {
  const manifest = JSON.parse(packageJsonText) as {
    dependencies?: Record<string, string>;
  };
  const version = manifest.dependencies?.[SDK_PACKAGE];
  if (version === undefined) throw new Error(`package.json has no dependency on ${SDK_PACKAGE}`);
  return version;
}

export interface SmokeSpec {
  readonly series: string;
  /** The series' own directory under `.runs/`. */
  readonly dir: string;
  /** The series' sandbox outside the repository. */
  readonly sandbox: string;
  readonly runs: number;
  readonly budgetUsd: number;
  readonly runCapUsd: number;
  readonly ledgerFile: string;
  readonly resultsFile: string;
  readonly concurrency: number;
  readonly fixtureBase: string;
  readonly fixtureCommit: string;
  readonly benchCommit: string;
  readonly sdkVersion: string;
  readonly only?: SeriesFilter | undefined;
}

/** The series without I/O, over a fixture base already prepared. */
export function describeSmoke(spec: SmokeSpec): SeriesSetup {
  return {
    plan: {
      suite: SUITE,
      series: spec.series,
      ledgerFile: spec.ledgerFile,
      budgetUsd: spec.budgetUsd,
      runCapUsd: spec.runCapUsd,
      resultsFile: spec.resultsFile,
      rawDir: join(spec.dir, "raw"),
      sandboxDir: spec.sandbox,
      debugDir: join(spec.dir, "debug"),
    },
    prompt: `{{${PROMPT_VAR}}}`,
    workflows: {
      [WORKFLOW]: {
        provider: sessionProvider({
          label: WORKFLOW,
          model: MODEL,
          plugin: null,
          maxBudgetUsd: spec.runCapUsd,
          // No user turn: a question gets its first option.
          askUserQuestion: true,
        }),
        plan: {
          expectedPlugins: 0,
          fixtureBase: spec.fixtureBase,
          provenance: {
            fixtureCommit: spec.fixtureCommit,
            benchCommit: spec.benchCommit,
            adapter: { name: WORKFLOW, version: spec.sdkVersion },
          },
          settings: {},
        },
      },
    },
    items: [{ id: ITEM, vars: { [PROMPT_VAR]: SMOKE_PROMPT } }],
    runs: spec.runs,
    concurrency: spec.concurrency,
    ...(spec.only === undefined ? {} : { only: spec.only }),
  };
}

export interface SmokeDeps {
  readonly assertCommitted: () => void;
  readonly headCommit: () => string;
  readonly prepareFixture: typeof prepareFixture;
  readonly evaluate: typeof evaluate;
  readonly dirs: {
    readonly rootDir: string;
    readonly runsDir: string;
    readonly sandboxDir: string;
    readonly ledgerFile: string;
    readonly resultsDir: string;
  };
}

const REAL_DEPS: SmokeDeps = {
  assertCommitted: () => {
    assertCommitted();
  },
  headCommit: () => headCommit(),
  prepareFixture,
  evaluate,
  dirs: {
    rootDir: ROOT_DIR,
    runsDir: RUNS_DIR,
    sandboxDir: SANDBOX_DIR,
    ledgerFile: LEDGER_FILE,
    resultsDir: RESULTS_DIR,
  },
};

export function smokeRunner(
  io: Omit<SeriesIo, "evaluate">,
  deps: SmokeDeps = REAL_DEPS,
): SuiteRunner {
  const { dirs } = deps;
  return {
    async run(options: RunOptions): Promise<number> {
      if (!options.probe) {
        try {
          deps.assertCommitted();
        } catch (error) {
          io.printError(error instanceof Error ? error.message : String(error));
          return 1;
        }
      }
      const versions = readVersions(join(dirs.rootDir, "versions.json"));
      const adapterVersion = sdkVersion(readFileSync(join(dirs.rootDir, "package.json"), "utf8"));
      const resultsOf = (name: string): string => resultsFile(dirs.resultsDir, SUITE, name);
      const series = freshSeriesName(
        `${options.probe ? "probe" : "series"}-${seriesStamp()}`,
        (name) => readRows(resultsOf(name)).length > 0,
      );
      const dir = join(dirs.runsDir, "series", SUITE, series);
      const sandbox = sandboxOf(SUITE, series, dirs.sandboxDir, dirs.rootDir);
      rmSync(dir, { recursive: true, force: true });
      rmSync(sandbox, { recursive: true, force: true });
      const fixtureBase = deps.prepareFixture(versions.fixture, join(dirs.runsDir, "cache"), {
        install: npmCi,
      });
      const setup = describeSmoke({
        series,
        dir,
        sandbox,
        runs: options.probe ? 1 : options.runs,
        budgetUsd: options.budget,
        runCapUsd: options.runCap,
        ledgerFile: dirs.ledgerFile,
        resultsFile: resultsOf(series),
        concurrency: options.concurrency,
        fixtureBase,
        fixtureCommit: versions.fixture.commit,
        benchCommit: deps.headCommit(),
        sdkVersion: adapterVersion,
        only: seriesFilter(options),
      });
      const code = await runSeries(setup, renderSeries(setup, dir), {
        ...io,
        evaluate: (config, output, env) => deps.evaluate(dirs.rootDir, config, output, env),
      });
      if (options.probe) {
        const rows = readRows(setup.plan.resultsFile);
        const lines = probeSummary(
          rows,
          options.runs,
          options.budget,
          spent(readLedger(dirs.ledgerFile)),
        );
        for (const line of lines) io.print(line);
      }
      return code;
    },

    check(): Promise<void> {
      const dir = mkdtempSync(join(tmpdir(), "bench-smoke-check-"));
      try {
        for (const runs of [1, 5]) {
          const seriesDir = join(dir, String(runs));
          const setup = describeSmoke({
            series: "check",
            dir: seriesDir,
            sandbox: seriesDir,
            runs,
            budgetUsd: DEFAULT_BUDGET_USD,
            runCapUsd: DEFAULT_RUN_CAP_USD,
            ledgerFile: join(dir, "budget.json"),
            resultsFile: join(dir, "rows.jsonl"),
            concurrency: DEFAULT_CONCURRENCY,
            fixtureBase: join(dir, "fixture"),
            fixtureCommit: "0".repeat(40),
            benchCommit: "0".repeat(40),
            sdkVersion: "0",
          });
          validateConfig(dirs.rootDir, renderSeries(setup, seriesDir).configFile);
        }
      } finally {
        rmSync(dir, { recursive: true, force: true });
      }
      return Promise.resolve();
    },
  };
}
