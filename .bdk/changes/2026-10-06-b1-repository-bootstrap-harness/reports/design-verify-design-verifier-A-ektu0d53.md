---
schema: 1
ticket: A-ektu0d53
role: design-verifier
at: 2026-10-06T16:44:18.157Z
status: done-with-concerns
files: []
entries: [ L-t60uzyii, L-zml5u7cq, L-hy50mlmx, L-kzgh1mvy ]
evidence: []
---
# Design verification: B1 repository bootstrap (A-ektu0d53, attempt 2 of 2)

I checked `design.md` and `architecture.md` against `broneq/bdk` `evals/` at `825455dd` (branch `v3/T43-regression-eval`, worktree `~/projects/bdk/.claude/worktrees/T15-skill-check`, clean), issue #1, `CLAUDE.md`, `.bdk/settings.yaml`, `tasks/*/task.yaml`, `.gitignore` and the ledger (the attempt-1 report L-axtr16us, blocker L-fw9ettz8 and its resolved findings). Rules applied: BDK-ARCH-1, BDK-ARCH-2, BDK-ARCH-3, BDK-ARCH-5, BDK-EJ-2, BDK-SEC-4, BDK-SEC-6, BDK-SEC-9.

Verdict: no blocker. Three findings, one observation. Every attempt-1 issue is fixed in substance.

## What holds

- Attempt-1 blocker L-fw9ettz8 is fixed. architecture.md:68 now names all three places where the suite set is declared: `cli.ts:9-16` `SUITES`/`SuiteName`, the `main.ts:5-9,38-44` static imports and record, and `hook.ts:326-331` `loadSuiteHooks`. The diagram has `main --> suites` (:46). architecture.md:64 now says suite runners build their own dependencies, which matches `regression/suite.ts:180-237`. The planned single registry (`cli.ts` reads names from `CliDeps.suites`, and a new suite needs only a directory plus one entry in `main.ts`) is sound. It leaves two names for a suite: the record key and the directory. The design states this. The CLI-side duplication (BDK-ARCH-5) is gone.
- The fixture cache is now in `.runs/cache/` (architecture.md:76), as in `regression/suite.ts:197`. The sandbox is wiped at the start of each series (`:191`). The sandbox and promptfoo database locations match `paths.ts:24-49` and `tools.ts:37-42`, renamed to `bdk-bench`.
- architecture.md:12 now says the groups are a reading aid, not a strict layering. There is no static cycle. `hook -> suites` is the only edge back, and it is dynamic.
- The default run count is decided (design.md:74, decision L-0aefj6ru). The harness records turns and wall time (design.md:61). This replaces the identical `turns`/`wall_s` code in four suites' `hooks.ts` (for example `regression/hooks.ts:147-148`), as issue #1 asks.
- design.md:90-95 is a "Not decided" section. It lists hidden material (risk L-1wrdf16i, deferred to B3/B4), `ensureTools`, the per-suite report and the judge model (`judge.ts:7` `claude-sonnet-5`). It is honest about all four.
- Re-checked spot claims, all true:
  - Defaults: 100/15 USD and concurrency 4.
  - Credentials check: `cli.ts:227-229`.
  - promptfoo exit 100 is treated as a measured result: `runner.ts:158`.
  - Fixture: marker, stripped paths and git identity (`fixture.ts:23-26,83,113`), and the `versions.json` pin `946a2081`.
  - `assertCommitted` exempts only `evals/results` (`tree.ts:16`).
  - Isolation discard reasons: `isolation.ts`.
  - `expectedPlugins` exists.
  - The patch sums `num_turns`.
  - Provider facts: the SDK resolves from the config's ancestors (probe 1), and the probe ran SDK 0.3.284 with Claude Code 2.1.284.
  - `check` renders 1 and 5 runs and validates them without a model call (`regression/suite.ts:239-262`).
  - `.bdk/settings.yaml` uses `npx` commands and has no typecheck entry.
  - `tasks/*/task.yaml` names `.bench-base`.
  - `.nvmrc` is present.
- Non-functional requirements from issue #1: no dependency on the BDK repository, parallel runs, cost, turns and wall time, the viewer, CI with a model-free check, and pinned dependencies with a frozen lockfile and patch (BDK-SEC-9). All are addressed. For secrets (BDK-SEC-4): credentials come from the environment or `claude auth`, and raw session output and debug logs stay in the gitignored `.runs/`.
- The design agrees with every proposed decision (L-hdeesy03, L-6moot94v, L-ut64a9xo, L-dwhhzkaa, L-ny3yd2vf, L-0aefj6ru). The package names no accepted decision. Both promised mermaid diagrams exist.

## What does not hold

1. Finding L-t60uzyii (BDK-ARCH-3). design.md:68 keeps `SuiteRunner.report` (`cli.ts:232-239`). design.md:94 drops the `report <suite>` command that calls it, so `smoke` would have to implement a method that nothing calls. Either drop `report` from `SuiteRunner` in B1, or keep the command and define what smoke's report prints.
2. Finding L-zml5u7cq. The acceptance probe will refuse to start as designed:
   - Every suite's `run()` calls `assertCommitted()` before the probe branch (`regression/suite.ts:182`).
   - `git status --porcelain` lists untracked files.
   - In this repository `.bdk/` is untracked and not ignored, and the running Change keeps writing ledger files into it.

   design.md:84 says only that "a measured series refuses". It should decide how `bench smoke --probe` (design.md:70, :99) can pass: probes skip the check, `.bdk/` is exempted, or the Change state is committed before the probe.
3. Finding L-hy50mlmx (BDK-ARCH-1, BDK-ARCH-2). Accuracy slips remain in architecture.md:
   - `UsageError` is a value import, not type-only (`runner.ts:10,71`). The edge is drawn twice (:48, :50).
   - The `cli --> budget` edge is missing (`cli.ts:4`).
   - The suites' import list (:58) omits `cli`, `hook`, `judge` and `stats`. `cli` and `hook` own the boundary interfaces.
   - :68 says `regrade` uses the loader inside the promptfoo process. It runs in the CLI process (`main.ts:63`). The assertion is the user it should name instead (`assert.ts:70`).
4. Observation L-kzgh1mvy. T43 defaulted `regression` to 1 run and the other suites to 5, not 5 everywhere (design.md:74). `execute-ab` (design.md:59) is not a suite at `825455dd`.

## To pass

Decide how the acceptance probe gets past `assertCommitted` with the Change's `.bdk/` present. Settle `SuiteRunner.report` against the dropped command. Correct the architecture diagram edges and the loader sentence.
