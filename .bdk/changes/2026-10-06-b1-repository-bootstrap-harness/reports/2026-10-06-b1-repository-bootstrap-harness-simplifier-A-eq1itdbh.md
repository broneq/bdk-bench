---
schema: 1
ticket: A-eq1itdbh
role: simplifier
at: 2026-10-06T21:24:21.711Z
status: done
files: [harness/regrade.ts]
entries: []
evidence: []
---

# Simplifier report

One simplification in `harness/regrade.ts`: the re-grade results were held in a Map of three-field objects keyed by row. They are now a Map of row to re-graded row plus a list of `[file, saved judgement]` pairs. Behaviour is unchanged. Typecheck, lint, format check and the regrade tests pass. The rest of the diff (cacheHome, sandbox check, projection rename, tests) is already simple and was left alone.
