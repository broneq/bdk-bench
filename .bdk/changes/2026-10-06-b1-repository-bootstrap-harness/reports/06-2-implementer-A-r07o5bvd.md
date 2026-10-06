---
schema: 1
ticket: A-r07o5bvd
role: implementer
at: 2026-10-06T18:25:20.289Z
status: done
files: [ harness/suites/smoke/suite.ts, harness/suites/smoke/suite.test.ts ]
entries: []
evidence: []
---
Built 06-2 test-first: suite.test.ts (9 tests) was red on the missing module, then suite.ts made it green. `npx vitest run harness/suites`, `npx tsc --noEmit` and `npx eslint harness/suites` are clean.

Notes:
- `SmokeSpec.sandbox` maps to `SeriesPlan.sandboxDir`; the plan's `workflows` key is used as the earlier parts define it.
- `readVersions()` is called without arguments, as the task says, so it reads the repository's `versions.json`; tests rely on that real file.
- `SmokeDeps.prepareFixture` and `evaluate` have the types of the real functions; `evaluate` receives `dirs.rootDir` first.
- `check()` was not run against promptfoo here (part-level success measure).
