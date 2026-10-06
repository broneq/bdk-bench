---
schema: 1
ticket: A-qy7ysb9p
role: reviewer
at: 2026-10-06T20:32:35.323Z
group: p04
status: done-with-concerns
files: []
entries: [L-909m032m]
evidence: []
---

# Review p04 (run lifecycle) - attempt 1

Verdict: the code matches plan part 04; one low-severity test gap.

What holds (evidence: `npx vitest run` on the five test files, 5 files, 46 tests pass):
- hook.ts: budget check precedes any directory touch; `turns` and `wall_s` are recorded only when reported and merged last (harness wins); a discarded row holds only those two; provenance is `{ models, fixtureCommit, benchCommit, adapter }`; no `cell`, `variantHash`, `templateHashes`. Run cap charged on missing cost; budget stop writes no row and no charge.
- provider.ts: `bench:<workflow>` id, `benchWorkflow`, `wallMs`, `transcript`, `budgetStop`; `harness error:` returns cost 0.
- providers.ts: fixed isolation options present, `oneTurnProvider` removed.
- assert.ts: reads `metadata.benchWorkflow`; behaviours as specified.
- transcript.ts: BDK kernel-error branch removed; the test asserts a refused-looking output is `ok`.
- No BDK design references or `cell` naming remain in these files.

Concerns:
- L-909m032m (low): `loadSuiteHooks`, `RunProvider` (id, config read) and the `afterEach` path of `extensionHook` are untested although plan 04-1/04-2 specify them. No project rule is broken; BDK-CQ-7 applies loosely.
