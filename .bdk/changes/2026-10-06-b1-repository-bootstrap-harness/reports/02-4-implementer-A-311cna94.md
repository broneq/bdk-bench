---
schema: 1
ticket: A-311cna94
role: implementer
at: 2026-10-06T17:55:05.296Z
status: done
files: [ harness/isolation.ts, harness/isolation.test.ts, harness/judge.ts, harness/stats.ts, harness/stats.test.ts ]
entries: []
evidence: []
---
Copied the five files from bdk 825455dd with the copy rules (design refs removed, cell renamed workflow). Added the listed median/range/compare cases to stats.test.ts. vitest (16 tests), eslint and prettier are clean for these files; tsc reported nothing for them. Prettier reflowed the comment in stats.ts and the other two source files.
