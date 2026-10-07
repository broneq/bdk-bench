---
schema: 1
id: L-t7vti9lp
type: observation
summary: Plan part 03 still documents resultsFile(suite, series, root) after the fix changed its signature
status: resolved
source: agent:integration-reviewer
author: Przemysław Broniszewski <przemek@broniszewski.net>
at: 2026-10-06T21:40:07.803Z
ticket: A-f1miv2g3
group: integration
refs:
  - .bdk/changes/2026-10-06-b1-repository-bootstrap-harness/plan/parts/03-fixture-paths-tools.md
  - harness/paths.ts
  - L-2jjmnq7b
  - public-api
level: not-a-problem
---

Problem: harness/paths.ts:62 now exports `resultsFile(resultsDir, suite, series)` and a new `RESULTS_DIR`; plan part 03 (line 34) still lists `resultsFile(suite, series, root = ROOT_DIR)` and no `RESULTS_DIR`. All call sites (compare.ts:90, main.ts:52, suite.ts:158) were updated; grep finds no caller left on the old order. The reorder of three string parameters is invisible to the type checker, so a stale caller would have compiled.

Why it matters: Within the `public-api` risk area only as an exported module function; no CLI flag or file format changed (rows stay at `results/<suite>/<series>.jsonl`, as design.md and spec-delta bench-runner.md state). The plan is the record later readers use for the module's exports.

Suggested fix: None needed for code. If plans are kept as living documents, note the decided signature from L-2jjmnq7b in part 03.

Triaged as not-a-problem at 2026-10-06T21:40:37.311Z: repeats L-x53cb90l
