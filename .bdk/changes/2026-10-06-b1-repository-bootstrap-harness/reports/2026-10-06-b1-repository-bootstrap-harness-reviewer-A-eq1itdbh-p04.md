---
schema: 1
ticket: A-eq1itdbh
role: reviewer
at: 2026-10-06T21:28:30.975Z
group: p04
status: done
files: []
entries: []
evidence: []
---

# Review A-eq1itdbh@p04 (hook.test.ts, provider.test.ts)

Range a5320b6..57b47df adds three tests; vitest on both files passes (32 tests).

- hook.test.ts "appends a row for the workflow the provider named in the response's metadata": the result has no provider label, so it fails if extensionHook stops reading metadata.benchWorkflow (workflow "" would throw unknown workflow). Asserts workflow, item and run values. Holds.
- hook.test.ts "falls back to the provider's label...": covers the error path with no response; asserts the workflow and the "provider error: boom" discard reason (contract string, BDK-TQ-9). Holds. vi.unstubAllEnvs is added in afterEach, so SERIES_ENV does not leak.
- provider.test.ts RunProvider id(): asserts the `bench:<workflow>` contract from plan 04-2 (BDK-TQ-9), driven through the constructor config. Not a constant mirror. Holds.

Plan 04-1 and 04-2 test cases are covered by the pre-existing tests plus these. No findings. Minor gaps only: no test that RunProvider.callApi forwards its workflow and sdk to callRun (one-line delegation, callRun is tested directly), and none for a result with neither metadata nor label (throws unknown workflow via runContext, already tested).
