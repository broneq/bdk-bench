---
schema: 1
ticket: A-60yez6v3
role: implementer
at: 2026-10-06T18:22:37.590Z
status: done
files: [ harness/compare.ts ]
entries: []
evidence: []
---
Renamed base/cand/a/b to baselineRows/candidateRows/baselineValues/candidateValues (BDK-CQ-1), fixed the garbled file header comment and the "resolves" wording in the runCompare doc. Behaviour unchanged; compare tests (6) pass, prettier clean. compare.test.ts left as is.
