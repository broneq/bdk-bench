// The harness provider: every rendered config names this module as each
// workflow's provider. A call is one run: it starts the run (`startRun`:
// budget, the run's own working copy, config home and debug log, the suite's
// preparation), then calls `anthropic:claude-agent-sdk` with those paths and
// adds the wall time and the transcript to the response. The SDK provider's
// config is fixed when it loads and `beforeEach` does not know the provider,
// so only a provider can give each run its own directories.
import { BudgetReached } from "./budget.ts";
import { loadSuiteHooks, runContext, startRun } from "./hook.ts";
import type { SuiteHooks, ToolCall } from "./hook.ts";
import { SERIES_ENV, readPlan } from "./series.ts";
import type { SeriesPlan } from "./series.ts";
import { transcript } from "./transcript.ts";

/** The provider entry's `config`: the workflow, and the SDK config without the per-run fields. */
export interface RunProviderConfig {
  readonly workflow: string;
  readonly sdk: Readonly<Record<string, unknown>>;
}

export interface ProviderResponse {
  readonly output?: unknown;
  readonly error?: string;
  readonly cost?: number;
  readonly metadata?: Readonly<Record<string, unknown>>;
}

/** What a call receives from promptfoo; only the vars are read. */
export interface CallContext {
  readonly vars: Readonly<Record<string, unknown>>;
}

export interface InnerProvider {
  callApi(prompt: string, context?: unknown, options?: unknown): Promise<ProviderResponse>;
}

export interface RunDeps {
  readonly plan: () => SeriesPlan;
  readonly hooks: (suite: string) => Promise<SuiteHooks>;
  /** Loads `anthropic:claude-agent-sdk` with the run's config. */
  readonly load: (config: Readonly<Record<string, unknown>>) => Promise<InnerProvider>;
  readonly now: () => number;
}

const SDK_PROVIDER = "anthropic:claude-agent-sdk";

const DEFAULT_DEPS: RunDeps = {
  plan: () => readPlan(process.env[SERIES_ENV]),
  hooks: loadSuiteHooks,
  // promptfoo is imported at call time, so the harness unit-tests without loading it.
  load: async (config) => {
    const { loadApiProvider } = (await import("promptfoo")) as {
      loadApiProvider: (
        id: string,
        context: { options: { config: Readonly<Record<string, unknown>> } },
      ) => Promise<InnerProvider>;
    };
    return loadApiProvider(SDK_PROVIDER, { options: { config } });
  },
  now: () => Date.now(),
};

function envOf(sdk: Readonly<Record<string, unknown>>): Record<string, unknown> {
  const env = sdk.env;
  return typeof env === "object" && env !== null ? { ...(env as Record<string, unknown>) } : {};
}

export async function callRun(
  workflow: string,
  sdk: Readonly<Record<string, unknown>>,
  prompt: string,
  context: CallContext,
  callOptions: unknown,
  deps: RunDeps,
): Promise<ProviderResponse> {
  const plan = deps.plan();
  const run = runContext(plan, workflow, context.vars);
  try {
    await startRun(run, await deps.hooks(plan.suite));
  } catch (error) {
    // No session starts; the runs already started finish.
    if (error instanceof BudgetReached) {
      return { error: error.message, metadata: { benchWorkflow: workflow, budgetStop: true } };
    }
    // A preparation that failed spent nothing: the ledger must not charge the run cap.
    const message = error instanceof Error ? error.message : String(error);
    return { error: `harness error: ${message}`, cost: 0, metadata: { benchWorkflow: workflow } };
  }
  const inner = await deps.load({
    ...sdk,
    working_dir: run.paths.workDir,
    debug_file: run.paths.debugFile,
    env: { ...envOf(sdk), XDG_CONFIG_HOME: run.paths.configHome },
  });
  const started = deps.now();
  const response = await inner.callApi(prompt, context, callOptions);
  const wallMs = deps.now() - started;
  const toolCalls = (response.metadata?.toolCalls ?? []) as readonly ToolCall[];
  return {
    ...response,
    metadata: {
      ...response.metadata,
      benchWorkflow: workflow,
      wallMs,
      transcript: transcript(toolCalls),
    },
  };
}

/** The class promptfoo instantiates for `file://.../provider.ts`. */
export default class RunProvider {
  /** Set by promptfoo after construction from the entry's `label`; left unset here. */
  label?: string;
  private readonly workflow: string;
  private readonly sdk: Readonly<Record<string, unknown>>;

  constructor(options: { readonly config: RunProviderConfig }) {
    this.workflow = options.config.workflow;
    this.sdk = options.config.sdk;
  }

  id(): string {
    return `bench:${this.workflow}`;
  }

  callApi(prompt: string, context: CallContext, callOptions?: unknown): Promise<ProviderResponse> {
    return callRun(this.workflow, this.sdk, prompt, context, callOptions, DEFAULT_DEPS);
  }
}
