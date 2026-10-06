---
schema: 1
ticket: A-pnjxecne
role: implementer
at: 2026-10-06T17:59:42.248Z
status: done
files: [ harness/tools.ts, harness/tools.test.ts ]
entries: []
evidence: []
---
Added tools.ts (promptfooEnv, validateConfig, evaluate, view) and tools.test.ts (3 cases, red then green). Lint, tsc and prettier clean. The source had no `view`; it runs `promptfoo view` with cwd rootDir.
