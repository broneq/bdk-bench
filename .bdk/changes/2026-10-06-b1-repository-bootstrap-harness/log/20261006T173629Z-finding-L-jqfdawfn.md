---
schema: 1
id: L-jqfdawfn
type: finding
summary: scope high+ of plan-verify drops 8 findings for the review gate
status: resolved
source: kernel
author: Przemysław Broniszewski <przemek@broniszewski.net>
at: 2026-10-06T17:36:29.256Z
refs:
  - plan-verify
  - L-2ory6lv4
  - L-xu5gvlcj
  - L-49nvy6t7
  - L-e3zrwyr6
  - L-z5yek3ho
  - L-qge43c00
  - L-yzhrhjvc
  - L-avxkr0a2
review: true
level: not-a-problem
---

- L-2ory6lv4: design.md:60,68 drift from plan: benchCell vs benchWorkflow, results-only tree check, SuiteRunner.report
- L-xu5gvlcj: 04-3 says oneTurnProvider has no consumer; runner.test.ts copied in 05-2 imports and uses it
- L-49nvy6t7: 06-2 run() never says where benchCommit and the adapter version come from
- L-e3zrwyr6: 06-2 run() unit tests inject only 3 deps, so they write to real .runs/, results/ and ~/.cache/bdk-bench
- L-z5yek3ho: 07-2 drops three plugin-independent Provider facts rows that justify provider.ts and assert.ts
- L-qge43c00: 05-3 keeps the difference-rule verdict column that design.md:74 says is not copied
- L-yzhrhjvc: 07-4 allows quoting changes but its word-diff test fails on them; operator-i18n/checks.yaml:263 is one
- L-avxkr0a2: 07-1 pins actions/checkout, pnpm/action-setup and setup-node to v4; the source CI uses v7, v6, v7

Triaged as not-a-problem at 2026-10-06T20:35:43.962Z: kernel scope note
