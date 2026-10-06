---
schema: 1
id: L-kslh5kwj
type: finding
summary: Probe test uses an OR assertion that cannot fail on the projection requirement
status: proposed
source: agent:reviewer
author: Przemysław Broniszewski <przemek@broniszewski.net>
at: 2026-10-06T20:32:44.015Z
ticket: A-qy7ysb9p
group: p06
refs:
  - harness/suites/smoke/suite.test.ts:189
review: true
level: blocker
disposition: fix
---

Problem: The probe test asserts line.includes("for 5 runs") || line.includes("projected series"). The plan requires options.runs to be passed unchanged to the projection while the probe itself runs 1; the OR passes if any projection-like line appears.

Why it matters: BDK-TQ-1/TQ-6: a regression passing options.probe ? 1 : options.runs into probeSummary would likely still pass. The stated requirement is not pinned.

Suggested fix: Seed the ledger/rows so the projection has a known cost and assert the exact projected line for 5 runs; drop the OR.

Triaged as should-fix at 2026-10-06T20:35:39.141Z

Decided fix at 2026-10-06T21:15:00.000Z
