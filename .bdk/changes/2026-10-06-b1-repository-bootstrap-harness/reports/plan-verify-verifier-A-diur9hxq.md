---
schema: 1
ticket: A-diur9hxq
role: verifier
at: 2026-10-06T17:43:22.384Z
status: done-with-concerns
files: []
entries: [ L-3hsct71p, L-3xo22umd, L-zfku9tci, L-8cd64xty, L-rjk5xjek, L-bepk1p27, L-g49wubbt, L-iwpe184c ]
evidence: []
---
# Plan verify A-diur9hxq (attempt 2 of 2): B1 repository bootstrap

Verdict: no blocker. The plan is executable against the source `broneq/bdk@825455dd` (`evals/harness/*.ts`, tests, `evals/suites/regression/suite.ts`, root configs, `.github/workflows/tests.yml`, `evals/README.md`) and covers the design, the spec delta and decision L-27j0iopb. Seven findings and one observation remain; none is execution-critical.

## Earlier attempt

- Blocker L-yy53yb9x is settled: design.md:78 assigns the `.bdk/settings.yaml` typecheck entry to the main thread after execute; architecture.md:48-49 now draw `runner -> cli` as a value import and `cli --> budget`, and architecture.md:69 places `regrade`'s `loadSuiteHooks` in the CLI process.
- The eight findings in L-jqfdawfn are fixed in the plan or design: design.md:60/68 now say `benchWorkflow`, `results/` and `.bdk/`, `SuiteRunner (run, check)` (L-2ory6lv4). 05-2 builds its test providers with `sessionProvider` (L-xu5gvlcj). 06-2 names `headCommit`, `sdkVersion` and the `runs` argument (L-49nvy6t7), injects `dirs` and states the refusal as print plus return 1 (L-e3zrwyr6). 07-2 keeps 13 Provider facts rows (L-z5yek3ho). design.md:74 keeps the verdict column (L-qge43c00). 07-4 compares words with the regex `[[:alnum:]_.-]+` (L-yzhrhjvc). 07-1 uses checkout@v7, action-setup@v6 and setup-node@v7 (L-avxkr0a2).

## What holds (evidence)

- **Symbols exist as stated.** Every export the parts keep or rename exists in the source: budget, series, results, isolation, stats, fixture, paths, tree, tools, hook, provider, providers, assert, transcript, cli, runner, compare and regrade. The removed symbols have no consumer left after the BDK suites are dropped. `readSuiteRows`, `ensureTools`/`needsInstall` and `oneTurnProvider` are used only by the dropped suites, `main.ts`, and their own tests or `runner.test.ts`, and 05-2 replaces that test's use.
- **Traced inputs.**
  - A smoke probe goes `cli.parseArgs` (runs 1), then `smokeRunner.run` (assertCommitted skipped), `prepareFixture` into `.runs/cache`, `describeSmoke`, `renderSeries` and `promptfooconfig.json`/`plan.json`.
  - In the run, `RunProvider.callRun` calls `startRun` with `metadata.benchWorkflow` and `wallMs`. Next, `assert.grade` calls `measureRun`, which writes `measurement.json`, and `extensionHook` calls `afterRun`. That writes the row with `turns` (patched `numTurns`, patch lines 17-40) and `wall_s`, plus `provenance.adapter` from `WorkflowPlan`.
  - `report smoke --baseline a --candidate b` goes to `runCompare(<root>/results, ...)`. `regrade smoke --series s` goes to `loadSuiteHooks('smoke')`, which has no `judges`, so it exits 2.
- **Tooling.**
  - The devDependency versions exist at 825455dd. `@types/node@24.19.1` exists on npm (published 2026-10-01), and Node is 24 per `.nvmrc`.
  - The source `pnpm-workspace.yaml` already points at `patches/promptfoo@0.123.1.patch`. The patch targets four `dist/src/claude-agent-sdk-*` files.
  - `node_modules/`, `.runs/` and `.env` are already in `.gitignore`.
- **07-4 is safe.** Prettier 3.9.9 with the source `.prettierrc.json` reports 7 pre-existing files (checklist/schema.md, checklist/skipped-rules.md, tasks/*/spec.md, tasks/*/task.yaml, tasks/operator-i18n/checks.yaml) plus README.md, which 07-2 rewrites. Piping each one's formatted output through the plan's word-diff regex shows no word change, only table padding, YAML quote style and comment spacing.
- **Provider facts.** The source table has 20 rows. The 13 kept rows and the 7 dropped rows in 07-2 partition it exactly.
- **Design coverage.**
  - Every keep, rename and drop item in design.md:55-64 has a task.
  - So does every failure path in design.md:80-88: credentials (05-1), budget (02-1, 04-1, 04-2, 05-2), dirty tree and probe exemption (03-3, 06-2), FixtureMismatch and stamp (03-1), discards (02-4, 04-1, 04-4), promptfoo exit codes (05-2), and regrade pre-check and no judges (05-4).
  - Every spec-delta scenario has a case.
- **Between parts.** Waves are 01, then {02, 03}, then 04, 05, 06, 07. 02 and 03 have disjoint `Files:`, neither installs, and their imports stay inside the part (paths reaches fixture as a type only, tree imports paths). No shared state outside `Files:`, so `shared` is right (BDK-PL-4). Changed signatures are used in their new form downstream: `parseArgs(argv, suites)`, `SuiteRunner` without `report`, `WorkflowPlan`, and `resultsFile(.., root)`.
- **Rules.** Every part names a success measure (BDK-PL-3). 06-3 declares no unit test for the wiring module (BDK-TQ-11). Test cases name inputs and observable results. No task code block contains a function body.

## Findings (not blocking)

1. L-3hsct71p: 05-commands.md:48 says "render 12 tests" for 2 workflows x 2 items x 3 runs. renderSeries writes 6 tests and 2 providers. Read literally, the case fails or invites a change that doubles every run.
2. L-3xo22umd: 05-commands.md:49 uses the placeholder `abcdef0123…` as a test input (BDK-PL-2).
3. L-zfku9tci: 07-ci-docs-format.md:40 runs every README command that needs no credentials. `pnpm bench view` starts the viewer and blocks. The case should also name `smoke`/`regrade` as never run, because a logged-in Claude Code counts as credentials.
4. L-8cd64xty: the 06-smoke-suite-and-entry.md:36 step list omits `only: seriesFilter(options)`, and no case checks `--items`/`--workflows` on smoke. It also has wiring slips: ROOT_DIR/RUNS_DIR where it should use deps.dirs, and `resultsDir` where resultsFile expects the root.
5. L-rjk5xjek: design.md:70 ("HELLO.md exists") disagrees with 06-1 (trimmed content is exactly `hello`) (BDK-ARCH-5).
6. L-bepk1p27: the fixture pin lives in versions.json and in each task.yaml, with no lasting guard (BDK-ARCH-5).
7. L-g49wubbt: design.md:14 says the first commit records the source commit, and no task does this.

Observation L-iwpe184c (BDK-EJ-2): the README example row's denominators (19/11/11/10 = 51) do not match task.yaml check_counts (20/11/12/11 = 54).

## Not a plan task

The model-backed acceptance proof (`bench smoke --probe`, then `bench view`; design.md:99) needs the user to approve its cost first. The `.bdk/settings.yaml` update falls to the main thread after execute (design.md:78).
