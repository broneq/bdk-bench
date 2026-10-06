---
schema: 1
ticket: A-k4swlazj
role: implementer
at: 2026-10-06T17:55:38.458Z
status: done
files: [ harness/budget.ts, harness/budget.test.ts ]
entries: []
evidence: []
---
Copied budget.ts and budget.test.ts from bdk evals (T46 worktree copy); renamed LedgerEntry.cell to workflow, dropped the design-id reference from the header comment. Test first: red (module missing), then green. Vitest 8 passed, eslint, prettier and tsc clean for both files. All six listed test cases are covered.
