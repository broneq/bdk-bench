---
schema: 1
id: L-l5f27dvo
type: observation
summary: "Two unrelated functions are named modelsOf: runner.ts (config models) and results.ts (models a result used)"
status: proposed
source: agent:integration-reviewer
author: Przemysław Broniszewski <przemek@broniszewski.net>
at: 2026-10-06T20:33:58.196Z
ticket: A-qy7ysb9p
group: integration
refs:
  - harness/runner.ts
  - harness/results.ts
  - BDK-CQ-1
level: nice-to-have
---

Problem: harness/runner.ts:77 defines a private `modelsOf(workflows)` that joins the configured models of the workflows into a string; harness/results.ts exports `modelsOf(result)` that lists the models of a session's `modelUsage`, which hook.ts uses. Same name, different inputs and meaning, across two parts.

Why it matters: A reader or a later edit can import the wrong one; it is only a naming issue today.

Suggested fix: Rename the runner's helper, for example `configuredModels`.

Triaged as nice-to-have at 2026-10-06T20:35:39.916Z
