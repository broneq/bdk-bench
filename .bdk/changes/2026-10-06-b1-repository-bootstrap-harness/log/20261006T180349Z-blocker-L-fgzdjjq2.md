---
schema: 1
id: L-fgzdjjq2
type: blocker
summary: SeriesPlan lacks ledgerFile and budgetUsd that startRun/afterRun need
status: proposed
source: agent:implementer
author: Przemysław Broniszewski <przemek@broniszewski.net>
at: 2026-10-06T18:03:49.417Z
ticket: A-l07sx0fj
refs:
  - harness/series.ts
  - 04-1
---
04-1 stop rule. harness/series.ts SeriesPlan has suite, series, runCapUsd, resultsFile, rawDir, sandboxDir, debugDir, workflows. The copied startRun calls assertCanStart(readLedger(plan.ledgerFile), plan.budgetUsd) and afterRun records to plan.ledgerFile; neither field exists, and series.ts is do-not-touch. Fix: add `ledgerFile` and `budgetUsd` to SeriesPlan in part 03 (and series.test.ts), or state where hook.ts gets them. hook.ts and hook.test.ts not written.
