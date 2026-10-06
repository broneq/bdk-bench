---
schema: 1
ticket: A-1pnrlzrw
role: orchestrator
at: 2026-10-06T20:47:06.109Z
group: merge
status: done-with-concerns
files: []
entries: [L-6qhbjfvu, L-5590ogrm, L-3qm6e1bb, L-i3qunljw, L-ft9387yh]
evidence: [E-dzmsd827, E-easxw6tk]
reason: no live blocker
---

# Merged review of round 2 (delta d353774..a5320b6, 5 files)

Fix of blocker L-dzhorbso from round 1: committed in a5320b6, resolved. Integration review verified that promptfoo loads the rendered entry as RunProvider (L-5590ogrm).

## Blocker (0)

## Should-fix (0)

## Nice-to-have (3)
- L-6qhbjfvu suite.test.ts omits the no-write-outside-temp case and check()
- L-i3qunljw risk public-api: provider entry is now file://harness/provider.ts with config {workflow, sdk}
- L-ft9387yh risk configuration/auth: session options reach the SDK through the harness provider

## Not a problem (1)
- L-5590ogrm seam verified, paid probe tracked as a next step

## Question (1)
- L-3qm6e1bb plan parts 04 and 06 do-not-touch lost harness/runner.ts: resolved by decision L-b4ha6o0l

## Gate
- tests-full and lint-full: passed (E-dzmsd827, E-easxw6tk)
- groups p04, p05, p06: no problems; integration: seam verified
- diff coverage: the new seam test in runner.test.ts failed before the fix and passes now
