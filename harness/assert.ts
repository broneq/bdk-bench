// The harness assertion: every test carries
// `{ type: javascript, value: file://.../assert.ts:grade }`. It measures the
// run (`measureRun`) and turns the metrics into what the promptfoo viewer
// shows: named scores, pass or fail, and a reason. The `afterEach` hook
// writes the row from the same measurement.
import { loadSuiteHooks, measureRun, runContext } from "./hook.ts";
import type { EvalResult, Measured, SuiteHooks } from "./hook.ts";
import { SERIES_ENV, readPlan } from "./series.ts";
import type { SeriesPlan } from "./series.ts";

export interface GradeResult {
  readonly pass: boolean;
  readonly score: number;
  readonly reason: string;
  readonly namedScores: Readonly<Record<string, number>>;
}

/** What promptfoo passes a `javascript` assertion; only the vars and the response are read. */
export interface AssertionContext {
  readonly vars: Readonly<Record<string, unknown>>;
  readonly providerResponse?: EvalResult["response"];
}

/**
 * The metrics the viewer can show as named scores: it shows a named score as a
 * share of its maximum, so only metrics in [0, 1] read correctly. Cost, turns
 * and wall time go to the row's metadata instead.
 */
export function namedScores(
  metrics: Readonly<Record<string, number | null>>,
): Record<string, number> {
  return Object.fromEntries(
    Object.entries(metrics).filter(
      (entry): entry is [string, number] =>
        entry[1] !== null && Number.isFinite(entry[1]) && entry[1] >= 0 && entry[1] <= 1,
    ),
  );
}

export function gradeOf(measured: Measured, hooks: Pick<SuiteHooks, "passOf">): GradeResult {
  if (measured.discarded !== null) {
    return { pass: false, score: 0, reason: `discarded: ${measured.discarded}`, namedScores: {} };
  }
  const scores = namedScores(measured.metrics);
  const pass = hooks.passOf?.(measured.metrics) ?? true;
  const below = Object.entries(scores)
    .filter(([, value]) => value < 1)
    .map(([name, value]) => `${name}=${String(value)}`);
  const reason = pass ? "counted" : `failed${below.length === 0 ? "" : `: ${below.join(", ")}`}`;
  return { pass, score: pass ? 1 : 0, reason, namedScores: scores };
}

export interface GradeDeps {
  readonly plan: () => SeriesPlan;
  readonly hooks: (suite: string) => Promise<SuiteHooks>;
}

export async function gradeRun(context: AssertionContext, deps: GradeDeps): Promise<GradeResult> {
  const plan = deps.plan();
  const response = context.providerResponse ?? {};
  const run = runContext(plan, response.metadata?.benchWorkflow ?? "", context.vars);
  const hooks = await deps.hooks(plan.suite);
  return gradeOf(await measureRun(run, { response }, hooks), hooks);
}

/** The function promptfoo calls. */
export function grade(_output: unknown, context: AssertionContext): Promise<GradeResult> {
  return gradeRun(context, {
    plan: () => readPlan(process.env[SERIES_ENV]),
    hooks: loadSuiteHooks,
  });
}
