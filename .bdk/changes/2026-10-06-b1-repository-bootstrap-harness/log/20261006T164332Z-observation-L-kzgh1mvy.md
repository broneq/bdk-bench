---
schema: 1
id: L-kzgh1mvy
type: observation
summary: design.md:74 T43 defaulted regression to 1 run, others to 5; design.md:59 execute-ab suite absent at 825455dd
status: accepted
source: agent:design-verifier
author: Przemysław Broniszewski <przemek@broniszewski.net>
at: 2026-10-06T16:43:32.713Z
ticket: A-ektu0d53
refs:
  - .bdk/changes/2026-10-06-b1-repository-bootstrap-harness/design.md
review: true
level: nice-to-have
disposition: defer
---

- design.md:74 "T43 defaulted to 5": `cli.ts` default is `runs: suite === "regression" ? 1 : 5`; `--runs` below 2 is rejected ("the difference rule needs a range"). The decision (default 1, accept any integer from 1) is unaffected.
- design.md:59 lists `execute-ab` among the dropped suites; `evals/suites/` at 825455dd has only regression, review-models, rules-noop, stages, with-without (execute-ab exists only in docs/V3-EVAL-EXECUTE-AB.md).

Triaged as nice-to-have at 2026-10-06T20:35:40.985Z

Decided defer at 2026-10-06T21:15:00.437Z
