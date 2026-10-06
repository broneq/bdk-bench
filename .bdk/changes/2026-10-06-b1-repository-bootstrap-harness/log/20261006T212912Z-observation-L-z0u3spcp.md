---
schema: 1
id: L-z0u3spcp
type: observation
summary: regrade writes judge.json files then the series file non-atomically; ledger charged before any write
status: proposed
source: agent:reviewer
author: Przemysław Broniszewski <przemek@broniszewski.net>
at: 2026-10-06T21:29:12.011Z
ticket: A-eq1itdbh
group: p05
refs:
  - harness/regrade.ts:96
level: nice-to-have
---

Problem: regradeSeries judges all rows, charges the ledger per call, then writes every judge.json and finally the series file. A write error between those writes leaves some judge.json files at new answers while the series rows keep old metrics.

Why it matters: Judge-call failures are handled and tested; a disk error mid-write is a narrow window, and re-running regrade repairs it at extra cost.

Suggested fix: Optional. Write the series file first or use temp files and rename. Acceptable as is.

Triaged as nice-to-have at 2026-10-06T21:31:07.666Z
