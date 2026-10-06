---
schema: 1
id: "02"
title: Ledger, plan, row and shared leaf modules
goal: The modules with no harness imports exist under harness/ with the bench names, each with its unit tests.
success-measure: "`npx vitest run harness/budget.test.ts harness/series.test.ts harness/results.test.ts harness/isolation.test.ts harness/stats.test.ts` passes and `npx eslint harness/budget.ts harness/series.ts harness/results.ts harness/isolation.ts harness/judge.ts harness/stats.ts` is clean."
do-not-touch: ["package.json", "pnpm-lock.yaml"]
depends-on: ["01"]
spec-impact: [bench-runner]
---

Source of every copied file and its test: `git -C /Users/broneq/projects/bdk show 825455dd:evals/harness/<name>.ts` and `<name>.test.ts`. Copy rules for every task here: remove references to BDK design documents from comments (`design D-n`, `T40`, `T43`, `openspec/`, `docs/`) and keep the explanation; rename `cell` to `workflow` in identifiers, strings, test titles and comments; rename `bdkCommit` to `benchCommit`. A `pnpm eval` mention becomes `pnpm bench`.

## 02-1 Budget ledger

Copy `budget.ts` and `budget.test.ts`. `LedgerEntry` becomes `{ suite, workflow, run, cost, at }` (field `cell` renamed `workflow`). `BudgetReached` keeps its message. `DEFAULT_BUDGET_USD` stays 100, `DEFAULT_RUN_CAP_USD` 15. Every other export and signature is unchanged: `readLedger`, `spent`, `record`, `assertCanStart`, `runCap`, `projection` (its `perCell` key stays as the object key of the argument), `costOf`.

**Files:**

- Create: `harness/budget.ts`
- Create: `harness/budget.test.ts`

**Test cases:**

- a ledger file that does not exist reads as no entries and sums to 0; two entries of different suites sum to their costs
- `assertCanStart` with 100 spent of a 100 budget throws `BudgetReached` whose message contains `budget reached: 100.00 USD spent of 100 USD`
- `runCap` with 95 spent, budget 100 and cap 15 returns 5; with 10 spent returns 15; with 120 spent returns 0
- `record` appends an entry that has `workflow` and no `cell` key
- `projection({ plain: 0.5 }, 5)` returns `perCell.plain` 2.5 and `total` 2.5
- `costOf` returns `response.cost` when present, else the sum of `metadata.modelUsage.*.costUSD`, and throws when neither exists

## 02-2 Series plan, run variables and test expansion

Copy `series.ts` and `series.test.ts`. Names: `SERIES_ENV` = `"BENCH_SERIES"`; `RUN_VARS` = `{ item: "bench_item", run: "bench_run" }`. `CellPlan` becomes `WorkflowPlan { expectedPlugins: number; fixtureBase: string | null; provenance: WorkflowProvenance; settings }` where `WorkflowProvenance` is `{ fixtureCommit: string | null; benchCommit: string; adapter: { name: string; version: string } }` (no `variantHash`). `SeriesPlan.cells` becomes `workflows: Record<string, WorkflowPlan>`. `runPaths(plan, workflow, item, run)` keeps its layout `runs/<workflow>/<item>.run-<n>/{work,config-home}` and `debugDir/<workflow>/<item>.run-<n>.log`. `literalVar`, `varValue`, `expandTests`, `seriesStamp`, `freshSeriesName`, `writePlan`, `readPlan`, `EvalItem`, `TestCase` are unchanged.

**Files:**

- Create: `harness/series.ts`
- Create: `harness/series.test.ts`

**Test cases:**

- `expandTests` of 2 items and 3 runs gives 6 tests ordered run 1 item a, run 1 item b, run 2 item a, and each test's vars hold `bench_item` and `bench_run`
- a var value `{{ x }}` is wrapped as `{% raw %}{{ x }}{% endraw %}` and `varValue` returns the original text
- a value that contains `{% endraw %}` makes `literalVar` throw
- `runPaths` of two workflows or two runs of one item share no directory and no debug file
- `readPlan(undefined)` throws an error that names `BENCH_SERIES`
- `seriesStamp(new Date("2026-10-05T08:00:13Z"))` is `2026-10-05-080013`; `freshSeriesName("probe-x", taken)` gives `probe-x-2` when `probe-x` is taken

## 02-3 Result rows

Copy `results.ts` and `results.test.ts`. `ResultRow` is `{ suite, series, workflow, item, run, discarded: string | null, cost, metrics: Record<string, number | null>, provenance }` with `provenance` `{ models: string[]; fixtureCommit: string | null; benchCommit: string; adapter: { name: string; version: string }; judgeHash?: string }`. `validate` refuses: a counted row without models; a `benchCommit` that is not 40 hex characters; a non-null `fixtureCommit` that is not 40 hex characters; an `adapter.name` or `adapter.version` that is empty. Remove `variantHash`, `templateHashes` and `readSuiteRows`. `appendRow`, `writeRows`, `readRows`, `modelsOf` keep their signatures.

**Files:**

- Create: `harness/results.ts`
- Create: `harness/results.test.ts`

**Test cases:**

- rows appended with `appendRow` read back equal and in order from the JSONL file
- a row with `adapter.version` `""` is refused with a message naming `adapter`
- a counted row with `models: []` is refused; a discarded row with `models: []` is accepted
- a row with `benchCommit` `abc` is refused with a message naming `benchCommit`
- `modelsOf` of a result whose `modelUsage` has keys `b` and `a` returns `["a", "b"]`

## 02-4 Isolation, judge call and statistics

Copy `isolation.ts`, `isolation.test.ts`, `judge.ts`, `stats.ts`, `stats.test.ts` with the copy rules above, no other change (`judge.ts` has no test file in the source and gets none).

**Files:**

- Create: `harness/isolation.ts`
- Create: `harness/isolation.test.ts`
- Create: `harness/judge.ts`
- Create: `harness/stats.ts`
- Create: `harness/stats.test.ts`

**Test cases:**

- a debug log with `Loaded 1 directory-loaded plugins` and `[claudeai-mcp] Disabled via env var` and no MCP call is isolated when 1 plugin is expected
- a log that shows 2 directory-loaded plugins is discarded with a reason that contains `expected 1` and `2`
- a log without the connector line is discarded with a reason naming `ENABLE_CLAUDEAI_MCP_SERVERS`
- a tool call named `mcp__x__y` discards the run and the reason names the tool
- an undefined debug log discards the run with `no session log`
- `median([1, 2, 3, 10])` is 2.5 and `range([4, 9, 5])` is 5
- `compare([1, 1], [5, 5])` names `b` as higher; `compare([1, 5], [3, 3])` is `no-difference`; a cell with 1 value throws
