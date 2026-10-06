---
schema: 1
ticket: A-qy7ysb9p
role: orchestrator
at: 2026-10-06T20:36:04.860Z
group: merge
status: done-with-concerns
files: []
entries: [L-bdw67ijx, L-226dmo7r, L-u6zj24kd, L-lwx3j8iz, L-4i6yvxpj, L-sx681opw, L-3va7avr6, L-909m032m, L-gwgg8qti, L-4q280780, L-tjvkehmd, L-cqwh6vbp, L-0158y2bb, L-kslh5kwj, L-uw5fceuh, L-y2am8p8s, L-dzhorbso, L-6yzpp622, L-d4qsan2j, L-optesnfc, L-l5f27dvo, L-cnzew85t, L-o1y0084r, L-rdvhne2g, L-dqbq4i8b, L-k6tfu4n7]
evidence: [E-9o4p0eur, E-0fkpznn1]
reason: one blocker, L-dzhorbso
---

# Merged review of round 1 (full range, 63 files)

## Blocker (1)
- L-dzhorbso: rendered configs call anthropic:claude-agent-sdk directly; harness/provider.ts is never loaded, so no run gets a fixture copy, debug log, budget check or wall time.

## Should-fix (10)
- L-bdw67ijx assertCommitted names a directory, not the file
- L-226dmo7r tree.test.ts temp dirs never removed
- L-4i6yvxpj projection keeps cell identifiers
- L-909m032m loadSuiteHooks and RunProvider have no test
- L-gwgg8qti regrade overwrites judge.json before results are written
- L-4q280780 regrade does not check the saved judge name is still declared
- L-0158y2bb freshSeriesName checks rootDir/results, rows go to dirs.resultsDir
- L-kslh5kwj probe test OR assertion cannot fail
- L-d4qsan2j smoke runner hard-codes 100/15/4 and reads real versions.json
- L-optesnfc assertCommitted strips the status code from every line but the first

## Nice-to-have (13)
- L-u6zj24kd, L-lwx3j8iz, L-sx681opw, L-3va7avr6, L-cqwh6vbp, L-y2am8p8s, L-l5f27dvo, L-6yzpp622, L-cnzew85t, L-o1y0084r, L-rdvhne2g, L-dqbq4i8b, L-k6tfu4n7

## Not a problem (3)
- L-tjvkehmd repeats L-4i6yvxpj, L-uw5fceuh repeats L-d4qsan2j, L-g49wubbt repeats L-6yzpp622

## Gate
- tests-full: 164 tests passed in 20 files (E-9o4p0eur)
- lint-full: eslint, prettier and tsc passed (E-0fkpznn1)
- diff coverage: no test entry reported a gap beyond the findings above
