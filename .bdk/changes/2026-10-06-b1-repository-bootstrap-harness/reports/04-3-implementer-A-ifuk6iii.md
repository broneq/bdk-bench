---
schema: 1
ticket: A-ifuk6iii
role: implementer
at: 2026-10-06T18:15:32.095Z
status: done
files: [ harness/providers.ts, harness/providers.test.ts ]
entries: []
evidence: []
---
Added sessionProvider, SessionWorkflow and ProviderEntry test-first. Tests, tsc, eslint and prettier pass. oneTurnProvider and OneTurnCell dropped; per-run fields (working_dir, debug_file, XDG_CONFIG_HOME) left to the provider.
