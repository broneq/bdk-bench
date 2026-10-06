// A measured series: the rendered promptfoo config plus a plan file the
// extension hook reads. Tests are expanded per run and workflow, runs
// outermost, so workflows interleave and a drift over time hits every workflow.
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

/** The environment variable that points the extension hook at the plan file. */
export const SERIES_ENV = "BENCH_SERIES";

export interface WorkflowProvenance {
  readonly fixtureCommit: string | null;
  readonly benchCommit: string;
  readonly adapter: { readonly name: string; readonly version: string };
}

export interface WorkflowPlan {
  /** 1 for a session with its plugin copy, 0 for a one-turn call or a plain session. */
  readonly expectedPlugins: number;
  /** The prepared fixture base the working copy is copied from; null without a fixture. */
  readonly fixtureBase: string | null;
  readonly provenance: WorkflowProvenance;
  /** Suite-specific settings of the workflow, read by the suite's hooks. */
  readonly settings: Readonly<Record<string, unknown>>;
}

export interface SeriesPlan {
  readonly suite: string;
  readonly series: string;
  /** Counted when a run reports no cost, the most it could have spent. */
  readonly runCapUsd: number;
  readonly resultsFile: string;
  /** Raw per-run outputs, kept out of the tree. */
  readonly rawDir: string;
  /** Holds the `runs/` tree of working copies and config homes, outside the repository. */
  readonly sandboxDir: string;
  readonly debugDir: string;
  readonly workflows: Readonly<Record<string, WorkflowPlan>>;
}

export interface RunPaths {
  readonly workDir: string;
  readonly configHome: string;
  readonly debugFile: string;
}

export function runPaths(plan: SeriesPlan, workflow: string, item: string, run: number): RunPaths {
  const name = `${item}.run-${String(run)}`;
  const runDir = join(plan.sandboxDir, "runs", workflow, name);
  return {
    workDir: join(runDir, "work"),
    configHome: join(runDir, "config-home"),
    debugFile: join(plan.debugDir, workflow, `${name}.log`),
  };
}

export function writePlan(file: string, plan: SeriesPlan): void {
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, `${JSON.stringify(plan, null, 2)}\n`);
}

export function readPlan(file: string | undefined): SeriesPlan {
  if (file === undefined || !existsSync(file)) {
    throw new Error(`${SERIES_ENV} does not name a series plan (${file ?? "unset"})`);
  }
  return JSON.parse(readFileSync(file, "utf8")) as SeriesPlan;
}

export interface EvalItem {
  /** Unique within the suite: a task id. */
  readonly id: string;
  readonly vars: Readonly<Record<string, string>>;
  /** promptfoo assertions of the item, if any. */
  readonly assert?: readonly unknown[];
}

export interface TestCase {
  readonly description: string;
  readonly vars: Readonly<Record<string, string>>;
  readonly providers: readonly string[];
  readonly assert?: readonly unknown[];
  readonly options: { readonly disableVarExpansion: true };
}

/** The vars the hook reads to find the run's item and run number. */
export const RUN_VARS = { item: "bench_item", run: "bench_run" } as const;

const RAW_OPEN = "{% raw %}";
const RAW_CLOSE = "{% endraw %}";
const TEMPLATE_SYNTAX = /\{\{|\{%|\{#/;

/**
 * A var value promptfoo passes on unchanged. promptfoo renders every string
 * var as a Nunjucks template before it fills the prompt, so a value with JSX
 * such as `{{ __html: x }}` fails to render, and a valid `{{ x }}` silently
 * turns empty. A value with template syntax is wrapped in a raw block.
 */
export function literalVar(value: string): string {
  if (!TEMPLATE_SYNTAX.test(value)) return value;
  if (/\{%-?\s*endraw/.test(value)) {
    throw new Error("a var value contains a Nunjucks endraw tag and cannot be passed literally");
  }
  return `${RAW_OPEN}${value}${RAW_CLOSE}`;
}

/** The value `literalVar` wrapped, as the hook reads it back from the test's vars. */
export function varValue(value: string): string {
  return value.startsWith(RAW_OPEN) && value.endsWith(RAW_CLOSE)
    ? value.slice(RAW_OPEN.length, -RAW_CLOSE.length)
    : value;
}

function literalVars(vars: Readonly<Record<string, string>> = {}): Record<string, string> {
  return Object.fromEntries(Object.entries(vars).map(([key, value]) => [key, literalVar(value)]));
}

export function expandTests(
  workflows: readonly string[],
  items: readonly EvalItem[],
  runs: number,
  /** Vars of one workflow, over the item's: a workflow's own prompt, for example. */
  workflowVars: Readonly<Record<string, Readonly<Record<string, string>>>> = {},
): TestCase[] {
  const tests: TestCase[] = [];
  for (let run = 1; run <= runs; run++) {
    for (const item of items) {
      for (const workflow of workflows) {
        tests.push({
          description: `${workflow} ${item.id} run ${run}`,
          vars: {
            ...literalVars(item.vars),
            ...literalVars(workflowVars[workflow]),
            [RUN_VARS.item]: item.id,
            [RUN_VARS.run]: String(run),
          },
          providers: [workflow],
          ...(item.assert === undefined ? {} : { assert: item.assert }),
          options: { disableVarExpansion: true },
        });
      }
    }
  }
  return tests;
}

/**
 * The UTC date and time a series starts, `2026-10-05-080013`. A date alone made
 * two branches that probe the same suite on one day write the same results file,
 * which conflicts when both merge.
 */
export function seriesStamp(now: Date = new Date()): string {
  const iso = now.toISOString();
  return `${iso.slice(0, 10)}-${iso.slice(11, 19).replaceAll(":", "")}`;
}

/** `base`, or `base-2`, `base-3`, ... when a series of that name already has rows. */
export function freshSeriesName(base: string, exists: (series: string) => boolean): string {
  if (!exists(base)) return base;
  for (let n = 2; ; n++) {
    const name = `${base}-${n}`;
    if (!exists(name)) return name;
  }
}
