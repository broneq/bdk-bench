---
schema: 1
ticket: A-eq1itdbh
role: reviewer
at: 2026-10-06T21:29:15.671Z
group: p05
status: done
files: []
entries: [L-z0u3spcp]
evidence: []
---

# Review p05 (cli, runner, regrade)

Range a5320b6..57b47df. Small diff: DEFAULT_CONCURRENCY exported (used by suites/smoke/suite.ts and cli.ts), modelsOf renamed configuredModels, perCell fixed to perWorkflow (matches budget.ts), regrade restructured.

Holds: regrade resolves every saved request and its judge before any judge call (plan 05-4: exit 2 on missing judge.json naming workflow/item/run); judge.json and series files are written only after all judge calls succeed. New tests cover an undeclared saved judge (exit 2, no calls) and a mid-run judge failure (rows and judge.json unchanged). tsc clean; cli, runner, compare, regrade tests: 42 passed. No BDK rule violations found.

Concerns: one observation L-z0u3spcp, non-atomic final writes, minor.
