---
schema: 1
id: "05"
title: Commands - cli, series runner, comparison, re-grade
goal: The bench command line parses its commands against the registered suites, renders and runs a series, compares two series and re-grades saved judge requests.
success-measure: "`npx vitest run harness/cli.test.ts harness/runner.test.ts harness/compare.test.ts harness/regrade.test.ts` passes, and `npx tsc --noEmit` reports no error in these four modules."
do-not-touch: ["package.json", "pnpm-lock.yaml", "harness/hook.ts", "harness/provider.ts", "harness/series.ts", "harness/results.ts", "harness/budget.ts"]
depends-on: ["04"]
spec-impact: [bench-runner]
---

Source: `git -C /Users/broneq/projects/bdk show 825455dd:evals/harness/<name>.ts` and `<name>.test.ts`. Use the names the earlier parts exported in `harness/series.ts`, `results.ts`, `budget.ts`, `hook.ts`, `providers.ts`. Copy rules for every task here: remove references to BDK design documents from comments (`design D-n`, `T40`, `T43`, `openspec/`); rename `cell` to `workflow` (`CellSetup` to `WorkflowSetup`, `--cells` to `--workflows`, `row.cell` to `row.workflow`); `bdkCommit` to `benchCommit`; `pnpm eval` to `pnpm bench`; "BDK commit" to "bench commit".

## 05-1 Command line

Copy `cli.ts` and `cli.test.ts`. The suite names are no longer a constant: `SuiteName` is `string`, `parseArgs(argv, suites: readonly string[]): Options` takes the known names, and `run(argv, deps)` passes `Object.keys(deps.suites)`. `SuiteRunner` is `{ run(options): Promise<number>; check(): Promise<void> }` (no `report`). Commands: `<suite> [--probe] [--runs N] [--budget USD] [--run-cap USD] [--concurrency N] [--workflows a,b] [--items x,y]`; `check`; `view`; `report <suite> --baseline <series> --candidate <series>` (both required); `regrade <suite> --series <name>`. `--runs` is an integer of at least 1 and defaults to 1; `--budget` 100, `--run-cap` 15, `--concurrency` 4. Remove the flags `--skill`, `--tasks`, `--fixture`, `--case`, `--patches` and the `RunOptions` fields they set. `check` calls every suite's `check` and prints `checked <names joined by ", ">`. `run` and `regrade` need credentials (`ANTHROPIC_API_KEY` or a Claude Code login) and exit 1 with the two-way message otherwise; `check`, `view`, `report` do not.

**Files:**

- Create: `harness/cli.ts`
- Create: `harness/cli.test.ts`

**Test cases:**

- `parseArgs(["smoke"], ["smoke"])` gives `runs` 1, `budget` 100, `runCap` 15, `concurrency` 4, `probe` false
- `parseArgs(["smoke","--probe","--runs","3","--budget","40","--run-cap","8","--concurrency","2","--workflows","plain","--items","hello"], ["smoke"])` returns those values with `workflows` `["plain"]` and `items` `["hello"]`
- `--runs 0` and `--runs 1.5` throw `UsageError`; `--runs 1` is accepted
- `report smoke --baseline a --candidate b` parses to a compare of `a` and `b`; `report smoke` and `report smoke --baseline a` throw `UsageError` naming `--baseline` and `--candidate`
- `regrade smoke --series s1` parses; `regrade smoke` throws naming `--series`
- an unknown suite throws and the message lists the known names; `--case x` throws `unknown flag --case`
- `run` with no credentials returns 1 and prints a message naming `ANTHROPIC_API_KEY` and `claude auth login` before the suite runs; `check` and `view` run without credentials
- `check` with two registered suites calls both and prints `checked a, b`
- a usage error prints the message and the usage text and returns 2

## 05-2 Series rendering and probe summary

Copy `runner.ts` and `runner.test.ts`. Keep `renderSeries(setup, dir)`, `runSeries(setup, rendered, io)`, `seriesFilter`, `probeSummary(rows, runsPerWorkflow, budgetUsd, spentUsd, sample?)`, `SeriesSetup`, `WorkflowSetup { provider; plan: WorkflowPlan; prompt? }`, `SeriesIo`, `RenderedSeries`. The config `description` is `<suite> <series> bench@<first 7 of benchCommit> <models>` and `tags` is `{ suite, series, benchCommit, model }`. `runSeries` still treats promptfoo exit 0 and 100 as a finished series, returns 1 with the budget-reached message when the ledger reached the budget, and returns other codes with `promptfoo exited with <code>; raw output in <file>`. `UsageError` is imported as a value from `cli.ts`.

The copied test builds its providers with `sessionProvider` (from `providers.ts`) with `plugin` null instead of the removed `oneTurnProvider`.

**Files:**

- Create: `harness/runner.ts`
- Create: `harness/runner.test.ts`

**Test cases:**

- 2 workflows, 2 items, 3 runs render 12 tests, `maxConcurrency` equal to the setup's concurrency, the extension hook and the harness assertion in `defaultTest`
- the description of series `s1` of suite `smoke` at commit `abcdef0123…` with model `m` is `smoke s1 bench@abcdef0 m`
- two workflows with the same prompt share one prompt entry, and a workflow with its own prompt gets its own entry labelled by that workflow
- `only: { workflows: ["plain"] }` keeps one provider; an unknown workflow throws `UsageError` containing `unknown workflow nope; known workflows: plain`
- an `evaluate` that resolves 100 makes `runSeries` return 0; one that resolves 3 returns 3 and prints the output file
- a ledger at the budget makes `runSeries` return 1 and print `budget reached`
- `probeSummary` of one row costing 0.5 for 5 runs prints `plain: 0.50 USD per run, 2.50 USD for 5 runs` and `projected series: 2.50 USD`; a discarded row is listed with its reason; a sample of 1 of 4 items scales the cost by 4

## 05-3 Series comparison

Copy `compare.ts` and `compare.test.ts`. `compareSeries(suite, baseline, candidate)` and `runCompare(resultsDir, suite, baseline, candidate, io)` keep their behaviour; the table columns are `workflow | item | metric | baseline | candidate | candidate vs baseline`, the header line names `bench <commits>`, rows are read from `<resultsDir>/<suite>/<series>.jsonl`, and the verdict text comes from `stats.ts` unchanged (a side with fewer than 2 counted values reads `fewer than 2 counted runs`, and the values still print).

**Files:**

- Create: `harness/compare.ts`
- Create: `harness/compare.test.ts`

**Test cases:**

- the header of each series names its models and the first 7 characters of its bench commits and the counted and discarded row counts
- two series with 2 counted runs each give a row per workflow, item and metric (cost included), and discarded rows are left out
- a workflow or item that only one series has prints `n/a` for the other side
- one counted run per side prints both values and `fewer than 2 counted runs`
- a series without rows returns exit 2 and prints the suite's available series

## 05-4 Re-grade

Copy `regrade.ts` and `regrade.test.ts`. `regradeSeries(suite, series, deps, io)` keeps its behaviour with `row.workflow`: it checks every counted row's `judge.json` before the first judge call, judges each saved request with the suite's current instructions, charges the ledger with `{ suite, workflow, run, cost }`, rewrites the judged metrics and `provenance.judgeHash`, and writes the series file in place. It returns 2 for a suite without `judges`, for a missing `judge.json`, and for a series without rows.

**Files:**

- Create: `harness/regrade.ts`
- Create: `harness/regrade.test.ts`

**Test cases:**

- two counted rows with saved requests are judged again with the current system prompt, their judged metrics are replaced, other metrics are kept, and `provenance.judgeHash` is set
- a discarded row is copied unchanged and not judged
- a suite whose hooks have no `judges` returns 2 and the judge is never called
- one counted row without its `judge.json` returns 2 before any judge call and the message names the workflow, item and run
- a series file with no rows returns 2
- each judge call adds a ledger entry with the judge's cost
