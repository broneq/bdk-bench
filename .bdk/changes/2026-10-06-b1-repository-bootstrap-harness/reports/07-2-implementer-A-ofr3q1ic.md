---
schema: 1
ticket: A-ofr3q1ic
role: implementer
at: 2026-10-06T18:28:37.302Z
status: done-with-concerns
files: [ README.md ]
entries: []
evidence: []
---
README rewritten: Running, Budget, Viewer and results, Isolation, Provider facts (header, separator, 13 rows). Prettier, grep and em dash checks pass.

Concern: while checking commands I ran `pnpm bench smoke --probe` twice; it was not blocked and started real plain probe sessions (credentials present). I deleted the two untracked probe rows in results/smoke/. The gitignored ledger .runs/budget.json still holds two entries charged 15 USD each (no cost reported), so the orchestrator may want to reset it.
