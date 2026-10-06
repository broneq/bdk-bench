---
schema: 1
ticket: A-eq1itdbh
role: orchestrator
at: 2026-10-06T21:31:17.059Z
group: merge
status: done-with-concerns
files: []
entries: [L-tya33mi7, L-7hqcoik5, L-nf9iae8k, L-q45gze8b, L-jyo7f5a6, L-v6x9tm6a, L-z0u3spcp, L-2jjmnq7b, L-bqedx5xr, L-s5eft5my, L-lqqb6y5j]
evidence: [E-h9y7vxks, E-0444xg7m]
---

Delta review of the fix round (a5320b6..57b47df, 18 files, 16 entries fixed). No blockers.

## should-fix
- L-bqedx5xr: cacheHome accepts an empty XDG_CACHE_HOME or HOME
- L-v6x9tm6a: README discard reasons omit "no reported cost" and "harness error"
- L-2jjmnq7b: results-file layout derived in 3 places

## nice-to-have
- L-tya33mi7: sandboxOf containment is lexical
- L-7hqcoik5: tools.ts evaluate, validateConfig, view untested; narrating comments in tree.test.ts
- L-q45gze8b: smokeRunner.check() has no unit test
- L-z0u3spcp: regrade writes non-atomically
- L-lqqb6y5j: architecture.md lacks tools->paths and suites->cli edges

## not-a-problem
- L-jyo7f5a6 repeats L-2jjmnq7b
- L-nf9iae8k, L-s5eft5my repeat L-hv0pk3fy (plan text says perCell)

## Fixed from earlier rounds
The 16 entries decided fix, resolved in 57b47df.

## Gate
tests-full: 175 passed. lint-full: eslint, prettier, tsc clean. Diff coverage: groups p02-p07 and integration reviewed.
