---
schema: 1
ticket: A-1pnrlzrw
role: implementer
at: 2026-10-06T20:36:53.093Z
status: done-with-concerns
files: [harness/providers.ts, harness/runner.ts, harness/providers.test.ts, harness/runner.test.ts, harness/suites/smoke/suite.test.ts]
entries: []
evidence: []
---

Fixed L-dzhorbso: providers.ts now emits `{ id: file://<harness>/provider.ts, label, config: { workflow: label, sdk } }`; runner.ts reads `config.sdk.model`. Tests moved to `config.sdk.*`; runner.test.ts gained the seam test (id ends with /harness/provider.ts, config.workflow equals label), red before the fix. typecheck, lint, format:check, 164 unit tests and `bench check` pass.

Concern: the real `bench smoke --probe` was not run (it costs money and needs approval); the row check (completed 1, turns, wall_s) remains for the orchestrator.
