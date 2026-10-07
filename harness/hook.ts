// A run's lifecycle. The harness provider starts a run (`startRun`): the budget check, the run's
// own working copy, config home and debug log, and the suite's preparation.
// The harness assertion measures it (`measureRun`: isolation, then the
// suite's metrics) into `measurement.json`; the promptfoo `afterEach` hook
// charges the ledger and appends the result row from it. promptfoo writes its
// own output only when a series ends, so the row is the durable record of a run.
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

import { assertCanStart, costOf, readLedger, record } from "./budget.ts";
import { freshCopy } from "./fixture.ts";
import { checkIsolation } from "./isolation.ts";
import type { JudgeRequest, Judgement } from "./judge.ts";
import { appendRow, modelsOf } from "./results.ts";
import type { ResultRow } from "./results.ts";
import { RUN_VARS, SERIES_ENV, readPlan, runPaths, varValue } from "./series.ts";
import type { RunPaths, SeriesPlan, WorkflowPlan } from "./series.ts";

export interface ToolCall {
  readonly id?: string;
  readonly name: string;
  readonly input?: unknown;
  readonly output?: unknown;
  /** Set by the host when the call failed. */
  readonly is_error?: boolean;
  /** The `Agent` call a subagent's tool call belongs to; absent in the orchestrator. */
  readonly parentToolUseId?: string | null;
}

/** The part of a promptfoo result row the harness reads. */
export interface EvalResult {
  /** A provider error, or the reason an assertion failed (`failureReason` tells them apart). */
  readonly error?: string | null;
  /** promptfoo's `ResultFailureReason`: 0 none, 1 an assertion failed, 2 an error. */
  readonly failureReason?: number;
  /** The test's assertions; absent or null when the test has none. */
  readonly gradingResult?: GradingResult | null;
  readonly response?: {
    readonly output?: unknown;
    readonly error?: string;
    readonly cost?: number;
    readonly metadata?: {
      readonly modelUsage?: Record<string, { readonly costUSD?: number }>;
      readonly toolCalls?: readonly ToolCall[];
      readonly numTurns?: number;
      /** The session's wall time, background subagents included (`provider.ts`). */
      readonly wallMs?: number;
      /** The workflow of the run (`provider.ts`). */
      readonly benchWorkflow?: string;
      /** Set when the provider refused to start the run at the budget. */
      readonly budgetStop?: boolean;
      metrics?: Readonly<Record<string, number | null>>;
    };
  };
}

export interface GradingResult {
  readonly pass: boolean;
  readonly score: number;
  readonly componentResults?: readonly {
    readonly pass: boolean;
    readonly score: number;
    readonly assertion?: { readonly type?: string; readonly value?: unknown } | null;
  }[];
}

export interface RunContext {
  readonly plan: SeriesPlan;
  readonly workflowName: string;
  readonly workflow: WorkflowPlan;
  readonly item: string;
  readonly run: number;
  readonly vars: Readonly<Record<string, string>>;
  /** The run's own working copy, config home and debug log. */
  readonly paths: RunPaths;
}

export interface Measurement {
  readonly metrics: Readonly<Record<string, number | null>>;
  /** Spent by the measurement itself, for example judge calls. */
  readonly extraCost: number;
  /** Models the measurement called, added to the row's provenance. */
  readonly models?: readonly string[];
}

export interface SuiteHooks {
  /** Prepares the run's fresh working copy, for example seeds a Change. */
  readonly beforeRun?: (context: RunContext) => void | Promise<void>;
  readonly measure: (context: RunContext, result: EvalResult) => Promise<Measurement>;
  /** Whether a counted run passed, shown as pass or fail in the viewer; every counted run passes without it. */
  readonly passOf?: (metrics: Readonly<Record<string, number | null>>) => boolean;
  /** The judges `bench regrade` can run again from their saved requests, by the name they were recorded under. */
  readonly judges?: Readonly<Record<string, RegradableJudge>>;
}

/** A judge's current instructions and the metrics its answer sets. */
export interface RegradableJudge {
  readonly system: string;
  readonly schema: Readonly<Record<string, unknown>>;
  /** The metrics an answer sets for a run of `item`. */
  readonly metrics: (output: unknown, item: string) => Record<string, number>;
}

/** A judge call as `judge.json` keeps it with the run's raw records. */
export interface RecordedJudgement {
  readonly judge: string;
  readonly system: string;
  readonly schema: Readonly<Record<string, unknown>>;
  readonly prompt: string;
  readonly answer: unknown;
}

/** What the harness assertion wrote for a run: its metrics, or why it is not counted. */
export interface Measured {
  readonly discarded: string | null;
  readonly metrics: Readonly<Record<string, number | null>>;
  readonly extraCost: number;
  readonly models: readonly string[];
}

export function runContext(
  plan: SeriesPlan,
  workflowName: string,
  vars: Readonly<Record<string, unknown>>,
): RunContext {
  const workflow = plan.workflows[workflowName];
  if (workflow === undefined) {
    throw new Error(`the run names no workflow of the series plan: ${workflowName || "(none)"}`);
  }
  const itemVar = vars[RUN_VARS.item];
  const item = typeof itemVar === "string" ? itemVar : "";
  const run = Number(vars[RUN_VARS.run]);
  return {
    plan,
    workflowName,
    workflow,
    item,
    run,
    vars: Object.fromEntries(
      Object.entries(vars).map(([key, value]) => [
        key,
        // promptfoo hands a provider and an assertion a var that holds JSON as the parsed value.
        typeof value === "string" ? varValue(value) : JSON.stringify(value),
      ]),
    ),
    paths: runPaths(plan, workflowName, item, run),
  };
}

/**
 * Starts a run: refuses at the budget (`BudgetReached`), then gives the run a
 * fresh working copy of its workflow's base (an empty one without a base), an
 * empty config home and no stale debug log, and runs the suite's preparation.
 */
export async function startRun(context: RunContext, hooks: SuiteHooks): Promise<void> {
  assertCanStart(readLedger(context.plan.ledgerFile), context.plan.budgetUsd);
  const { workDir, configHome, debugFile } = context.paths;
  rmSync(debugFile, { force: true });
  mkdirSync(dirname(debugFile), { recursive: true });
  if (context.workflow.fixtureBase === null) {
    rmSync(workDir, { recursive: true, force: true });
    mkdirSync(workDir, { recursive: true });
  } else {
    freshCopy(context.workflow.fixtureBase, workDir);
  }
  rmSync(configHome, { recursive: true, force: true });
  mkdirSync(configHome, { recursive: true });
  rmSync(rawDirOf(context), { recursive: true, force: true });
  await hooks.beforeRun?.(context);
}

function message(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

function readText(file: string): string | undefined {
  return existsSync(file) ? readFileSync(file, "utf8") : undefined;
}

/** Where a run's raw records go: the session result, its debug log, the judge's answers. */
export function rawDirOf(context: RunContext): string {
  return join(
    context.plan.rawDir,
    context.workflowName,
    `${context.item}.run-${String(context.run)}`,
  );
}

/**
 * Keeps a judge's request and answer with the run's raw records, for the
 * spot-check and for `bench regrade`, which finds the judge by `name`.
 */
export function recordJudgement(
  context: RunContext,
  name: string,
  request: JudgeRequest,
  judgement: Judgement,
): void {
  const dir = rawDirOf(context);
  mkdirSync(dir, { recursive: true });
  const recorded: RecordedJudgement = {
    judge: name,
    system: request.system,
    schema: request.schema,
    prompt: request.prompt,
    answer: judgement.output,
  };
  writeFileSync(join(dir, "judge.json"), `${JSON.stringify(recorded, null, 2)}\n`);
}

const MEASUREMENT = "measurement.json";

/** The run's isolation check, then the suite's metrics of an isolated run; written to `measurement.json`. */
export async function measureRun(
  context: RunContext,
  result: EvalResult,
  hooks: SuiteHooks,
): Promise<Measured> {
  let discarded = checkIsolation({
    debugLog: readText(context.paths.debugFile),
    toolCalls: result.response?.metadata?.toolCalls ?? [],
    expectedPlugins: context.workflow.expectedPlugins,
  });
  let measurement: Measurement | null = null;
  if (discarded === null) {
    try {
      measurement = await hooks.measure(context, result);
    } catch (error) {
      discarded = `harness error: ${message(error)}`;
    }
  }
  const measured: Measured = {
    discarded,
    metrics: measurement?.metrics ?? {},
    extraCost: measurement?.extraCost ?? 0,
    models: measurement?.models ?? [],
  };
  const raw = rawDirOf(context);
  mkdirSync(raw, { recursive: true });
  writeFileSync(join(raw, MEASUREMENT), `${JSON.stringify(measured, null, 2)}\n`);
  return measured;
}

function readMeasured(context: RunContext): Measured | null {
  const text = readText(join(rawDirOf(context), MEASUREMENT));
  return text === undefined ? null : (JSON.parse(text) as Measured);
}

/** The pass and score of the item's own assertions, without the harness assertion. */
function itemAssertions(
  grading: GradingResult | null | undefined,
): Record<string, number | null> | null {
  const items = (grading?.componentResults ?? []).filter((component) => {
    const value = component.assertion?.value;
    return !(typeof value === "string" && value.endsWith(HARNESS_ASSERTION_SUFFIX));
  });
  if (items.length === 0) return null;
  return {
    assert_pass: items.every((component) => component.pass) ? 1 : 0,
    assert_score: items.reduce((sum, component) => sum + component.score, 0) / items.length,
  };
}

const ASSERTION_FAILED = 1;

/** The metrics the harness records itself, each only when the session reported it. */
function sessionMetricsOf(
  metadata: NonNullable<EvalResult["response"]>["metadata"],
): Record<string, number> {
  return {
    ...(metadata?.numTurns === undefined ? {} : { turns: metadata.numTurns }),
    ...(metadata?.wallMs === undefined ? {} : { wall_s: metadata.wallMs / 1000 }),
  };
}

/**
 * Charges the ledger and appends the run's row from its `measurement.json`; a
 * run the provider refused at the budget gets no row and no charge (null).
 */
export function afterRun(context: RunContext, result: EvalResult): ResultRow | null {
  const { plan, workflow } = context;
  const metadata = result.response?.metadata;
  if (metadata?.budgetStop === true) return null;
  const raw = rawDirOf(context);
  mkdirSync(raw, { recursive: true });
  writeFileSync(join(raw, "result.json"), `${JSON.stringify(result, null, 2)}\n`);

  let sessionCost: number | null = null;
  try {
    sessionCost = costOf(result);
  } catch {
    // Charged at the run cap below: the most the session could have spent.
  }
  const providerError =
    result.response?.error ??
    (result.failureReason === ASSERTION_FAILED ? null : (result.error ?? null));
  const measured = providerError === null ? readMeasured(context) : null;
  let discarded =
    providerError !== null
      ? `provider error: ${providerError}`
      : (measured?.discarded ?? (measured === null ? "harness error: no measurement" : null));
  // Cost is a reported metric: a run without it is not counted.
  if (sessionCost === null) discarded ??= "no reported cost; the ledger charged the run cap";

  const sessionMetrics = sessionMetricsOf(metadata);
  const metrics = {
    ...measured?.metrics,
    ...itemAssertions(result.gradingResult),
    ...sessionMetrics,
  };
  if (metadata !== undefined) metadata.metrics = metrics;
  const cost = (sessionCost ?? plan.runCapUsd) + (measured?.extraCost ?? 0);
  const models = [...new Set([...modelsOf(result), ...(measured?.models ?? [])])].sort();
  const row: ResultRow = {
    suite: plan.suite,
    series: plan.series,
    workflow: context.workflowName,
    item: context.item,
    run: context.run,
    discarded,
    cost,
    metrics: discarded === null ? metrics : sessionMetrics,
    provenance: {
      models,
      fixtureCommit: workflow.provenance.fixtureCommit,
      benchCommit: workflow.provenance.benchCommit,
      adapter: workflow.provenance.adapter,
    },
  };
  record(plan.ledgerFile, {
    suite: plan.suite,
    workflow: context.workflowName,
    run: context.run,
    cost,
  });
  appendRow(plan.resultsFile, row);
  if (existsSync(context.paths.debugFile)) {
    writeFileSync(join(raw, "debug.log"), readFileSync(context.paths.debugFile));
  }
  return row;
}

/** How a test names the harness assertion, `file://.../assert.ts:grade`. */
export const HARNESS_ASSERTION_SUFFIX = "/harness/assert.ts:grade";

export async function loadSuiteHooks(suite: string): Promise<SuiteHooks> {
  const module = (await import(new URL(`./suites/${suite}/hooks.ts`, import.meta.url).href)) as {
    readonly hooks: SuiteHooks;
  };
  return module.hooks;
}

interface HookContext {
  readonly test?: { readonly vars?: Readonly<Record<string, unknown>> };
  readonly result?: EvalResult & { readonly provider?: { readonly label?: string } };
}

/** The entry point promptfoo calls (`extensions: [file://.../hook.ts:extensionHook]`). */
export function extensionHook(hookName: string, context: HookContext): Promise<HookContext> {
  if (hookName !== "afterEach") return Promise.resolve(context);
  const plan = readPlan(process.env[SERIES_ENV]);
  const result = context.result ?? {};
  // The provider names the workflow in its metadata; a call that threw has only promptfoo's label.
  const workflow = result.response?.metadata?.benchWorkflow ?? result.provider?.label ?? "";
  afterRun(runContext(plan, workflow, context.test?.vars ?? {}), result);
  return Promise.resolve(context);
}
