---
schema: 1
id: L-d4qsan2j
type: observation
summary: Smoke runner reads versions.json from ROOT_DIR and hard-codes 100/15/4 instead of injected dirs and DEFAULT_*
status: proposed
source: agent:integration-reviewer
author: Przemysław Broniszewski <przemek@broniszewski.net>
at: 2026-10-06T20:33:57.916Z
ticket: A-qy7ysb9p
group: integration
refs:
  - harness/suites/smoke/suite.ts
  - BDK-ARCH-5
review: true
level: blocker
disposition: fix
---

Problem: harness/suites/smoke/suite.ts:154 calls `readVersions()` with its default `<ROOT_DIR>/versions.json`, while every other location of `run` comes from `deps.dirs` (rootDir, runsDir, ...). `check()` (lines 210-214) hard-codes budget 100, run cap 15 and concurrency 4, which `budget.ts` (`DEFAULT_BUDGET_USD`, `DEFAULT_RUN_CAP_USD`) and `cli.ts` (`DEFAULT_CONCURRENCY`) also define.

Why it matters: The injected `dirs` seam is only partial, so the suite test "no file read or written outside the temp directory" still reads the real versions.json; and the defaults can drift between the CLI and the model-free check (BDK-ARCH-5). Neither is wrong today.

Suggested fix: Use `readVersions(join(dirs.rootDir, "versions.json"))`, and import the default constants (export `DEFAULT_CONCURRENCY` from cli.ts) in `check()`. When B3 adds the next suite, move the shared run skeleton out of the suite then (BDK-ARCH-4).

Triaged as should-fix at 2026-10-06T20:35:39.226Z

Decided fix at 2026-10-06T21:15:00.088Z
