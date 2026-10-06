---
schema: 1
ticket: A-y1s93nlw
role: verifier
at: 2026-10-06T18:10:01.925Z
status: done-with-concerns
files: []
entries: [ L-9qrhji59, L-2pol2svk ]
evidence: []
---
# Plan verify A-y1s93nlw (attempt 2 of 2)

Verdict: the plan holds, with no blocker. The blocker L-edh9mnuy is resolved in the plan text, and the fix L-fgzdjjq2 / L-yg8exlu3 holds. There are 2 new non-blocking findings. The prior finding L-nrqloa61 is only partly addressed.

## What holds

- **L-edh9mnuy (expandTests form).** 04-run-lifecycle.md:22 restores `expandTests(items, runs)` and `TestCase` to their 825455dd form: no `providers`, no `workflowVars`. Lines 29-30 add series.ts and series.test.ts to 04-1 Files, and series.ts is no longer in 04's do-not-touch (line 7).
  - 825455dd evals/harness/runner.ts:119 calls `expandTests(items, setup.runs)`, so the 05-2 copy now typechecks against the restored signature.
  - The 05-2 case at 05-commands.md:48 now says "6 tests and 2 providers", which is 2 items x 3 runs with one provider per workflow. This matches design.md:37 ("one test per item and run, one column per workflow") and the source runner.test.ts, which asserts that `tests[0]` has no `providers` property.
  - The 02-2 case at 02-leaf-modules.md:43 ("6 tests ordered run 1 item a, run 1 item b, run 2 item a") matches the restored form.
  - Today `expandTests`, `TestCase.providers` and `workflowVars` are used only in harness/series.ts and harness/series.test.ts (checked with grep), so the restore breaks no other caller.
- **L-fgzdjjq2 (ledgerFile, budgetUsd).** At 825455dd, SeriesPlan has `ledgerFile` and `budgetUsd` (series.ts:30-31). They are read by:
  - hook.ts:158 (`assertCanStart`) and hook.ts:315 (`record`)
  - runner.ts:153-155 (`runSeries`)
  - the fixtures of hook.test, provider.test, assert.test and runner.test

  04-1 adds both fields, and 06-2 SmokeSpec already carries them. After that change, RunContext gets every field it needs from SeriesPlan: suite, series, ledgerFile, budgetUsd, runCapUsd, resultsFile, rawDir, sandboxDir, debugDir and workflows. The 04-1 stop rule therefore does not fire.
- **Between parts.** 04 is alone in its wave: it depends on 02 and 03, and 05 depends on 04. 05 and 06 keep series.ts in do-not-touch, and no lockfile or shared state is touched. No isolation issue.
- **Leaf exports.** I diffed the export lines of the committed budget, results, isolation, judge, stats, fixture, paths, tools and tree modules against 825455dd. The only differences are the planned removals and renames: `readSuiteRows`, `EVALS_DIR`/`REPO_ROOT`/`BUNDLE` to `ROOT_DIR`, `needsInstall`/`ensureTools`, and `evalsDir` to `rootDir`. `LedgerEntry.workflow` and `ResultRow.workflow` exist as 04 and 05 expect. I found no other T40 drift.
- **Design coverage.** No requirement, decision or failure path of design.md or spec-delta/bench-runner.md has lost its task since the previous pass (L-xe8d9yiq).

## What does not hold (findings, non-blocking)

- **L-9qrhji59 (BDK-PL-3).** The success-measure at 04-run-lifecycle.md:6 lists five test files and "these five modules". It omits harness/series.test.ts and harness/series.ts, which 04-1 now modifies, so a break there passes part 04's own measure.
- **L-2pol2svk (BDK-EJ-2).** harness/series.ts:1-3 still describes per-workflow expansion. 04-1 restores the code but not the 825455dd header comment, so a stale comment can remain.
- **L-nrqloa61 (prior finding, partly addressed).** 04-1 now says its fixtures use `sandboxDir`. However, the copied fixtures of provider.test.ts:32 (04-2), assert.test.ts:29 (04-4) and runner.test.ts:44 (05-2) still say `sandbox:`. Mapping the 06-2 `SmokeSpec.sandbox` onto `SeriesPlan.sandboxDir` is also still covered only by "use the names the earlier parts export". tsc catches every miss.

## Observation

- Decisions L-2xvdz91l and L-yg8exlu3, which the plan now implements, are still `proposed`, not `accepted`.
