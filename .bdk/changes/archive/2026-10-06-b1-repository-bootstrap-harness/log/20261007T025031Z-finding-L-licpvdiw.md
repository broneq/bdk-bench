---
schema: 1
id: L-licpvdiw
type: finding
summary: resultsFile signature differs from plan 03-2 contract; test case for it missing
status: resolved
source: agent:reviewer
author: Przemysław Broniszewski <przemek@broniszewski.net>
at: 2026-10-07T02:50:31.247Z
ticket: A-kuit02bz
group: p03
refs:
  - harness/paths.ts:65
level: not-a-problem
---

Problem: Plan 03-2 specifies resultsFile(suite, series, root = ROOT_DIR) returning <root>/results/<suite>/<series>.jsonl, with the test resultsFile("smoke","s1","/x") = /x/results/smoke/s1.jsonl. paths.ts:65 implements resultsFile(resultsDir, suite, series) returning <resultsDir>/<suite>/<series>.jsonl, and the test asserts that form. Also RESULTS_DIR, cacheHome, seriesDir and seriesNames are exported but not in the plan's export list; callers (compare.ts, main.ts, smoke/suite.ts) are written against the implemented signature. Plan 06 still says main.ts calls resultsFile(suite, series).

Why it matters: The plan is the contract and a later part or the hidden acceptance may call the documented form; with the swapped argument order a call resultsFile("smoke","s1") yields a wrong path silently (string args, no type error).

Suggested fix: Either align the code and callers to the plan signature, or amend plan part 03 and 06 and the spec to document the implemented one (resultsDir first, extra exports) so the contract and code agree.

Triaged as not-a-problem at 2026-10-07T02:53:17.329Z: repeats L-x53cb90l
