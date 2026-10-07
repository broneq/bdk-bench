---
schema: 1
id: L-ctvk1zxu
type: finding
summary: architecture.md:59 suite import edge omits cli and hook, the two boundary interfaces of :69; runner->cli drawn twice
status: accepted
source: agent:design-verifier
author: Przemysław Broniszewski <przemek@broniszewski.net>
at: 2026-10-06T17:34:52.736Z
ticket: A-iirvwmls
refs:
  - .bdk/changes/2026-10-06-b1-repository-bootstrap-harness/architecture.md
  - BDK-ARCH-2
review: true
level: nice-to-have
disposition: defer
---

architecture.md:59 lists what suites import: "runner, providers, fixture, tools, results, paths, budget, series, tree". At `825455dd`, every suite imports `RunOptions` and `SuiteRunner` from `cli.ts` (for example `suites/regression/suite.ts:12`), and every hooks module imports `SuiteHooks` and related types from `hook.ts` (`regression/hooks.ts:7-14`, `stages/hooks.ts:12-13`). Those are the two harness-owned interfaces that "The suite boundary" (:69) is about (BDK-ARCH-2), so the diagram leaves out the boundary it describes. A B3-style suite also imports `judge` and `stats` (`regression/hooks.ts:15`, `regression/report.ts:9`).

Smaller issues:

- `runner -> cli` is drawn twice, at :48 and again in :51.
- :64 says promptfoo loads "two thin entry points" by `file://` path, the provider and the assertion. `hook.ts` `extensionHook` (afterEach) is a third.

L-27j0iopb's three named slips are fixed. This one was raised in L-hy50mlmx and is still open.

Triaged as nice-to-have at 2026-10-06T20:35:41.251Z

Decided defer at 2026-10-06T21:15:01.152Z
