---
schema: 1
ticket: A-f1miv2g3
role: integration-reviewer
at: 2026-10-06T21:40:22.522Z
group: integration
status: done-with-concerns
files: []
entries: [L-bndhs6ue, L-7qqjll91, L-t7vti9lp, L-26bzbbcw]
evidence: []
---

# Integration review A-f1miv2g3

Range 57b47df..1c946e8 is a review-fix of three entries: L-v6x9tm6a (README discard reasons), L-2jjmnq7b (results-file path derived in three places, BDK-ARCH-5) and L-bqedx5xr (empty or relative XDG_CACHE_HOME/HOME). Code changes: README.md, harness/paths.ts, harness/paths.test.ts, harness/compare.ts, harness/main.ts, harness/suites/smoke/suite.ts; the rest is `.bdk/` state. Every changed code file belongs to a plan part (03, 05, 06, 07); no unplanned files.

## What holds

- L-v6x9tm6a: README "Isolation" now lists "no cost reported (run cap charged)" and "harness error", matching hook.ts:229, :301, :303 and provider.ts:87. Consistent with spec-delta bench-runner.md (scenario at line 33).
- L-2jjmnq7b: `resultsFile(resultsDir, suite, series)` and `RESULTS_DIR` in paths.ts are now the one derivation; the runner's collision check and plan (suite.ts:158, :178), regrade (main.ts:52) and compare (compare.ts:90) all use it. Grep finds no caller left on the old argument order, which matters because the three string parameters were reordered and the type checker could not catch a stale caller. Runner evidence: tests 176 passed (E-6wz4jyl8), eslint (E-bwcxigac), prettier (E-m0ezc9b7), typecheck (E-hei2m6c4).
- L-bqedx5xr, XDG half: an empty or relative XDG_CACHE_HOME is now ignored, and both `SANDBOX_DIR` and `promptfooEnv` go through `cacheHome`.

## What does not hold

- L-bndhs6ue (finding, medium, configuration, BDK-TQ-1): the HOME half of the L-bqedx5xr fix does nothing in production. The fallback `os.homedir()` returns `$HOME` itself on POSIX. Probed on Node v24.21.0: `HOME=` gives `SANDBOX_DIR` `.cache/bdk-bench` and `HOME=rel` gives `rel/.cache/bdk-bench`. The new tests pass only because the test process has a real HOME, so they cannot fail for this case. Fix: fall back to `os.userInfo().homedir` (probed absolute with HOME empty) and assert absoluteness in the tests.
- L-7qqjll91 (finding, low, BDK-ARCH-5): the raw directory has the same runner-to-regrade seam as the results file, and it is still derived twice (suite.ts:163/:77 vs main.ts:53). compare.ts:96-98 re-encodes the `.jsonl` suffix. It fails loudly (regrade exit 2), so it does not corrupt scores.

## Observations

- L-t7vti9lp (public-api): plan part 03 still documents the old `resultsFile(suite, series, root)` signature. Only the module export changed; the on-disk layout `results/<suite>/<series>.jsonl` in design.md and spec-delta is unchanged.
- L-26bzbbcw: the implementer report for this ticket carries a stale simplifier body and `files: []`, and names none of the fixed entry ids. The orchestrator should resolve against commit 1c946e8 directly and keep L-bqedx5xr open until L-bndhs6ue is settled.

## Areas

- configuration: Cache-location resolution from XDG_CACHE_HOME and HOME now ignores empty or relative XDG values. Empty or relative HOME still yields a relative sandbox and promptfoo dir, because os.homedir() echoes $HOME (L-bndhs6ue).
- public-api: The exported resultsFile now takes the results directory first, and RESULTS_DIR is new. All internal callers were updated. The committed row file layout and CLI are unchanged (L-t7vti9lp).
