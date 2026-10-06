---
schema: 1
id: L-edh9mnuy
type: blocker
summary: series.ts expandTests is the T40 per-workflow form; 05-2 copies renderSeries calling expandTests(items, runs)
status: resolved
source: agent:verifier
author: Przemysław Broniszewski <przemek@broniszewski.net>
at: 2026-10-06T18:06:47.456Z
ticket: A-yx1y4qid
refs:
  - harness/series.ts
  - 05-2
  - 02-2
  - .bdk/changes/2026-10-06-b1-repository-bootstrap-harness/design.md
  - plan-verify
category: unresolved-decision
---
harness/series.ts:116-143 (commit 55b9d99, task 02-2) has `expandTests(workflows, items, runs, workflowVars)`: one test per run, item and workflow, each pinned with `providers: [workflow]`, and `TestCase` gained `providers`. That is the T40 shape that broneq/bdk 4f146f20 ("cells as viewer columns", an ancestor of 825455dd) replaced. At 825455dd, `expandTests(items, runs)` gives one test per item and run, with no `providers`. renderSeries (evals/harness/runner.ts:113) calls it that way and maps prompts to providers.

Plan 02-2 said expandTests is "unchanged". design.md:31 says "promptfoo runs one test per item and run, one column per workflow".

05-2 says to copy runner.ts and keep renderSeries. Its copied call `expandTests(items, setup.runs)` does not typecheck against the current signature, and harness/series.ts is in 05's do-not-touch.

The 05-2 implementer must pick one of two options, and no task or decision covers either:
(a) restore the 825455dd `expandTests` and `TestCase` (drop `providers`/`workflowVars`, update series.test.ts). This is a natural fit for 04-1, which now lists series.ts and series.test.ts in Files.
(b) adopt per-workflow tests. That needs a decision: the viewer layout changes from one row per item and run to sparse rows, and per-workflow prompts would have two mechanisms (WorkflowSetup.prompt and workflowVars). design.md:31 and 05-2 must then also be updated.

Related: the 05-2 case "2 workflows, 2 items, 3 runs render 12 tests" (prior finding L-3hsct71p) holds only under (b); under (a) it is 6.

Resolved as resolved at 2026-10-06T18:07:51.087Z: L-2xvdz91l: 04-1 restores expandTests; 05-2 case changed to 6 tests
