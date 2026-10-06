---
schema: 1
ticket: A-qy7ysb9p
role: integration-reviewer
at: 2026-10-06T20:34:43.798Z
group: integration
status: done-with-concerns
files: []
entries: [L-dzhorbso, L-6yzpp622, L-d4qsan2j, L-optesnfc, L-l5f27dvo, L-cnzew85t, L-o1y0084r, L-rdvhne2g, L-dqbq4i8b, L-k6tfu4n7]
evidence: []
---

# Integration review: B1 repository bootstrap (range 6b26034..d353774)

## Verdict

The parts fit at almost every seam. One seam is broken, and that breaks the purpose of the Change. The rendered promptfoo configs never load the harness provider, so a real run gets no fixture copy, no debug log, no per-run config home, no budget check before the session and no wall time. Unit tests and `pnpm bench check` stay green because each part was tested against the flat entry shape and promptfoo accepts that shape. This is blocking (L-dzhorbso, category integration-failure).

## What breaks: provider wiring (L-dzhorbso)

- `harness/providers.ts:28-60` `sessionProvider` returns `id: "anthropic:claude-agent-sdk"` with flat SDK options plus `workflow`. The source at 825455dd returned `id: file://<harness>/provider.ts` with `config: { cell, sdk }`, and plans 04-3 and 06-2 asserted `config.sdk.plugins`.
- `harness/runner.ts:109-112` spreads the entry into `providers` as is. `runner.ts:78` reads `config.model`, which matches the flat shape.
- `harness/provider.ts` (`RunProvider`, `callRun`) has no production reference. Only `provider.test.ts` imports it.
- Effect, traced through promptfoo's SDK provider (`claude-agent-sdk-*.js:570`): a session without `working_dir` runs in a fresh tmp directory. `gradeRun` then throws on an empty `benchWorkflow`. `afterRun` discards the row ("no measurement", or the provider/assertion error), and `wall_s` is never set.
- Spec-delta requirements this leaves unmet in practice: Per-run isolation; Budget ledger ("SHALL NOT start a run" at the budget, because `startRun` never runs); One row per run (wall time). The design's acceptance run `bench smoke --probe` cannot pass.

## What holds

- CLI to suite: `cli.ts` takes suite names from `CliDeps.suites`. `main.ts` registers `smoke` and passes `loadSuiteHooks` to regrade. `loadSuiteHooks` resolves `harness/suites/<name>/hooks.ts`. No static cycle (BDK-ARCH-1).
- Plan file contract: `renderSeries` writes `plan.json` with `ledgerFile`, `budgetUsd`, `runCapUsd`, `rawDir`, `sandboxDir`, `debugDir`, `workflows`. `runSeries` passes `BENCH_SERIES`. The hook and the assertion read it. `runPaths` and `rawDirOf` agree on the `<workflow>/<item>.run-<n>` naming.
- Row contract: `afterRun` builds `workflow`, harness `turns`/`wall_s` merged last, and `provenance { models, fixtureCommit, benchCommit, adapter }` from the workflow plan. `results.ts` validates it. `compare.ts` and `regrade.ts` read `row.workflow` and the same `results/<suite>/<series>.jsonl` path that `paths.resultsFile` and the smoke suite write.
- Budget stop: the provider (once wired) returns `budgetStop`. `afterRun` skips the row and the charge. `runSeries` reports the reached budget after promptfoo exits.
- Smoke suite: `describeSmoke` fills `adapter { plain, <pinned SDK version> }`, `expectedPlugins` 0 and the prompt var. A probe skips `assertCommitted`. `check` renders 1 and 5 runs and validates them without credentials.
- Docs: README "Running", "Budget", "Isolation" and CLAUDE.md "Development commands" match the parser and scripts. The README's isolation text is true only once L-dzhorbso is fixed.
- Unplanned files: none. Every non-`.bdk/` file in the range is declared in some task's `Files:`.

## Smaller items

- L-6yzpp622 (finding, low): design.md requires the first commit to name source commit `825455dd`. It does not.
- L-d4qsan2j (observation): the smoke runner reads `versions.json` from `ROOT_DIR` rather than the injected `dirs`, and `check()` repeats the 100/15/4 defaults (BDK-ARCH-5).
- L-optesnfc (observation): the `assertCommitted` message keeps the status code on the first path. Its comment misstates why `.bdk/` is exempt.
- L-l5f27dvo (observation): two unrelated `modelsOf` functions, in runner.ts and results.ts (BDK-CQ-1).

## Duplication across parts

Apart from the `modelsOf` name clash and the repeated defaults above, I found none. Error-to-message conversion is inlined in hook.ts, provider.ts and suite.ts. That is three short one-liners and not worth extracting.

## Areas

- dependencies: The root package now pins the Agent SDK, promptfoo with a patch that returns the last session result and sums turns, and the dev tools, all exactly. Install scripts of five native packages are off (L-cnzew85t).
- configuration: CI runs install, lint, format, typecheck, tests and the model-free `bench check` on PRs. Runs read `BENCH_SERIES` and put promptfoo state and sandboxes under `XDG_CACHE_HOME`. The check does not catch the broken provider wiring (L-o1y0084r).
- public-api: A new `pnpm bench` CLI with run, check, view, report and regrade. The committed result-row JSONL format carries adapter provenance and harness turns and wall time. New ledger and plan formats and suite interfaces (L-rdvhne2g).
- secrets: The credential gate checks only that an API key or Claude Code login is present and prints no secret. Raw results and debug logs stay in the gitignored `.runs/` (L-dqbq4i8b).
- auth: Sessions run with bypassPermissions in sandbox copies. Reading hidden material by absolute path stays an accepted risk owned by B3/B4 (L-dqbq4i8b, L-1wrdf16i).
- migration: Only new stored formats are introduced. The fixture cache format bump forces a rebuild of any older base and migrates no data (L-k6tfu4n7).
