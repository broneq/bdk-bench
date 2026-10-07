---
schema: 1
id: L-tjvkehmd
type: observation
summary: runner.ts still reads projection().perCell; the cell-to-workflow rename is missed in budget.ts
status: resolved
source: agent:reviewer
author: Przemysław Broniszewski <przemek@broniszewski.net>
at: 2026-10-06T20:32:33.449Z
ticket: A-qy7ysb9p
group: p05
refs:
  - harness/runner.ts:188
level: not-a-problem
---

Problem: runner.ts line 188 uses projected.perCell, a leftover "cell" name from budget.ts, which is outside this part's scope (do-not-touch). Part 05 renames cell to workflow everywhere else.

Why it matters: the vocabulary is inconsistent and the plan's copy rule says to rename cell to workflow.

Suggested fix: rename the field to perWorkflow in budget.ts and its test in a part that owns budget.ts, then update runner.ts.

Triaged as not-a-problem at 2026-10-06T20:35:40.536Z: repeats L-4i6yvxpj
