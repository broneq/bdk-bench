---
schema: 1
ticket: A-kuit02bz
role: reviewer
at: 2026-10-07T02:50:33.793Z
group: p05
status: done
files: []
entries: [L-iqp3h0qz]
evidence: []
---

# Review p05: harness/compare.ts

The file matches plan part 05-3. The diff against the base only removes BDK-specific comment text. I checked each point:
- Table columns are as specified.
- The header names models, the first 7 characters of each bench commit, and the counted and discarded row counts.
- Rows are read through resultsFile as <resultsDir>/<suite>/<series>.jsonl.
- Discarded rows are excluded from values.
- Cost is added as a metric.
- A side that lacks a workflow or item prints n/a, with the stats.ts verdict "fewer than 2 counted runs".
- A series without rows exits 2 and lists the suite's series.

compare.test.ts covers all five listed cases. I did not run the tests. I found no findings and logged one observation, L-iqp3h0qz: an all-discarded series is not treated as missing. That is within the contract and not covered by a test.
