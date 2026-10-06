---
schema: 1
ticket: A-iirvwmls
role: design-verifier
at: 2026-10-06T17:35:39.213Z
status: done-with-concerns
files: []
entries: [ L-8kt2hcmt, L-43afpes9, L-ctvk1zxu, L-k39lpm3w, L-tzlxa4r9, L-eu7351d4 ]
evidence: []
---
# Design verification: B1 repository bootstrap (A-iirvwmls, attempt 1 of 2)

## Scope

I checked the revised `design.md` and `architecture.md` against the sources below.

- **Source code.** `broneq/bdk` `evals/` at `825455dd`, read with `git show`: every harness module's imports and the relevant bodies of `cli`, `main`, `hook`, `budget`, `fixture`, `paths`, `tools`, `tree`, `stats`, `isolation`, `providers`, `provider`, plus the suites' imports, the patch, `evals/README.md` Provider facts and `.github/workflows/tests.yml`.
- **Other branch.** `staging/v3`.
- **This repository and its issue.** Issue #1, `CLAUDE.md`, `.bdk/settings.yaml`, `tasks/*/task.yaml` and `tasks/operator-i18n/checks.yaml`.
- **Ledger.** Decisions L-hdeesy03, L-6moot94v, L-ut64a9xo, L-dwhhzkaa, L-ny3yd2vf, L-0aefj6ru and L-27j0iopb, blocker L-yy53yb9x, findings L-4az9p8xm and L-qi3i6vt2, and the earlier verifier reports.
- **Rules applied.** BDK-ARCH-1, BDK-ARCH-2, BDK-ARCH-5, BDK-EJ-1, BDK-EJ-2, BDK-SEC-4, BDK-SEC-6 and BDK-SEC-9.

## Verdict

No blocker. Four findings, one observation. The revision addresses everything L-27j0iopb and the plan-verify blocker L-yy53yb9x asked of the design. What remains is accuracy, not architecture.

## What holds

### Claims about the source code

- **Source location.** The harness is at `825455dd` (`v3/T43-regression-eval`) and is not merged into `staging/v3`. That branch has `cost.ts` instead of `budget.ts` and no `provider`, `assert`, `transcript`, `compare` or `regrade`, which is why it was rejected as a source.
- **Patch.** `patches/promptfoo@0.123.1.patch` sums `num_turns` over all results.
- **SDK resolution and versions.** The SDK resolves from the config's directory (Provider facts, probe 1). The facts were probed with SDK 0.3.284 and Claude Code 2.1.284 (`README.md:107`).
- **Imports in `architecture.md`.**
  - Every edge drawn between harness modules matches the real imports: `main` imports `cli`, `compare`, `regrade`, `hook`, `judge`, `tools` and `paths`, and statically imports the suites.
  - The three slips L-27j0iopb named are fixed. `UsageError` is now a value edge (:48). `cli --> budget` is now drawn (:49). `regrade` is placed in the CLI process, and the promptfoo process is reserved for the provider and the assertion (:69, matching `main.ts` `hooks: loadSuiteHooks` and the `provider.ts`/`assert.ts` imports).
  - The leaves import nothing from the harness. There is no static cycle (BDK-ARCH-1).
- **Main entry and suites.** `main.ts` builds `authStatus`, `view`, `compare`, `regrade` and the judge. Suite runners build their own run-time dependencies.
- **Run lifecycle.** The `startRun` order (budget, `freshCopy`, config home, debug log, `beforeRun`) matches the source. So do the `afterEach` charge and the row append, the isolation discard reasons (`isolation.ts:15-27`), promptfoo exit 100 counting as measured (`runner.ts:158`), and the credentials check.
- **Fixture.**
  - The stripped paths, marker handling, `FixtureMismatch` and the base commit match `fixture.ts:23,63-104`.
  - The pin is `946a2081` (`evals/versions.json`), the same value as `tasks/*/task.yaml`.
  - The `.bench-base` marker agrees with `task.yaml`.
- **Sandbox and paths.**
  - `sandboxOf` refuses a sandbox inside the repository (`paths.ts:34-49`).
  - The promptfoo database lives under the cache directory (`tools.ts:41`).
  - The judge model is `claude-sonnet-5` (`judge.ts:7`).
  - With `stats.ts` `formatVerdict`, one run per series prints "fewer than 2 counted runs" instead of throwing, so `compare` keeping the verdict column works with the new default of one run.

### Agreement with the decisions

- L-27j0iopb is reflected:
  - Probes skip `assertCommitted`.
  - Measured series exempt `results/` and `.bdk/`.
  - `SuiteRunner` is listed as `run` and `check` only, but see L-43afpes9.
- L-yy53yb9x is resolved in the design: `.bdk/settings.yaml` is updated by the main thread after execute (:78, L-4az9p8xm).
- All other decisions (L-hdeesy03, L-6moot94v, L-ut64a9xo, L-dwhhzkaa, L-ny3yd2vf, L-0aefj6ru) agree with the text. The package names no accepted decision.

### Requirements from issue #1

- Every requirement is addressed: no dependency on the BDK repository, parallel runs, cost, turns and wall time recorded by the harness, the viewer, and a model-free `bench check` in CI.
- The source CI ran the same model-free check (`tests.yml:210`). The acceptance probe needs approval of its cost.
- **Secrets (BDK-SEC-4).** Credentials come from the environment or `claude auth`. Raw output stays in the gitignored `.runs/`.
- **Least privilege (BDK-SEC-6).** Sessions get `GIT_CONFIG_GLOBAL=/dev/null` and their own `XDG_CONFIG_HOME`, so they do not inherit global git or CLI credentials.
- **Dependency pinning (BDK-SEC-9).** Dependencies are pinned through the lockfile and patch.

### Diagrams and the "Not decided" section

- Both promised mermaid diagrams exist and match the prose, except for the suite edge in L-ctvk1zxu.
- The "Not decided" section honestly lists four points: hidden material (risk L-1wrdf16i, deferred to B3 and B4), `ensureTools`, the per-suite report, and the judge model. I found no open point hidden in the wording.

## What does not hold

1. **L-8kt2hcmt (finding, BDK-EJ-2).** design.md:83 claims a series overshoots by at most `--concurrency - 1` run caps. The real bound is `--concurrency` run caps plus judge `extraCost`:
   - `assertCanStart` sees only recorded spend.
   - Runs are recorded only when they end (`hook.ts:315`).
   - The session cap is a static `maxBudgetUsd = runCapUsd` (`regression/suite.ts:115`).

   The claim is copied from the source `README.md:23`. Fix the bound, or better, reserve the run cap at start so the budget really caps spend.
2. **L-43afpes9 (finding).** design.md:68 says the suite contracts "stay as in T43". B1 drops `SuiteRunner.report` (L-27j0iopb) and `Measurement.templateHashes` (design.md:62, plan 04). Name both changes.
3. **L-ctvk1zxu (finding, BDK-ARCH-2).**
   - architecture.md:59 leaves `cli` and `hook` out of the suites' imports, although the suite boundary at :69 is defined by those two interfaces.
   - `runner -> cli` is drawn twice (:48, :51).
   - :64 counts two promptfoo entry points; there are three, since `extensionHook` is one.

   This was first raised in L-hy50mlmx.
4. **L-k39lpm3w (finding).** design.md:74 (and L-0aefj6ru) say T43 defaulted to 5 runs. In `cli.ts`, regression defaulted to 1 and every suite rejected `--runs` below 2. This does not change what B1 builds.
5. **L-tzlxa4r9 (finding, BDK-ARCH-5).** design.md:70 defines smoke `completed` as "HELLO.md exists", while plan 06:16 and the prompt require the content `hello`.
6. **L-eu7351d4 (observation).**
   - Probe rows skip the committed-tree check, yet they record HEAD as `benchCommit` and get committed (L-qi3i6vt2).
   - The CI design leaves out the source's `pnpm audit` and `knip` without saying so (BDK-SEC-9).

   Neither is a fail.

## To pass cleanly

- Correct the overshoot bound, or add a ledger reservation for runs in progress.
- Name the two suite-contract changes in design.md:68.
- Add the `suites --> cli` and `suites --> hook` edges.
- Fix the T43 default sentence and the `completed` definition.
