---
schema: 1
id: L-gwgg8qti
type: finding
summary: regrade overwrites judge.json per row before results are written; a mid-loop failure leaves them inconsistent
status: resolved
source: agent:reviewer
author: Przemysław Broniszewski <przemek@broniszewski.net>
at: 2026-10-06T20:32:33.230Z
ticket: A-qy7ysb9p
group: p05
refs:
  - harness/regrade.ts:82
review: true
level: blocker
disposition: fix
---

Problem: regradeSeries writes each row's new judge.json (line 82) inside the loop, but the results file is only rewritten after the loop (line 89). If deps.judge throws on row N (network, auth, budget), rows 1..N-1 already carry new judge.json and ledger charges while the series file still holds the old metrics and old judgeHash.

Why it matters: the saved raw records and the result rows disagree, and the comment at line 57 claims a re-grade never stops halfway. A later rerun re-judges everything and pays again. Low severity: rerun repairs state.

Suggested fix: collect the new judge.json contents and write them together with writeRows after the loop (or write results incrementally). Add a test where the judge rejects on the second row.

Triaged as should-fix at 2026-10-06T20:35:38.879Z

Decided fix at 2026-10-06T21:14:59.735Z

Resolved as resolved at 2026-10-06T21:27:54.620Z: fixed in 57b47df
