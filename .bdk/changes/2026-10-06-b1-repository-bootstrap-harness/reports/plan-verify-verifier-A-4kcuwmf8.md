---
schema: 1
ticket: A-4kcuwmf8
role: verifier
at: 2026-10-06T21:21:11.741Z
status: done-with-concerns
files: []
entries: [L-hv0pk3fy, L-x2skbjgv, L-8e3y4wm7]
evidence: []
---

# plan-verify A-4kcuwmf8 (attempt 1 of 2, scope full)

Verdict: the plan holds against the current code, design.md, architecture.md and spec-delta/bench-runner.md. No blocker. 1 new finding, 2 observations.

## What changed since the last verify (A-2snzg4fp, L-u8c3zern)

- Plan: only the `do-not-touch` frontmatter of parts 01-06 changed (`git diff HEAD`, decision L-rsuxpabu). harness/* entries were removed from 02-06, and README.md and CLAUDE.md from 01. Bodies, Files, test cases, depends-on and success measures are unchanged.
- Code: unchanged since a5320b6. `git diff HEAD` on harness/, README.md, CLAUDE.md, package.json, pnpm-lock.yaml, checklist/, tasks/, versions.json and .github/ is empty.

## Evidence run (read-only)

- `pnpm typecheck`, `pnpm lint` and `pnpm format:check` all exit 0.
- `pnpm test`: 20 files, 164 tests pass.
- `pnpm bench check` prints `checked smoke` (success measures of 06 and 07).

## The do-not-touch narrowing (L-x2skbjgv)

- Remaining guards: 01 has `checklist/**`, `tasks/**`, `.bdk/**`. 02-06 have `package.json`, `pnpm-lock.yaml`. 07 has `package.json`, `pnpm-lock.yaml`, `.bdk/**`.
- None of them matches a file of the 16 entries decided `fix`:
  - harness/budget.ts, runner.ts, series.ts, paths.ts, tree.ts and tree.test.ts, tools.ts
  - the hook and provider tests, regrade.ts
  - suites/smoke/suite.ts and suite.test.ts
  - README.md and CLAUDE.md
- Removing README.md and CLAUDE.md from 01 goes past the literal answer. The user's own `fix` decisions on L-iwpe184c and L-y2am8p8s require it, so this is no unresolved decision.
- Every part is done, so no remaining task loses a guard it needs. No part's own Files collide with its remaining guards.
- One constraint for the fix round: `tasks/**` stays guarded, so L-iwpe184c must change README.md, not the task.yaml `check_counts`.

## Per part (re-checked against the unchanged code)

- 01: the pins, configs and fixture pin hold, as recorded by A-2snzg4fp.
- 02: the exports match. Today `projection` returns `perCell` (budget.ts:60-72), as 02-1 states. The decided fix L-rlh41ea0 will rename it while 02-1 keeps saying `perCell` (L-hv0pk3fy).
- 03: tree.ts:25 still runs `git status --porcelain` without `-uall`, so the 03-3 case for `src/new.ts` is false until the decided fix of L-bdw67ijx.
- 04: matches 04-1 to 04-5. The series.ts header (lines 1-3) already says one test per run and item, so L-2pol2svk is already settled in the code.
- 05: matches. The placeholder at 05-commands.md:49 remains (L-xuvhu1fk, deferred).
- 06: matches 06-2. suite.ts:154 calls `readVersions()` with its default and :210 hard-codes 100. Both are covered by the decided fix L-d4qsan2j.
- 07: matches.

## Across the plan

- Design coverage: unchanged and complete, as A-2snzg4fp found. The design's "Tooling and CI" main-thread step produced .bdk/settings.yaml, but the file is untracked (L-8e3y4wm7). The "first commit records the source commit" gap is still known (L-6yzpp622).
- Between parts: the depends-on chain 01 to 02/03, then 04, 05, 06, 07 is complete. No two independent parts modify one file.
- Isolation: wave 2 (02 and 03) has disjoint Files and no shared generated state (BDK-PL-4).
- No implementation code is in the task blocks.

## Findings and observations

- L-hv0pk3fy (finding, BDK-ARCH-5): 02-leaf-modules.md:16 and :29 pin the key `perCell`, but the decided fix L-rlh41ea0 renames it to `perWorkflow` with no plan edit. Update 02-1 in the same round, or drop the fix.
- L-x2skbjgv (observation): the narrowing by L-rsuxpabu holds, as detailed above.
- L-8e3y4wm7 (observation, BDK-EJ-2): .bdk/settings.yaml is untracked and not ignored, so the result of the design's settings step reaches neither the PR nor a clean clone.
