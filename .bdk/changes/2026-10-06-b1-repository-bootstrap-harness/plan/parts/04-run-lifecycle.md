---
schema: 1
id: "04"
title: Run lifecycle - hook, provider, provider entries, assertion, transcript
goal: A run starts in its own directories, is measured, and is recorded as one row with cost, turns, wall time and adapter provenance.
success-measure: "`npx vitest run harness/hook.test.ts harness/provider.test.ts harness/providers.test.ts harness/assert.test.ts harness/transcript.test.ts` passes, and `npx tsc --noEmit` reports no error in these five modules."
do-not-touch: ["package.json", "pnpm-lock.yaml", "harness/results.ts", "harness/budget.ts", "harness/cli.ts", "harness/runner.ts"]
depends-on: ["02", "03"]
spec-impact: [bench-runner]
---

Source: `git -C /Users/broneq/projects/bdk show 825455dd:evals/harness/<name>.ts` and `<name>.test.ts`. Use the names the earlier parts export. Copy rules for every task here: drop BDK design references from comments (`design D-n`, `T40`, `T43`, `openspec/`); rename `cell` to `workflow` everywhere (`cellName` to `workflowName`, `RunContext.cell` to `RunContext.workflow`, `CellPlan` to `WorkflowPlan`); metadata key `bdkCell` to `benchWorkflow`; `bdkCommit` to `benchCommit`; the ledger and row field `cell` to `workflow`.

## 04-1 Run lifecycle and the row

Copy `hook.ts` and `hook.test.ts`. Changes:

- `loadSuiteHooks(suite)` imports `./suites/<suite>/hooks.ts` (relative to `harness/`) and returns its `hooks` export.
- `Measurement` and `Measured` lose `templateHashes`; the row loses `variantHash` and `templateHashes`.
- The row's `provenance` is `{ models, fixtureCommit, benchCommit, adapter }`, the last three read from `context.workflow.provenance`.
- The harness records two metrics itself: `turns` = `metadata.numTurns` and `wall_s` = `metadata.wallMs / 1000`, each only when the session reported it (never 0 for a missing value). They are merged after the suite's metrics, so the harness values win. A discarded row's `metrics` holds only these two; a counted row's holds the suite's, the item assertions' and these two.
- `SeriesPlan` (`harness/series.ts`) gains `readonly ledgerFile: string` and `readonly budgetUsd: number`, as in the source; update `harness/series.test.ts` fixtures. `expandTests(items, runs)` and `TestCase` return to the form at `825455dd` (one test per item and run, no `providers`, no `workflowVars`), and tests; fixtures say `sandboxDir`, not `sandbox`.
- Everything else (budget stop before the run's directories are touched, run cap charged and run discarded without reported cost, no row and no charge for a budget stop, `judge.json` record, `measurement.json`) is unchanged.

**Files:**

- Create: `harness/hook.ts`
- Create: `harness/hook.test.ts`
- Modify: `harness/series.ts`
- Modify: `harness/series.test.ts`

**Test cases:**

- a counted run with `numTurns` 7, `wallMs` 12500 and suite metric `completed` 1 appends a row whose `metrics` equal `{ completed: 1, turns: 7, wall_s: 12.5 }`
- an isolation-discarded run with the same metadata appends a row with `discarded` set and `metrics` equal to `{ turns: 7, wall_s: 12.5 }`
- a session result without `numTurns` gives a row without the key `turns`
- the row has `workflow` equal to the run's workflow name, no `cell` key, and `provenance.adapter` equal to the workflow plan's adapter
- a suite metric `turns` of 99 is replaced by the harness value 7
- a ledger at the budget makes `startRun` throw `BudgetReached`; the run's directories stay untouched
- a provider error discards the run with `provider error:` and the message; a result without a reported cost is charged the run cap and discarded
- `extensionHook("beforeAll", ctx)` returns `ctx` unchanged

**Stop rule:** stop and return `blocked` if `RunContext` needs a field that `series.ts` does not provide.

## 04-2 Harness provider

Copy `provider.ts` and `provider.test.ts`. `RunProviderConfig` is `{ workflow: string; sdk: Record<string, unknown> }`; the class `RunProvider` reads `options.config.workflow`, its `id()` is `bench:<workflow>`, and the response metadata keys are `benchWorkflow`, `wallMs`, `transcript`, and `budgetStop` on a budget stop. Behaviour unchanged: start the run, call the SDK provider with `working_dir`, `debug_file` and an `env` that adds `XDG_CONFIG_HOME` of the run, add wall time and transcript.

**Files:**

- Create: `harness/provider.ts`
- Create: `harness/provider.test.ts`

**Test cases:**

- a run with a workflow base copies the base into the run's working copy and the suite's `beforeRun` sees that copy
- the wrapped session gets `working_dir`, `debug_file` and `XDG_CONFIG_HOME` of this run only, and the sdk's own `env` entries are kept
- a workflow without a base gets an empty working copy
- files an earlier series left in the working copy and debug log are gone
- the response metadata has `benchWorkflow`, `wallMs` (difference of the injected clock) and a `transcript`
- at the budget no session starts, the response has `error` containing `budget reached` and `metadata.budgetStop` true
- a preparation that throws returns `error` starting `harness error:` and `cost` 0
- an unknown workflow name throws and names it

## 04-3 Provider entries

Copy `providers.ts` and `providers.test.ts`. Export `ProviderEntry`, `SessionWorkflow` (was `SessionCell`: `label`, `model`, `plugin: string | null`, `maxBudgetUsd`, optional `maxTurns`, optional `askUserQuestion`) and `sessionProvider(workflow)`. Remove `oneTurnProvider` and `OneTurnCell` (the only consumer is the source's `runner.test.ts`, which part 05 rewrites to build its providers with `sessionProvider`). Fixed options stay: `apiKeyRequired: false`, `ENABLE_CLAUDEAI_MCP_SERVERS` `"false"`, `GIT_CONFIG_GLOBAL` `/dev/null`, `GIT_CONFIG_NOSYSTEM` `1`, `setting_sources` `["project"]`, `permission_mode` `bypassPermissions`, `allow_dangerously_skip_permissions`, `allow_all_tools`, `forward_subagent_text`. `config.workflow` equals the label. The per-run fields stay out (the provider adds them).

**Files:**

- Create: `harness/providers.ts`
- Create: `harness/providers.test.ts`

**Test cases:**

- an entry for label `plain` and `plugin` null has `config.sdk.plugins` equal to `[]` and `config.workflow` `plain`
- an entry with `plugin` `/p` has `plugins` `[{ type: "local", path: "/p" }]`
- the sdk config has no `working_dir` and no `debug_file`
- `maxTurns` 5 sets `max_turns` 5 and `askUserQuestion` true sets `ask_user_question` `{ behavior: "first_option" }`; both absent leave those keys out
- `setting_sources` is `["project"]` and the env disables claude.ai connectors and the user git config

## 04-4 Harness assertion

Copy `assert.ts` and `assert.test.ts`, with the renames. `namedScores`, `gradeOf`, `gradeRun`, `grade` keep their behaviour; the response's workflow is read from `metadata.benchWorkflow`.

**Files:**

- Create: `harness/assert.ts`
- Create: `harness/assert.test.ts`

**Test cases:**

- `namedScores({ a: 1, b: 0.5, c: 7, d: null, e: -1 })` keeps only `a` and `b`
- a suite whose `passOf` returns false fails the run with a reason that lists the scores below 1
- a suite without `passOf` passes every counted run
- a discarded measurement fails with `discarded: <reason>`
- `gradeRun` measures the run of the response's workflow and writes `measurement.json` in that run's raw directory
- a run that is not isolated is discarded without calling the suite's `measure`; a `measure` that throws discards the run with the error text

## 04-5 Transcript

Copy `transcript.ts` and `transcript.test.ts` with the copy rules, and remove the branch of `outcome` that recognises a BDK kernel error object (`"refused": true` with a `rule`) with its test: the bench's viewer text names no workflow's own formats.

**Files:**

- Create: `harness/transcript.ts`
- Create: `harness/transcript.test.ts`

**Test cases:**

- two calls give two numbered lines, each with scope, tool, short input and outcome
- a non-zero `Exit code 2` first line is named `exit 2` and an `is_error` call is named `error: <first line>`; an output holding `"refused": true` and a rule is just `ok`
- a 500-character multi-line input becomes one line of at most 200 characters
- a subagent whose `Agent` call is unknown is named `subagent`
- no calls give an empty transcript
