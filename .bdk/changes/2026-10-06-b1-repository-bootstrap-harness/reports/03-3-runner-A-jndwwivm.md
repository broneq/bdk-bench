---
schema: 1
ticket: A-jndwwivm
role: runner
at: 2026-10-06T18:01:40.235Z
status: done
files: [ harness/tree.ts, harness/tree.test.ts ]
entries: []
evidence: [ E-dxihtoa7, E-t97ejorv ]
---

# 03-3 Committed-tree check: runner report

All checks have passed successfully.

## Checks completed

- **tests-scoped**: PASS - All 5 tests pass (Evidence: E-dxihtoa7)
  - headCommit returns 40 hex characters equal to git rev-parse HEAD
  - assertCommitted passes when the repository is clean
  - assertCommitted passes when there are new files in results/ and .bdk/
  - assertCommitted throws when README.md is modified
  - assertCommitted throws when there is an untracked file outside results/ and .bdk/

- **lint**: PASS - ESLint and Prettier checks pass (Evidence: E-t97ejorv)

## Implementation

Created two new files:

- `harness/tree.ts`: Implements `headCommit()` and `assertCommitted()` functions
  - `headCommit(repoRoot)` returns the full commit hash of HEAD
  - `assertCommitted(repoRoot)` verifies the working tree is clean outside results/ and .bdk/ directories
  
- `harness/tree.test.ts`: Comprehensive test suite with 5 test cases covering all scenarios
