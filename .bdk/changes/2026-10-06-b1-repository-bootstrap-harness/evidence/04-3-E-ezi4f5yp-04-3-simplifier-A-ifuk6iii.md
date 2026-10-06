---
schema: 1
ticket: A-ifuk6iii
role: simplifier
at: 2026-10-06T18:15:43.205Z
status: done
files: []
entries: []
evidence: []
---
# Simplifier report 04-3

No change. `harness/providers.ts` is a single factory with no duplication, dead code or indirection; its comments each state a non-obvious constraint (BDK-CQ-4). `harness/providers.test.ts` asserts behaviour, not mirrors. `oneTurnProvider` and `OneTurnCell` are already absent.
