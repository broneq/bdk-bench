---
schema: 1
id: L-dkbuyktu
type: finding
summary: scope high+ of 2026-10-06-b1-repository-bootstrap-harness drops 17 findings for the review gate
status: proposed
source: kernel
author: Przemysław Broniszewski <przemek@broniszewski.net>
at: 2026-10-06T20:36:11.836Z
refs:
  - 2026-10-06-b1-repository-bootstrap-harness
  - L-bdw67ijx
  - L-226dmo7r
  - L-4i6yvxpj
  - L-sx681opw
  - L-3va7avr6
  - L-909m032m
  - L-gwgg8qti
  - L-4q280780
  - L-0158y2bb
  - L-kslh5kwj
  - L-dzhorbso
  - L-6yzpp622
  - L-cnzew85t
  - L-o1y0084r
  - L-rdvhne2g
  - L-dqbq4i8b
  - L-k6tfu4n7
review: true
---

- L-bdw67ijx: assertCommitted lists collapsed untracked dirs (src/), not src/new.ts; test weakened to /src/
- L-226dmo7r: tree.test.ts temp dirs named by Date.now(), never removed; same-ms collisions share a repo
- L-4i6yvxpj: projection keeps cell identifiers beyond the perCell key the contract allows
- L-sx681opw: judge.ts comment cites BDK-internal 'M1 judgements' provenance
- L-3va7avr6: stats.ts formatNumber, formatValues and formatVerdict have no unit tests
- L-909m032m: loadSuiteHooks and RunProvider (id, config read) have no test; both are contract in plan 04-1/04-2
- L-gwgg8qti: regrade overwrites judge.json per row before results are written; a mid-loop failure leaves them inconsistent
- L-4q280780: regrade checks judge.json existence up front but not that the saved judge name is still declared
- L-0158y2bb: freshSeriesName checks rootDir/results but rows are written to dirs.resultsDir
- L-kslh5kwj: Probe test uses an OR assertion that cannot fail on the projection requirement
- L-dzhorbso: Rendered configs call anthropic:claude-agent-sdk directly; harness provider.ts is never loaded, so no run is isolated
- L-6yzpp622: First commit of the Change does not record the source commit 825455dd that design.md requires
- L-cnzew85t: Risk dependencies: new root package pins SDK 0.3.284, promptfoo 0.123.1 (patched) and dev tools exactly
- L-o1y0084r: Risk configuration: CI workflow, lint/format/type/test configs, versions.json pin and BENCH_SERIES/XDG_CACHE_HOME env
- L-rdvhne2g: Risk public-api: new bench CLI, result row JSONL format, ledger and plan file formats
- L-dqbq4i8b: Risk secrets/auth: credential gate reads ANTHROPIC_API_KEY presence only; sessions run bypassPermissions
- L-k6tfu4n7: Risk migration: new stored formats (rows, ledger, plan) and fixture cache BASE_FORMAT 3 forcing a rebuild
