---
schema: 1
id: L-6qhbjfvu
type: observation
summary: "suite.test.ts omits two plan cases: no-write-outside-temp assertion and check()"
status: accepted
source: agent:reviewer
author: Przemysław Broniszewski <przemek@broniszewski.net>
at: 2026-10-06T20:44:05.343Z
ticket: A-1pnrlzrw
group: p06
refs:
  - harness/suites/smoke/suite.test.ts
review: true
level: nice-to-have
disposition: defer
---

Problem: Plan 06-2 lists "no file is written outside the temp directory" for the probe run, and the runner defines check(); suite.test.ts asserts neither (check() is only covered by the manual pnpm bench check).

Why it matters: A regression that writes to the real RUNS_DIR/results or breaks check() would pass the unit suite.

Suggested fix: Optionally add a test calling smokeRunner(io, deps).check() with temp dirs expecting "checked smoke", and assert the temp root contains only the expected subdirectories after a probe.

Triaged as nice-to-have at 2026-10-06T20:46:40.639Z

Decided defer at 2026-10-06T21:15:03.089Z
