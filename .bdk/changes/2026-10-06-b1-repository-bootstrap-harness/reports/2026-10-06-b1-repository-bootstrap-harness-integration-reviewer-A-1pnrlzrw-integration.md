---
schema: 1
ticket: A-1pnrlzrw
role: integration-reviewer
at: 2026-10-06T20:46:24.436Z
group: integration
status: done-with-concerns
files: []
entries: [L-5590ogrm, L-3qm6e1bb, L-i3qunljw, L-ft9387yh]
evidence: []
---

# Integration review A-1pnrlzrw (attempt 2 of 2)

Range `d353774..a5320b6` (one commit, `fix(review): A-1pnrlzrw`). Code changes: harness/providers.ts, harness/runner.ts, harness/providers.test.ts, harness/runner.test.ts, harness/suites/smoke/suite.test.ts. The remaining files are `.bdk/` state (dispatch, reports, evidence, ledger) and four plan do-not-touch edits plus a prettier reformat of plan/index.md.

## What holds

- The blocker L-dzhorbso is fixed at the seam. `sessionProvider` emits `{ id: file://<repo>/harness/provider.ts, label, config: { workflow, sdk } }`; `ProviderEntry.config` is typed by `RunProviderConfig` imported (type-only) from provider.ts, so producer and consumer share one type (BDK-ARCH-5) and the edge `providers -> provider` matches architecture.md (no cycle, BDK-ARCH-1).
- `modelsOf` (runner.ts:78) reads `config.sdk.model`; no other consumer of the flat shape remains (grep over harness/, README.md, CLAUDE.md).
- The new seam test (runner.test.ts:90-93) asserts each rendered provider's `id` ends with `/harness/provider.ts` and `config.workflow` equals its label; it would fail on the old shape (BDK-TQ-1). providers.test.ts and suite.test.ts now assert `config.sdk.*` as plans 04-3 and 06-2 state.
- Empirical check: the installed promptfoo's `loadApiProviders` on the produced entry instantiates `RunProvider` with `id()` `bench:plain`, `label` `plain`, `workflow` `plain` (inline node, no model call).
- Gate at a5320b6: `pnpm typecheck`, `pnpm lint`, `pnpm format:check`, `pnpm test` (20 files, 164 tests) and `pnpm bench check` (`checked smoke`) all pass.
- No duplication across parts; no code file outside the plan's `Files:`.

## Concerns

- L-5590ogrm (observation): the inner leg (SDK call with `working_dir`, `debug_file`, per-run `XDG_CONFIG_HOME`, and the resulting row) is unverified; the paid `pnpm bench smoke --probe` named as the acceptance signal has not been run.
- L-3qm6e1bb (question, /bdk:setup): the commit also removed `harness/runner.ts` from the do-not-touch of parts 04 and 06, which decision L-geqc05p3 (parts 01 and 07 only) does not cover.
- L-i3qunljw (finding, low, risk public-api) and L-ft9387yh (finding, low, risks configuration and auth): intended contract and configuration moves, recorded for the gate.

## Areas

- public-api: The exported ProviderEntry and every rendered promptfoo provider entry now name the harness provider by absolute file:// path with SDK options under config.sdk, so runs go through RunProvider as the source and plan 04-3 intended.
- configuration: Session runtime options (env isolation, setting_sources, permission flags, budget) are unchanged in value but now reach the SDK through callRun, which adds the per-run working_dir, debug_file and XDG_CONFIG_HOME.
- auth: Sessions still run with bypassPermissions; the fix makes the per-run confinement that justifies it actually apply.
- unplanned: Plan do-not-touch lists of parts 01, 04, 06 and 07 were loosened so the review fix could be committed; only 01 and 07 are covered by a decision.
