---
schema: 1
id: L-nf9iae8k
type: observation
summary: projection returns perWorkflow, plan 02-1 says perCell key stays
status: resolved
source: agent:reviewer
author: Przemysław Broniszewski <przemek@broniszewski.net>
at: 2026-10-06T21:28:29.928Z
ticket: A-eq1itdbh
group: p02
refs:
  - harness/budget.ts:60
level: not-a-problem
---

Problem: Plan 02-1 and its test case say projection returns `perCell.plain`. The code and test now return `perWorkflow` (changed in the last range commit). The plan wording is self-contradictory (cell renamed everywhere else), and the only consumer, harness/runner.ts:188, uses perWorkflow, so behaviour is consistent.

Why it matters: Part 05 or hidden checks written against the plan text could expect `perCell`; the plan and code now disagree.

Suggested fix: Keep perWorkflow and amend plan part 02-1 to say so, or confirm the decision in the ledger.

Triaged as not-a-problem at 2026-10-06T21:31:07.948Z: repeats L-hv0pk3fy
