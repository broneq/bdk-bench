---
schema: 1
ticket: A-qy7ysb9p
role: reviewer
at: 2026-10-06T20:32:40.491Z
group: p05
status: done-with-concerns
files: []
entries: [L-gwgg8qti, L-4q280780, L-tjvkehmd, L-cqwh6vbp]
evidence: []
---

# Review p05 (cli, runner, compare, regrade)

Ran the four test files: 40 tests pass. cli.ts, runner.ts and compare.ts match plan part 05 (flags, defaults, integer runs, credentials gating, description format, exit codes 0/100, budget message, compare table and exit 2). All test cases listed in the plan are covered. No BDK/T40/cell vocabulary remains in the four modules except the perCell read from budget.ts.

Concerns (regrade.ts, both low):
- L-gwgg8qti: judge.json files are overwritten per row before results are written; a judge failure mid-loop leaves raw records and result rows inconsistent.
- L-4q280780: the pre-check covers file existence only; a saved judge name no longer declared fails after earlier rows were judged and charged, against the 05-4 contract. No test.

Observations: L-tjvkehmd (perCell leftover in budget.ts), L-cqwh6vbp (loose arg parsing for check/view).
