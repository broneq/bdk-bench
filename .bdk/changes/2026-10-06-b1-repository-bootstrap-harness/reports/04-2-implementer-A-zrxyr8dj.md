---
schema: 1
ticket: A-zrxyr8dj
role: implementer
at: 2026-10-06T18:13:53.978Z
status: done
files: [ harness/provider.ts, harness/provider.test.ts ]
entries: []
evidence: []
---
Copied provider.ts and provider.test.ts from 825455dd with the part's renames (cell to workflow, bdkCell to benchWorkflow, id `bench:<workflow>`, sandbox to sandboxDir, benchCommit/adapter provenance). Dropped the BDK design references and the test for JSON-parsed vars (not in the task's cases; covered by hook tests). `vitest run harness/provider.test.ts` passes 8/8; tsc and eslint report nothing for these files. The tests were written before the code was adapted, but the red run was not recorded separately because the source is a copy.
