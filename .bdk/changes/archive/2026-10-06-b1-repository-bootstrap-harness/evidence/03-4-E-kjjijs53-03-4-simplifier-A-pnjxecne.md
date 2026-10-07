---
schema: 1
ticket: A-pnjxecne
role: simplifier
at: 2026-10-06T18:02:04.744Z
status: done
files: [ harness/tools.ts ]
entries: []
evidence: []
---
Extracted the duplicated spawn/close/error logic of `evaluate` and `view` into a private `runPromptfoo` helper. Behaviour unchanged; tests, typecheck, lint and prettier pass. Rules applied: BDK-ARCH-5, BDK-CQ-2.
