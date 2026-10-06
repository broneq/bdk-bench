---
schema: 1
ticket: A-2snzg4fp
role: verifier
at: 2026-10-06T20:50:29.784Z
status: done-with-concerns
files: []
entries: [L-qiayxtz6, L-xuvhu1fk]
evidence: []
---

# plan-verify A-2snzg4fp (attempt 1 of 2, scope full)

Verdict: the plan holds against the current code, design.md, architecture.md and spec-delta/bench-runner.md. No blocker. 2 new findings. The only plan change since the last verify (L-49ju7qh3) is a5320b6: `harness/**` removed from do-not-touch of parts 01 and 07, and `harness/runner.ts` removed from parts 04 and 06 (decisions L-geqc05p3 and L-b4ha6o0l, both still `proposed`). That change only narrows guards on parts that are already done. No task's Files or behaviour changes, and no remaining part's do-not-touch conflicts with the files the review fix changed (providers.ts, providers.test.ts, runner.ts, runner.test.ts, suites/smoke/suite.test.ts).

## Evidence run (read-only)

- `pnpm typecheck`, `pnpm lint`, `pnpm format:check`: clean.
- `pnpm test`: 20 files, 164 tests passed.
- `pnpm bench check`: printed `checked smoke` (part 06 and part 07 success measures).
- `cmp` of patches/promptfoo@0.123.1.patch against 825455dd: identical (01-1).
- `promptfoo` exports `loadApiProvider` (the seam provider.ts relies on).

## Per part

- 01: package.json pins match 01-1 exactly: @types/node 24.19.1, SDK 0.3.284, promptfoo 0.123.1, no ^ or ~. tsconfig, eslint ignores, vitest project, versions.json pin and the `coverage/` ignore match 01-2 and 01-3. The fixture pin appears in versions.json and in both task.yaml files. `.prettierignore` also lists `.gitignore`, which is outside 01-2 text (known, L-fcl18j8l).
- 02: budget, series, results, isolation, judge, stats exports and validations match. series.ts:1-3 header now says one test per run and item (L-2pol2svk addressed). `projection` keeps the `perCell` key and `cell` parameter names (known, L-rlh41ea0 / L-4i6yvxpj).
- 03: fixture, paths, tree and tools exports match. The 03-3 case "an untracked `src/new.ts` ... message contains `src/new.ts`" is still false against tree.ts:25 (`git status --porcelain` without `-uall` lists `src/`). Already logged as L-bdw67ijx, so no new entry.
- 04: hook, provider (`RunProviderConfig { workflow, sdk }`, `id()` = `bench:<workflow>`, metadata `benchWorkflow`/`wallMs`/`transcript`/`budgetStop`), providers (entry `config.workflow` plus `config.sdk`) and assert all match 04-1 to 04-5. The review fix of L-dzhorbso brought providers.ts back to the source shape the 04-3 "Copy" implies (`id` `file://<root>/harness/provider.ts`). No 04-3 case pins that `id`, though; see L-qiayxtz6.
- 05: the cli.ts parser takes suite names from `CliDeps.suites`, `--runs` defaults to 1 and rejects 0 and fractions, and the credentials gate covers run and regrade only. runner.ts `modelsOf` reads `provider.config.sdk.model`, which is consistent with the new entry shape. 05-commands.md:49 still holds the placeholder `abcdef0123…` (L-xuvhu1fk).
- 06: suite.ts matches 06-2. Known and still open: `readVersions()` reads the real ROOT_DIR, and `freshSeriesName` checks `rootDir/results` while rows go to `dirs.resultsDir` (L-d4qsan2j, L-0158y2bb). suite.test.ts lacks the "no file outside temp" case and a `check()` test (L-6qhbjfvu). main.ts wiring matches 06-3.
- 07: ci.yml matches 07-1: actions v7/v6/v7, six run steps in order, no secret. The README has the 5 sections and a Provider facts table of 13 rows, with no em dash and no `evals/`, `hooks.json` or `bdk:`. `.bdk/settings.yaml` has the tsc entry and pnpm script commands, so the design "Tooling and CI" main-thread step is done.

## Across the plan

- Design coverage: every requirement and failure path in design.md and spec-delta has a task. Credentials: 05-1. Budget stop and run cap: 04-1, 04-2. Dirty tree: 03-3, 06-2. Fixture mismatch: 03-1. Isolation discard: 02-4, 04-4. promptfoo exit 100: 05-2. Regrade pre-check: 05-4. Model-free check: 06-2, 07-1. The design's "first commit records the source commit" is still not met (22663df message has no 825455dd; known L-6yzpp622).
- Between parts: depends-on chains are complete (04 to 02/03 for the series.ts edit, 05 to 04 for sessionProvider, 06 to 05). No two independent parts modify one file.
- Isolation: wave 2 (02, 03) has disjoint Files and no shared generated state (BDK-PL-4 satisfied, both shared).
- No implementation code in task blocks.

## Findings

- L-qiayxtz6: 04-run-lifecycle.md:74-80. No case pins the provider entry `id` to the harness provider. This gap let L-dzhorbso through. The code tests now cover it (providers.test.ts:10, runner.test.ts:90-93).
- L-xuvhu1fk: 05-commands.md:49. Placeholder commit `abcdef0123…` is still in the plan, although L-3xo22umd was triaged as replaced (BDK-PL-2).
