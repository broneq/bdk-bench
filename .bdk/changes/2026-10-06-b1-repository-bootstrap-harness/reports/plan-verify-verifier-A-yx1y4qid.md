---
schema: 1
ticket: A-yx1y4qid
role: verifier
at: 2026-10-06T18:07:20.727Z
status: blocked
files: []
entries: [ L-edh9mnuy, L-nrqloa61 ]
evidence: []
reason: "L-edh9mnuy (unresolved-decision): harness/series.ts expandTests is the T40 per-workflow form, so 05-2's copied renderSeries cannot call it and series.ts is do-not-touch in 05"
---
# Plan verify A-yx1y4qid (attempt 1 of 2, scope full): B1 repository bootstrap

Verdict: blocked by one `unresolved-decision`, L-edh9mnuy. The 04 change that answers L-fgzdjjq2 is correct. The blocker comes from checking the plan against the code parts 01-03 actually committed: 02-2 did not copy `expandTests` from 825455dd as its plan said, and part 05 cannot be executed as written.

## The 04 change (L-fgzdjjq2, L-yg8exlu3)

- 04-1 now adds `readonly ledgerFile: string` and `readonly budgetUsd: number` to `SeriesPlan`, and lists `harness/series.ts` and `harness/series.test.ts` in Files. `series.ts` has also been removed from 04's do-not-touch.
- **The source has both fields.** `evals/harness/series.ts:30-31` at 825455dd has them, and they are used by:
  - `hook.ts:158` (`assertCanStart`) and `hook.ts:315` (`record`)
  - `runner.ts:153-155` (`runSeries` budget message)
  - every source suite spec
- **Later parts already assume them.** 06-2's `SmokeSpec` carries `ledgerFile` and `budgetUsd`, and 05-2's "a ledger at the budget makes runSeries return 1" case needs them.
- **Order is safe.** Parts run 04, then 05, then 06, then 07, so no other part touches `series.ts` between 04-1 and the parts that read it. 05 and 06 keep `series.ts` in do-not-touch, which is correct after 04.
- **Tests.** The round-trip test in `series.test.ts:130` (`planIn`, line 22) carries the new fields once its fixture is updated. The 04-1 budget cases (ledger at the budget, run cap charged) test the behaviour.

## Blocker L-edh9mnuy: `expandTests` shape (unresolved-decision)

- **What the code does.** `harness/series.ts:116-143` is `expandTests(workflows, items, runs, workflowVars)`. It makes one test per run, item and workflow, each with `providers: [workflow]`, and `TestCase` gained `providers` (line 79).
  - This is the T40 form. broneq/bdk 4f146f20 ("cells as viewer columns", an ancestor of 825455dd) replaced it with `expandTests(items, runs)`.
  - The 02-2 plan said the function is unchanged.
- **What it contradicts.** design.md:31 says "promptfoo runs one test per item and run, one column per workflow".
- **Why 05-2 breaks.** 05-2 copies `runner.ts`, whose `renderSeries` calls `expandTests(items, setup.runs)` (`runner.ts:113`) and maps prompts to providers. That call does not typecheck, and 05 cannot change `series.ts` (do-not-touch).
- **The options.**
  - (a) Restore the 825455dd `expandTests` and `TestCase`, and their tests. This fits 04-1, which now owns `series.ts`.
  - (b) Record a decision for per-workflow tests (sparse viewer rows, a second per-workflow prompt mechanism), and update design.md:31 and 05-2.
- **Related.** Prior finding L-3hsct71p ("12 tests" in 05-2) is true only under (b).

## What holds (evidence)

- **Leaf exports match the source.** For budget, results, isolation, judge, stats, fixture, paths, tools and tree, the exports match 825455dd apart from the renames and drops the plan names:
  - `readSuiteRows` removed
  - `EVALS_DIR`, `REPO_ROOT` and `BUNDLE` replaced by `ROOT_DIR`
  - `ensureTools` and `needsInstall` removed
  - `resultsFile(.., root = ROOT_DIR)`

  Every import that the source `hook`, `provider`, `assert`, `runner`, `compare`, `regrade` and `main` take from them exists. The exceptions are `expandTests` (blocker above) and `SeriesPlan.sandbox`, now `sandboxDir` (finding below).
- **Traced input: the budget stop.**
  1. `startRun` reads `context.plan.ledgerFile` and `budgetUsd`, which 04-1 now adds.
  2. `assertCanStart(readLedger(..), budgetUsd)` (`budget.ts:49`) throws `BudgetReached`.
  3. The provider returns a `budget reached` error with `metadata.budgetStop` (04-2 case).
  4. `runSeries` prints the message and returns 1 (05-2 case).
- **Traced input: run paths.** `runPaths(plan, workflow, item, run)` (`series.ts:46`) gives `sandboxDir/runs/<workflow>/<item>.run-<n>/{work,config-home}` and `debugDir/<workflow>/<item>.run-<n>.log`, which hook and provider consume.
- **Between parts.** The waves are a single chain (01, then 02 and 03, then 04, 05, 06, 07). No two parts of one wave modify one file, and nothing shares state outside Files, so `shared` stays correct (BDK-PL-4).

## Findings

- **L-nrqloa61** (BDK-PL-2). No plan part names the 02-2 rename of `SeriesPlan.sandbox` to `sandboxDir` (decision L-292on6by, worded as "gains"). The copied fixtures still use `sandbox:`:
  - `hook.test.ts:34`
  - `provider.test.ts:32`
  - `assert.test.ts:29`
  - `runner.test.ts:44`
  - 06-2 `SmokeSpec.sandbox`

  They follow it only through "names as written". tsc catches every miss.
- The seven findings and one observation of A-diur9hxq stand unchanged: L-3hsct71p (now tied to L-edh9mnuy), L-3xo22umd, L-zfku9tci, L-8cd64xty, L-rjk5xjek, L-bepk1p27, L-g49wubbt, and L-iwpe184c.
