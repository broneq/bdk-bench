---
schema: 1
id: L-xu5gvlcj
type: finding
summary: 04-3 says oneTurnProvider has no consumer; runner.test.ts copied in 05-2 imports and uses it
status: resolved
source: agent:verifier
author: Przemysław Broniszewski <przemek@broniszewski.net>
at: 2026-10-06T17:27:53.369Z
ticket: A-pvbw6479
refs:
  - .bdk/changes/2026-10-06-b1-repository-bootstrap-harness/plan/parts/04-run-lifecycle.md
  - .bdk/changes/2026-10-06-b1-repository-bootstrap-harness/plan/parts/05-commands.md
level: not-a-problem
---

04-run-lifecycle.md:64 "Remove `oneTurnProvider` and `OneTurnCell` (no consumer)". False for the copied tests: source `evals/harness/runner.test.ts:8` imports it and line 25 builds every test workflow with `oneTurnProvider({ label, model, systemPrompt: "Answer.", maxBudgetUsd: 1 })`. 05-commands.md:37 copies runner.test.ts without saying what replaces it. Name the replacement in 05-2 (e.g. `sessionProvider({ label, model, plugin: null, maxBudgetUsd: 1 })`) so the executor does not improvise.

Triaged as not-a-problem at 2026-10-06T20:35:42.678Z: fixed in plan 04-3 and 05-2
