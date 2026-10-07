---
schema: 1
id: L-iqp3h0qz
type: observation
summary: runCompare accepts a series whose rows are all discarded and prints an empty table
status: accepted
source: agent:reviewer
author: Przemysław Broniszewski <przemek@broniszewski.net>
at: 2026-10-07T02:50:27.241Z
ticket: A-kuit02bz
group: p05
refs:
  - harness/compare.ts:90
review: true
level: nice-to-have
disposition: defer
---

Problem: runCompare only treats a series as missing when it has zero rows. A series with rows that are all discarded passes the check; compareSeries then prints headers showing "0 counted" and a table with no data rows (or only the other side's rows with n/a), and exits 0.

Why it matters: the contract only requires exit 2 for a series without rows, so this is within spec. A reader still gets a silent, near-empty comparison. No test covers this case.

Suggested fix: optional. Either add a test that pins the current behaviour, or treat "no counted rows" like "no rows" and exit 2 with the same message.

Triaged as nice-to-have at 2026-10-07T02:53:17.246Z

Decided defer at 2026-10-07T02:53:49.863Z
