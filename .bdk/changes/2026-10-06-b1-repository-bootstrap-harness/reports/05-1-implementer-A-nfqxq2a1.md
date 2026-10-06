---
schema: 1
ticket: A-nfqxq2a1
role: implementer
at: 2026-10-06T18:19:16.606Z
status: done
files: [ harness/cli.ts, harness/cli.test.ts ]
entries: []
evidence: []
---
Implemented 05-1 test-first (red: module missing; green: 17 tests). Lint, prettier and tsc clean for both files.
Design choice: CliDeps gained `view`, `compare(suite, baseline, candidate)` and `regrade(suite, series)` callbacks, since SuiteRunner no longer has report and view/compare/regrade are not suite methods. `report` parses to command "compare". Budget and run-cap defaults come from budget.ts; concurrency default 4 is local to cli.ts.
