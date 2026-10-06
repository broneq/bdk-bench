---
schema: 1
id: "06"
title: Smoke suite and the bench entry point
goal: "`pnpm bench smoke --probe` can run one plain Claude Code session on the fixture and record its row, and `pnpm bench check` validates the rendered configs without a model."
success-measure: "`npx vitest run harness/suites` passes, `pnpm bench check` exits 0 and prints `checked smoke`, and `npx tsc --noEmit` and `npx eslint .` are clean for the whole project."
do-not-touch: ["package.json", "pnpm-lock.yaml", "harness/hook.ts", "harness/provider.ts", "harness/cli.ts", "harness/runner.ts", "harness/series.ts", "harness/results.ts"]
depends-on: ["05"]
spec-impact: [bench-runner]
---

Use the exports of the earlier parts as written. The suite is new code, modelled on `regressionRunner` and `describeRegression` in `git -C /Users/broneq/projects/bdk show 825455dd:evals/suites/regression/suite.ts`; it has no BDK plugin, no kernel call and no task directory.

## 06-1 Smoke measurement

Create `harness/suites/smoke/hooks.ts` exporting `hooks: SuiteHooks` with `measure` and `passOf`. `measure(context)` reads `HELLO.md` in `context.paths.workDir` and returns `{ metrics: { completed }, extraCost: 0 }` where `completed` is 1 when the file's content with surrounding whitespace trimmed is exactly `hello`, else 0 (a missing file is 0). `passOf(metrics)` is true when `completed` is 1.

**Files:**

- Create: `harness/suites/smoke/hooks.ts`
- Create: `harness/suites/smoke/hooks.test.ts`

**Test cases:**

- `HELLO.md` holding `hello\n` gives `completed` 1 and `passOf` true
- no `HELLO.md` gives `completed` 0 and `passOf` false
- `HELLO.md` holding `hello world` gives 0; holding `Hello` gives 0
- `loadSuiteHooks("smoke")` from `harness/hook.ts` resolves to this module's `hooks`

## 06-2 Smoke series description and runner

Create `harness/suites/smoke/suite.ts` exporting: `SMOKE_PROMPT` = `Create a file HELLO.md that contains the single line hello.`; `sdkVersion(packageJsonText: string): string` returning `dependencies["@anthropic-ai/claude-agent-sdk"]` and throwing when absent; `describeSmoke(spec: SmokeSpec): SeriesSetup`; `smokeRunner(io, deps?): SuiteRunner` where `SmokeDeps` is `{ assertCommitted, headCommit, prepareFixture, evaluate, dirs: { rootDir, runsDir, sandboxDir, ledgerFile, resultsDir } }` and the default is the real functions and the locations of `paths.ts`. `SmokeSpec` is `{ series, dir, sandbox, runs, budgetUsd, runCapUsd, ledgerFile, resultsFile, concurrency, fixtureBase, fixtureCommit, benchCommit, sdkVersion, only? }`.

`describeSmoke`: suite `smoke`, one workflow `plain` whose provider is `sessionProvider({ label: "plain", model: "claude-opus-5-5", plugin: null, maxBudgetUsd: runCapUsd, askUserQuestion: true })` and whose plan has `expectedPlugins` 0, `fixtureBase`, `provenance` `{ fixtureCommit, benchCommit, adapter: { name: "plain", version: sdkVersion } }`; one item `hello` with the prompt as a var, the series prompt `{{bench_task}}`; `rawDir` `<dir>/raw`, `debugDir` `<dir>/debug`.

`smokeRunner(io, deps).run(options)`: unless `options.probe`, call `deps.assertCommitted()`, and when it throws print its message with `io.printError` and return 1 before anything else; read versions with `readVersions()`; take `benchCommit` from `deps.headCommit()` and the adapter version from `sdkVersion` of `<rootDir>/package.json`; name the series `probe-<stamp>` or `series-<stamp>` with `freshSeriesName`; clear the series directory and sandbox; `prepareFixture(fixture, <RUNS_DIR>/cache, { install: npmCi })`; render, then `runSeries` with `evaluate` bound to `ROOT_DIR`; a probe prints `probeSummary(rows, options.runs, options.budget, spent(readLedger(ledgerFile)))`. Runs are `options.runs` (a probe runs 1). `check()` renders the config for 1 and 5 runs into a temp directory with placeholder bases and calls `validateConfig` on each, then removes the directory.

`options.runs` must be passed unchanged into the projection and a probe runs 1.

**Files:**

- Create: `harness/suites/smoke/suite.ts`
- Create: `harness/suites/smoke/suite.test.ts`

**Test cases:**

- `sdkVersion('{"dependencies":{"@anthropic-ai/claude-agent-sdk":"0.3.284"}}')` is `0.3.284`; a package without that dependency throws
- the described series has exactly one workflow `plain` with `config.sdk.plugins` `[]`, `expectedPlugins` 0 and `provenance.adapter` `{ name: "plain", version: <the spec's> }`
- rendering it for 2 runs gives 2 tests, each with the `bench_task` var equal to `SMOKE_PROMPT` and `bench_item` `hello`
- `only: { workflows: ["nope"] }` makes `renderSeries` throw `unknown workflow nope; known workflows: plain`
- the rendered config's `defaultTest` holds the harness assertion and its providers each name the prompt
- with `deps.dirs` all inside a temp directory, `run({ probe: true, ... })` does not call `assertCommitted`, calls `prepareFixture` once with `<runsDir>/cache`, and calls `evaluate` with the config path under `<runsDir>/series/smoke/<series>/`; no file is written outside the temp directory
- `run({ probe: false, ... })` with an `assertCommitted` that throws `commit the working tree` returns 1, prints that message, and calls neither `prepareFixture` nor `evaluate`

## 06-3 Entry point

Create `harness/main.ts` from `evals/harness/main.ts` at `825455dd` with the copy rules: remove the five BDK suites; `const suites = { smoke: smokeRunner({ print, printError }) }`; `view` calls `view(ROOT_DIR)`; `compare` calls `runCompare(join(ROOT_DIR, "results"), ...)`; `regrade` calls `regradeSeries` with `hooks: loadSuiteHooks`, `judge`, `resultsFile(suite, series)`, `rawDir` `<RUNS_DIR>/series/<suite>/<series>/raw` and `ledgerFile: LEDGER_FILE`; `authStatus` runs `claude auth status --json`. Adding a suite is one new directory plus one entry in `suites`.

**Files:**

- Create: `harness/main.ts`

**Test cases:**

- no unit test: the module only wires real dependencies into `run`, and each dependency has its own tests
- `pnpm bench` with no arguments exits 2 and prints a usage text that lists `smoke`
- `pnpm bench nope` exits 2 and the message contains `unknown suite nope; known suites: smoke`
- `pnpm bench report smoke` exits 2 and names `--baseline` and `--candidate`
- `pnpm bench check` with no credentials and no network exits 0 and prints `checked smoke`
