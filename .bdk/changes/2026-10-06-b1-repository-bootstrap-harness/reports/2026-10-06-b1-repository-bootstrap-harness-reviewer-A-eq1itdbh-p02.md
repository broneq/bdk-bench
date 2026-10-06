---
schema: 1
ticket: A-eq1itdbh
role: reviewer
at: 2026-10-06T21:28:32.708Z
group: p02
status: done
files: []
entries: [L-nf9iae8k]
evidence: []
---

# Review p02 (harness/budget.ts, budget.test.ts)

Holds: LedgerEntry uses workflow; BudgetReached message, defaults 100 and 15, record, runCap, assertCanStart, costOf match plan 02-1. All plan test cases are covered (missing file, 100/100 throw message, runCap 5/15/0, no cell key, costOf three branches). Tests pass (8). No logic errors, no banned test types.

Concern (observation L-nf9iae8k): projection returns perWorkflow where the plan says perCell; runner.ts is consistent with the code.

Minor: readLedger trusts JSON.parse of its own file, acceptable (internal state, BDK-CQ-6).
