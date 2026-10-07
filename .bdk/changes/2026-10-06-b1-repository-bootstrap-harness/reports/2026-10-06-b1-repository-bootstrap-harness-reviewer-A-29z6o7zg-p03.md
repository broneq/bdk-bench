---
schema: 1
ticket: A-29z6o7zg
role: reviewer
at: 2026-10-07T02:56:30.951Z
group: p03
status: done-with-concerns
files: []
entries: [L-78ol9kir]
evidence: []
---

# Review p03: paths.ts, paths.test.ts, tools.test.ts

Range diff is small: cacheHome fallback became lazy (`() => string`), tests adjusted, one environment-dependent tools test removed.

Holds:
- The lazy fallback is correct; tests cover precedence, empty and relative values, fallback not read when HOME or XDG is absolute, and an absolute result for the process env.
- sandboxOf: per-checkout name with hash, refusal message, and the `..cache` edge case are tested.
- The removed tools test is covered by the cacheHome tests, so no real gap. promptfooEnv with an unset HOME is not tested end to end, which is minor.
- tools.test.ts covers the three plan cases.

Does not hold:
- L-78ol9kir (BDK-ARCH-5): resultsFile signature is (resultsDir, suite, series), but plan 03-2 says (suite, series, root) and its test case differs. Callers in compare.ts, main.ts and smoke/suite.ts use the implemented form. The extra exports (RESULTS_DIR, cacheHome, seriesDir, seriesNames) are not in the plan list. Align the code or amend the plan.
