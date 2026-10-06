---
schema: 1
ticket: A-1pnrlzrw
role: reviewer
at: 2026-10-06T20:44:08.637Z
group: p06
status: done
files: []
entries: [L-6qhbjfvu]
evidence: []
---

# Review p06: harness/suites/smoke/suite.test.ts

The range changes one line: the plain-workflow test now reads provider.config.sdk.plugins, matching the provider config shape (harness/provider.ts keeps sdk config under `sdk`) and plan 06-2. Verified: vitest on harness/suites passes (14 tests), tsc --noEmit is clean.

The tests cover the plan cases: sdkVersion, one plain workflow, 2 rendered tests with bench_task and bench_item, unknown workflow error text, harness assertion and provider prompts, probe run (no assertCommitted, one prepareFixture at runsDir/cache, config under series/smoke/probe-*), and the uncommitted refusal returning 1. No TQ ban applies; assertions check produced results.

No findings. One observation: the no-write-outside-temp assertion and check() are not tested (L-6qhbjfvu).
