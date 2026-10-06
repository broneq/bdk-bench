---
schema: 1
ticket: A-f1miv2g3
role: reviewer
at: 2026-10-06T21:39:03.709Z
group: p06
status: done
files: []
entries: []
evidence: []
---

# Review p06: harness/main.ts, harness/suites/smoke/suite.ts

Verdict: holds, no findings.

- The range diff only routes results paths through `RESULTS_DIR` and `resultsFile(resultsDir, suite, series)`. This removes the duplicated `join(ROOT_DIR, "results")` and the stale one-argument `resultsFile` call in `regrade`.
- main.ts matches plan 06-3: only a `smoke` suite, `view(ROOT_DIR)`, `runCompare(RESULTS_DIR, ...)`, `regradeSeries` with `loadSuiteHooks`, `judge`, `resultsFile`, `rawDir` and `LEDGER_FILE`, and `authStatus` runs `claude auth status --json`.
- suite.ts matches plan 06-2. `assertCommitted` is skipped for a probe, and a failure prints its message and returns 1 before any work. A probe runs 1 and passes `options.runs` unchanged into `probeSummary`. `check()` validates 1 and 5 runs and removes the temp directory.
- Evidence: `npx tsc --noEmit` is clean. `vitest run harness/suites` passes 16 tests. `pnpm bench check` prints `checked smoke`. `pnpm bench nope` exits 2.
- Gap, minor: main.ts has no unit test, as the plan allows.
