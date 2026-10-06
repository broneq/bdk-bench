---
schema: 1
ticket: A-z0lg1o5x
role: implementer
at: 2026-10-06T18:11:54.229Z
status: done-with-concerns
files: [ harness/hook.ts, harness/hook.test.ts, harness/series.ts, harness/series.test.ts ]
entries: []
evidence: []
---
# 04-1 Run lifecycle and the row (attempt 2)

series.ts now carries `ledgerFile` and `budgetUsd` (L-fgzdjjq2 resolved by the task's changes), `expandTests(items, runs)` and `TestCase` are back to the 825455dd form, and the header comment of series.ts was rewritten to match (L-2pol2svk).

hook.ts: copied with workflow naming, `benchWorkflow`, no `templateHashes`/`variantHash`, provenance `{ models, fixtureCommit, benchCommit, adapter }`, harness metrics `turns` and `wall_s` merged last (only when reported; a discarded row holds only these), `loadSuiteHooks` imports `./suites/<suite>/hooks.ts`.

TDD log
Test list: series (3 expandTests tests), hook (turns/wall_s counted, discarded, missing numTurns, provenance/no cell, turns override, budget stop, provider error/run cap, extensionHook) - all done
1. RED  series.test.ts - expandTests old signature: 3 failed (undefined vs expected assertions)
   GREEN series.ts restored expandTests, added fields - 11 passed
2. RED  hook.test.ts - module ./hook.ts missing
   GREEN hook.ts copied and adapted - 20 of 21 passed
   RED  measureRun test: received extra "templateHashes": [] - fixed by removing it from measureRun - 32 passed
Concern: hook.test.ts was written whole before hook.ts, so the harness-metric tests were not seen red individually.
Command: npx vitest run harness/hook.test.ts harness/series.test.ts; npx tsc --noEmit; npx eslint --max-warnings 0 harness; prettier clean.
