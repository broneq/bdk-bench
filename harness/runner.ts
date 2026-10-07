// Rendering and running a series: a suite describes its workflows and items;
// this module writes the promptfoo config and the plan file, runs promptfoo,
// and turns the ledger and the rows into what the user reads.
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

import { BudgetReached, projection, readLedger, spent } from "./budget.ts";
import { UsageError } from "./cli.ts";
import type { RunOptions } from "./cli.ts";
import type { ProviderEntry } from "./providers.ts";
import type { ResultRow } from "./results.ts";
import { SERIES_ENV, expandTests, writePlan } from "./series.ts";
import type { EvalItem, SeriesPlan, WorkflowPlan } from "./series.ts";

const HOOK = fileURLToPath(new URL("./hook.ts", import.meta.url));
const ASSERT = fileURLToPath(new URL("./assert.ts", import.meta.url));

export interface WorkflowSetup {
  readonly provider: ProviderEntry;
  readonly plan: WorkflowPlan;
  /** The workflow's own prompt template, over the series' `prompt`. */
  readonly prompt?: string;
}

/** The workflows and items a targeted run keeps (`--workflows`, `--items`); all when absent. */
export interface SeriesFilter {
  readonly workflows?: readonly string[];
  readonly items?: readonly string[];
}

/** The filter of a targeted run's `--workflows` and `--items`; undefined for a full run. */
export function seriesFilter(
  options: Pick<RunOptions, "workflows" | "items">,
): SeriesFilter | undefined {
  if (options.workflows === undefined && options.items === undefined) return undefined;
  return {
    ...(options.workflows === undefined ? {} : { workflows: options.workflows }),
    ...(options.items === undefined ? {} : { items: options.items }),
  };
}

export interface SeriesSetup {
  readonly plan: Omit<SeriesPlan, "workflows">;
  /** The prompt template; the items' vars fill it. */
  readonly prompt: string;
  readonly workflows: Readonly<Record<string, WorkflowSetup>>;
  readonly items: readonly EvalItem[];
  readonly runs: number;
  /** Runs in progress at once. */
  readonly concurrency: number;
  readonly only?: SeriesFilter;
}

export interface RenderedSeries {
  readonly configFile: string;
  readonly planFile: string;
  readonly outputFile: string;
}

function kept<T>(
  kind: string,
  all: readonly [string, T][],
  names?: readonly string[],
): [string, T][] {
  if (names === undefined) return [...all];
  const known = all.map(([name]) => name);
  const unknown = names.filter((name) => !known.includes(name));
  if (unknown.length > 0) {
    throw new UsageError(
      `unknown ${kind} ${unknown.join(", ")}; known ${kind}s: ${known.join(", ")}`,
    );
  }
  return all.filter(([name]) => names.includes(name));
}

function configuredModels(workflows: readonly [string, WorkflowSetup][]): string {
  const models = workflows.map(([, workflow]) => workflow.provider.config.sdk.model);
  return [...new Set(models.filter((model): model is string => typeof model === "string"))].join(
    ",",
  );
}

export function renderSeries(setup: SeriesSetup, dir: string): RenderedSeries {
  mkdirSync(dir, { recursive: true });
  const workflows = kept("workflow", Object.entries(setup.workflows), setup.only?.workflows);
  const items = kept(
    "item",
    setup.items.map((item) => [item.id, item] as [string, EvalItem]),
    setup.only?.items,
  ).map(([, item]) => item);
  const plan: SeriesPlan = {
    ...setup.plan,
    workflows: Object.fromEntries(workflows.map(([name, workflow]) => [name, workflow.plan])),
  };
  // One prompt per distinct workflow prompt, labelled by the first workflow that
  // uses it; every provider names its prompt (promptfoo's prompt-to-provider mapping).
  const prompts = new Map<string, string>();
  for (const [name, workflow] of workflows) {
    const raw = workflow.prompt ?? setup.prompt;
    if (!prompts.has(raw)) prompts.set(raw, name);
  }
  const benchCommit = workflows[0]?.[1].plan.provenance.benchCommit ?? "";
  const model = configuredModels(workflows);
  const config = {
    description: `${setup.plan.suite} ${setup.plan.series} bench@${benchCommit.slice(0, 7)} ${model}`,
    tags: { suite: setup.plan.suite, series: setup.plan.series, benchCommit, model },
    prompts: [...prompts].map(([raw, label]) => ({ id: label, label, raw })),
    providers: workflows.map(([, workflow]) => ({
      ...workflow.provider,
      prompts: [prompts.get(workflow.prompt ?? setup.prompt) ?? ""],
    })),
    extensions: [`file://${HOOK}:extensionHook`],
    // Every run has its own working copy, config home and debug log.
    evaluateOptions: { maxConcurrency: setup.concurrency, repeat: 1 },
    defaultTest: { assert: [{ type: "javascript", value: `file://${ASSERT}:grade` }] },
    tests: expandTests(items, setup.runs),
  };
  const rendered = {
    configFile: join(dir, "promptfooconfig.json"),
    planFile: join(dir, "plan.json"),
    outputFile: join(dir, "output.json"),
  };
  writeFileSync(rendered.configFile, `${JSON.stringify(config, null, 2)}\n`);
  writePlan(rendered.planFile, plan);
  return rendered;
}

type Evaluate = (
  config: string,
  output: string,
  env: Readonly<Record<string, string>>,
) => Promise<number>;

export interface SeriesIo {
  readonly evaluate: Evaluate;
  readonly print: (line: string) => void;
  readonly printError: (line: string) => void;
}

/** Runs a rendered series; resolves to the exit code of `pnpm bench`. */
export async function runSeries(
  setup: SeriesSetup,
  rendered: RenderedSeries,
  io: SeriesIo,
): Promise<number> {
  io.print(`series ${setup.plan.series}: rows in ${setup.plan.resultsFile}`);
  const code = await io.evaluate(rendered.configFile, rendered.outputFile, {
    [SERIES_ENV]: rendered.planFile,
  });
  const used = spent(readLedger(setup.plan.ledgerFile));
  if (used >= setup.plan.budgetUsd) {
    io.printError(new BudgetReached(used, setup.plan.budgetUsd).message);
    return 1;
  }
  if (code !== 0 && code !== 100) {
    io.printError(`promptfoo exited with ${String(code)}; raw output in ${rendered.outputFile}`);
    return code;
  }
  return 0;
}

/** Which of a suite's items a probe ran, when it runs a sample of them. */
export interface ProbeSample {
  readonly probed: number;
  readonly total: number;
}

/**
 * The probe's report: the cost of one run of every workflow and the series it
 * projects to; a probe over a sample of the items scales its cost to all of them.
 */
export function probeSummary(
  rows: readonly ResultRow[],
  runsPerWorkflow: number,
  budgetUsd: number,
  spentUsd: number,
  sample?: ProbeSample,
): string[] {
  const scale = sample === undefined ? 1 : sample.total / sample.probed;
  const perWorkflow: Record<string, number> = {};
  for (const row of rows) {
    perWorkflow[row.workflow] = (perWorkflow[row.workflow] ?? 0) + row.cost * scale;
  }
  const projected = projection(perWorkflow, runsPerWorkflow);
  const lines = Object.entries(perWorkflow).map(
    ([workflow, cost]) =>
      `  ${workflow}: ${cost.toFixed(2)} USD per run, ${(projected.perWorkflow[workflow] ?? 0).toFixed(2)} USD for ${String(runsPerWorkflow)} runs`,
  );
  const discarded = rows.filter((row) => row.discarded !== null);
  return [
    "probe: cost of one run per workflow",
    ...(sample === undefined
      ? []
      : [
          `  (the probe ran ${String(sample.probed)} of ${String(sample.total)} items; costs are scaled to all items)`,
        ]),
    ...lines,
    `projected series: ${projected.total.toFixed(2)} USD; budget left: ${(budgetUsd - spentUsd).toFixed(2)} USD of ${String(budgetUsd)} USD`,
    ...discarded.map((row) => `  discarded ${row.workflow} ${row.item}: ${row.discarded ?? ""}`),
    "the full series starts only after the user approves this projection",
  ];
}
