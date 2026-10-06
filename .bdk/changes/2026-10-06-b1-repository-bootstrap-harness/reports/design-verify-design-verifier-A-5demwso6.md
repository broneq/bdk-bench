---
schema: 1
ticket: A-5demwso6
role: design-verifier
at: 2026-10-06T16:40:10.253Z
status: done-with-concerns
files: []
entries: [ L-fw9ettz8, L-go7gyg6r, L-aqa4tsa3, L-xpzf81m8, L-7s4hsexv, L-1wrdf16i, L-b39sobwj, L-jr3588zz ]
evidence: []
---
# Design verification: B1 repository bootstrap (A-5demwso6, attempt 1 of 2)

Verified `design.md` and `architecture.md` against the source they are grounded in, `broneq/bdk` `evals/` at `825455dd` (branch `v3/T43-regression-eval`, worktree `~/projects/bdk/.claude/worktrees/T15-skill-check`, clean), against `staging/v3`, issues #1, #3 and #7, `CLAUDE.md`, `tasks/*/task.yaml` and the proposed decisions in the ledger. Rules applied: BDK-ARCH-1, BDK-ARCH-5, BDK-EJ-2, BDK-SEC-6.

Verdict: one blocker (`false-code-claim`), five findings, one risk, one observation. The overall approach (copy and slim T43, root package, one `smoke` suite) is sound and matches every proposed decision.

## What holds

- Source: `825455dd` exists on `v3/T43-regression-eval`; `staging/v3` has the T40 harness (`cost.ts`, no `budget.ts`, `compare.ts`, `regrade.ts`, no `--concurrency`/`view`), as design.md:14 says.
- Every module in the keep list exists; `plugins.ts`, the five BDK suites, `BDK_SETTINGS` and `buildBdkBase` (`suites/regression/suite.ts:63,153`), `v2Tag` (`versions.json`) exist and are BDK-only.
- Renamed identifiers exist as named: `BDK_EVAL_SERIES` (`series.ts:9`), `bdk_item`/`bdk_run` (`series.ts:97`), `bdkCell` (`provider.ts:85-103`, `hook.ts:50`), row `cell` and `provenance.bdkCommit` (`results.ts:19,30`), `sandboxOf` refuses an in-repo sandbox (`paths.ts:34-50`), `assertCommitted` allows only `evals/results` (`tree.ts:15-20`).
- Fixture: marker `.bdk-eval-base`, stripped `.claude`, `.agents`, `CLAUDE.md`, `AGENTS.md`, `FixtureMismatch`, git identity `BDK Eval` (`fixture.ts`); `tasks/*/task.yaml` names `.bench-base`.
- Defaults 100 USD / 15 USD / concurrency 4 (`budget.ts:7-9`, `cli.ts:7`); credentials check exits 1 for run and regrade (`cli.ts` dispatch); promptfoo exit 100 is measured (`runner.ts:158`, `tools.ts`); `regrade` checks every `judge.json` before the first call and returns 2 without `judges` (`regrade.ts:47-64`); budget stop and overshoot semantics (`budget.ts`, `provider.ts:83-86`); isolation discard from the debug log (`hook.ts` measureRun).
- `SuiteRunner` (`run`, `check`, `report`) and `SuiteHooks` (`beforeRun`, `measure`, `passOf`, `judges`) are as stated; `check` renders 1 and 5 runs and validates with the pinned promptfoo (`regression/suite.ts:239-262`).
- Patch: sums `num_turns` and returns the last result (every `claude-agent-sdk-*` dist file). Provider facts: probed with Claude Code 2.1.284 and SDK 0.3.284; probe 1 shows the SDK must resolve from the config's ancestors, which the root package plus `.runs/` satisfies.
- Architecture edges for runner, provider, assert, hook, regrade, compare, paths, tree match the real imports; there is no static cycle (hook -> suites is dynamic).
- The design agrees with all five proposed decisions (L-hdeesy03, L-6moot94v, L-ut64a9xo, L-dwhhzkaa, L-ny3yd2vf); the package names no accepted decision.
- Issue #1 NFRs: no runtime dependency on the BDK repository, parallel runs, cost, viewer, CI with a model-free check are addressed. Both promised mermaid diagrams exist.

## What does not hold

1. Blocker L-fw9ettz8 (`false-code-claim`, BDK-ARCH-5): architecture.md:64 "the only edge from harness to suite is `loadSuiteHooks`" and :66 "B3/B7 need no change to a harness module" are false for the code being copied: `main.ts:5-9,38-44` statically imports every suite and `cli.ts:9-15` hard-codes `SUITES`/`SuiteName`, so a new suite edits both. The suite set is named in three places. architecture.md:60 "main.ts is the only place real dependencies are built" is also false: suite runners call `ensureTools`, `assertCommitted`, `prepareFixture`/`npmCi` and `evaluate` themselves (`regression/suite.ts:186-237`). The diagram omits `main --> suites`.
2. Finding L-go7gyg6r: architecture.md:70 puts the fixture cache in the per-series sandbox; T43 caches it in `.runs/cache` and wipes the sandbox at every series, so the stated location would re-run `npm ci` per series, against design.md:61.
3. Finding L-aqa4tsa3 (BDK-ARCH-1): architecture.md:12 "imports only from a lower layer" is contradicted by `transcript.ts:6 -> hook.ts`, `runner.ts:10 -> cli.ts` (`UsageError`) and `providers.ts:8 -> provider.ts`.
4. Finding L-xpzf81m8: the default run count is undecided; T43 defaults to 5 and refuses `--runs 1`, while CLAUDE.md "Cost" wants one run by default.
5. Finding L-7s4hsexv (BDK-ARCH-5): turns and wall time get into a row only through each suite's `measure` (copied in four T43 suites), and are lost for discarded runs; issue #1 asks the harness to record them.
6. Risk L-1wrdf16i (BDK-SEC-6): sessions run with `bypassPermissions` and every tool; the sandbox only prevents walking up, so a session can read `tasks/*/spec.md` and later hidden tests by absolute path (CLAUDE.md Neutrality). Not needed for the smoke run, but neither addressed nor explicitly deferred.
7. Finding L-b39sobwj: there is no "not decided" section; the open points above plus `ensureTools`, the BDK-specific `variantHash`/`templateHashes` row fields and the plain `report <suite>` command are left implicit.
8. Observation L-jr3588zz: small citation and diagram slips (judge/main have no tests; `evals/` prefix of source paths; `fixture.ts --> provider.ts` edge; incomplete suite import list; Provider facts row name).

## To pass

Correct the suite-boundary claims and either design one suite registry or state that a new suite edits `cli.ts`/`main.ts`; fix the fixture cache location; restate or fix the layer rule; decide the default run count and who records turns and wall time; add a "Not decided" section that also names the owner of hidden-spec isolation.
