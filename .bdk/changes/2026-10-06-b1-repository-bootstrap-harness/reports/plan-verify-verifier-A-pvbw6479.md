---
schema: 1
ticket: A-pvbw6479
role: verifier
at: 2026-10-06T17:28:34.556Z
status: blocked
files: []
entries: [ L-yy53yb9x, L-2ory6lv4, L-xu5gvlcj, L-49nvy6t7, L-e3zrwyr6, L-z5yek3ho, L-qge43c00, L-yzhrhjvc, L-avxkr0a2, L-y1pqq7cv ]
evidence: []
reason: "L-yy53yb9x (unresolved-decision): design.md:78 .bdk/settings.yaml typecheck entry and L-27j0iopb architecture.md fixes have no task, and parts 01/07 forbid .bdk/**"
---
# Plan verify: B1 repository bootstrap (A-pvbw6479, attempt 1)

Verified the seven parts together against `broneq/bdk` `evals/` at `825455dd` (every source file read with `git -C /Users/broneq/projects/bdk show`), the current bdk-bench tree, design.md, architecture.md, spec-delta/bench-runner.md and the decisions L-6moot94v, L-hdeesy03, L-ut64a9xo, L-dwhhzkaa, L-ny3yd2vf, L-0aefj6ru, L-27j0iopb.

## Verdict

Blocked by one `unresolved-decision`: two required document changes have no task, and every part that could carry them forbids `.bdk/**`. The code plan itself is sound: the files and symbols exist as stated, dependencies are declared, and the spec scenarios are covered. Eight findings should be fixed in the same revision.

## What holds

- **Source claims.** Every module and test named for copying exists at 825455dd. The exports, signatures, messages and defaults the tasks cite match the source: `BudgetReached` text, `DEFAULT_BUDGET_USD` 100 and `DEFAULT_RUN_CAP_USD` 15, `runPaths` layout, `literalVar`, `seriesStamp`, `freshSeriesName`, `validate` rules, `checkIsolation` reasons, `STRIPPED`, `FixtureMismatch` message, `sandboxOf`, `promptfooEnv`, `costOf`, `afterRun` cap charge and budget stop, the `callRun` error paths, `namedScores`, `gradeOf`, the transcript `refused` branch, `kept()` error text, `probeSummary` lines, `runCompare` exit 2, the `regradeSeries` pre-check. The patch's `+++` targets are the four `dist/src/claude-agent-sdk-*` files, and `versions.json` holds the pin `946a2081...` that both task.yaml files carry.
- **Traced inputs.** (1) `bench smoke --probe` goes through cli 05-1 (suite names from `CliDeps.suites`), then `smokeRunner.run` (skips `assertCommitted`, per L-27j0iopb), `describeSmoke`, `renderSeries` (`bench_item`/`bench_run`, `{{bench_task}}`), the provider (`benchWorkflow` metadata, `wallMs`), the assertion (`measure` reads HELLO.md) and finally `afterRun`, which writes a row with `turns`, `wall_s`, `adapter`. The names match across 02, 04, 05 and 06. (2) `--runs 0` throws `UsageError`, and the CLI exits 2 with the usage text. (3) A ledger at the budget makes `startRun` throw `BudgetReached`, the provider returns `budgetStop`, `afterRun` writes no row and no charge, and `runSeries` returns 1.
- **Dependencies and isolation.** 02 and 03 depend only on 01 and touch disjoint files. Neither changes the lockfile or shared state, so `shared` is right (BDK-PL-4). 04 needs 02 and 03, 05 needs 04, 06 needs 05, 07 needs 06, and every cross-module import goes along these edges. No static cycle: runner imports `UsageError` from cli as a value, and cli imports only budget (BDK-ARCH-1). Suites reach the harness only through `main.ts` and `loadSuiteHooks` (BDK-ARCH-2).
- **Spec and design coverage.** Every spec-delta scenario has a test case:
  - isolation: 02-4, 04-1, 04-2, 02-2
  - budget and missing cost: 02-1, 04-1, 04-2, 05-2
  - row fields and benchCommit refusal: 02-3, 04-1
  - default and zero runs: 05-1
  - fixture pin and stripping: 03-1
  - dirty tree and probe: 03-3, 06-2
  - check: 06-3
  - compare and regrade: 05-3, 05-4

  Every design failure path is covered. Each part names a success measure (BDK-PL-3). Untested modules are declared (judge.ts, main.ts; BDK-TQ-11). No code block holds a function body.
- **Formatting reality.** Prettier 3.9.9 with the source config flags 8 existing files. checklist/*.md and tasks/*/spec.md change only table padding, and task.yaml only comment spacing, so 07-4 is feasible. The exception is one quote change (see L-yzhrhjvc).

## What does not hold

- **L-yy53yb9x (blocker, unresolved-decision).** Two required changes have no task:
  - design.md:78 requires a `tsc` typecheck entry in `.bdk/settings.yaml`, with the commands switched from `npx` to the scripts. Today the file has no typecheck tool.
  - L-27j0iopb requires fixing architecture.md's import slips. Lines 12, 48 and 68 are unchanged: `runner -> cli` is still drawn as type-only, there is no `cli --> budget` edge, and regrade is still said to run "inside the promptfoo process".
- **L-2ory6lv4 (finding).** design.md:60 and :68 contradict the plan: `benchCell` vs `benchWorkflow`, the tree check allowing results/ only, and `SuiteRunner.report` (BDK-ARCH-5).
- **L-xu5gvlcj (finding).** 04-run-lifecycle.md:64 says `oneTurnProvider` has "no consumer". That is false: source runner.test.ts:8 and :25 use it, and 05-2 copies that test without naming a replacement.
- **L-49nvy6t7 (finding).** 06-smoke-suite-and-entry.md:36 never says how `benchCommit` (`headCommit()`), the adapter version (`sdkVersion` of package.json) or the `probeSummary` runs argument are obtained. T43 got its commit from the dropped `buildPluginCopy`.
- **L-e3zrwyr6 (finding).** The 06-2 `run()` tests inject only `assertCommitted`, `prepareFixture` and `evaluate`. The probe test therefore writes the real `.runs/series/smoke/...`, the real sandbox in `~/.cache/bdk-bench` and the real results path. The task also does not say what "returns its refusal" means.
- **L-z5yek3ho (finding).** 07-2 drops the "Per-run directory under concurrency", "`file://` provider's label" and "Viewer" Provider facts. None of them depends on a plugin, and they justify provider.ts and assert.ts. design.md:59 drops only BDK-only rows (BDK-EJ-2).
- **L-qge43c00 (finding).** 05-3 and 02-4 keep the difference-rule verdict column, but design.md:74 says the difference rule is not copied.
- **L-yzhrhjvc (finding).** 07-4 allows quoting changes, but its word-diff test and stop rule trip on them. Prettier rewrites the quotes in tasks/operator-i18n/checks.yaml:263.
- **L-avxkr0a2 (finding).** 07-1 pins `@v4` actions. The source CI that runs `pnpm eval check` uses checkout@v7, action-setup@v6 and setup-node@v7.
- **L-y1pqq7cv (observation).** Smaller verification and plan defects:
  - The cmp at 01:30 runs in the wrong repository.
  - The prettier wording at 01:53 does not match what prettier prints.
  - `git diff --stat` at 07:53 cannot show which sections changed.
  - The 07-4 lint and typecheck fixes conflict with its `do-not-touch` list.
  - `@types/node` 22 is pinned under Node 24.
  - The eslint ignores omit tasks/*/hidden and tasks/*/reference.
  - Two steps fall to the lead with no part: the source commit in the first commit's message, and the model-backed probe acceptance.

## Rules cited

BDK-ARCH-1, BDK-ARCH-2, BDK-ARCH-5, BDK-EJ-2, BDK-PL-2, BDK-PL-3, BDK-PL-4, BDK-TQ-11.
