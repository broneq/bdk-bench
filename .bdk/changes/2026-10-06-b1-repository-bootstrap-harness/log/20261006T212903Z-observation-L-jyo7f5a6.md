---
schema: 1
id: L-jyo7f5a6
type: observation
summary: smoke runner redefines resultsFile locally instead of paths.ts helper
status: resolved
source: agent:reviewer
author: Przemysław Broniszewski <przemek@broniszewski.net>
at: 2026-10-06T21:29:03.357Z
ticket: A-eq1itdbh
group: p06
refs:
  - harness/suites/smoke/suite.ts:156
  - BDK-ARCH-5
level: not-a-problem
---

Problem: the fix replaced paths.ts resultsFile(suite, series, rootDir) with a local closure over dirs.resultsDir, so the layout results/<suite>/<name>.jsonl is spelled in suite.ts as well as paths.ts.

Why it matters: the two spellings can drift (BDK-ARCH-5); main.ts regrade uses the paths.ts one.

Suggested fix: let paths.ts resultsFile accept a results directory, or keep the closure and add a test that both agree.

Triaged as not-a-problem at 2026-10-06T21:31:07.157Z: repeats L-2jjmnq7b
