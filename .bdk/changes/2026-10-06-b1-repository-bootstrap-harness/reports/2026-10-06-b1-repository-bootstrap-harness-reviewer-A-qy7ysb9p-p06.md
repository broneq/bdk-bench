---
schema: 1
ticket: A-qy7ysb9p
role: reviewer
at: 2026-10-06T20:32:47.150Z
group: p06
status: done-with-concerns
files: []
entries: [L-0158y2bb, L-kslh5kwj, L-uw5fceuh]
evidence: []
---

# Review p06

Verified: vitest harness/suites passes (14 tests); pnpm bench check exits 0 printing "checked smoke"; unknown suite and report without flags exit 2. hooks.ts, main.ts and describeSmoke match the plan part; a probe runs 1 and the assertCommitted gate returns 1 before other work.

Concerns (no blockers):
- L-0158y2bb: results path expressed twice (BDK-ARCH-5), suite.ts:158 vs :175.
- L-kslh5kwj: probe test OR-assertion does not pin the projection over options.runs (BDK-TQ-1, BDK-TQ-6).
- L-uw5fceuh (observation): readVersions ignores dirs.rootDir.
