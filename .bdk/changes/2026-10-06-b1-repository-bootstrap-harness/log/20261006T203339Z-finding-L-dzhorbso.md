---
schema: 1
id: L-dzhorbso
type: finding
summary: Rendered configs call anthropic:claude-agent-sdk directly; harness provider.ts is never loaded, so no run is isolated
status: resolved
source: agent:integration-reviewer
author: Przemysław Broniszewski <przemek@broniszewski.net>
at: 2026-10-06T20:33:39.337Z
ticket: A-qy7ysb9p
group: integration
refs:
  - harness/providers.ts
  - harness/runner.ts
  - harness/provider.ts
  - 04-3
  - BDK-CQ-7
category: integration-failure
level: blocker
---

Problem: Severity critical. `sessionProvider` (harness/providers.ts:28-60) returns `{ id: "anthropic:claude-agent-sdk", label, config: { workflow, ...sdkOptions } }`, and `renderSeries` (harness/runner.ts:109-112) spreads that entry into the promptfoo config unchanged. No production module references `harness/provider.ts` (`grep -rn provider.ts harness/` finds only provider.test.ts and two comments in hook.ts), so `RunProvider`/`callRun` is dead code. The source at 825455dd wrapped every entry as `{ id: "file://<harness>/provider.ts", label, config: { cell: label, sdk } }`; plan 04-3 kept that shape (its test case asserts `config.sdk.plugins` and `config.workflow`), and plan 06-2 asserts `config.sdk.plugins` too, but providers.test.ts:10 and suite.test.ts:72 were written against the flat shape, and runner.ts:78 reads `provider.config.model` to match it. Every part passes its own tests and `pnpm bench check` (promptfoo validates the flat entry), so only the seam is broken.

Why it matters: In a real `pnpm bench smoke --probe`, promptfoo's SDK provider gets no `working_dir`, so (node_modules/promptfoo/dist/src/claude-agent-sdk-*.js:570) it runs in a fresh `os.tmpdir()/promptfoo-claude-agent-sdk-*` directory, not the fixture copy; no `debug_file`, no per-run `XDG_CONFIG_HOME`; `startRun` never runs, so the per-run budget refusal (`BudgetReached` before a session) never happens; `metadata.benchWorkflow` and `wallMs` are never set. Then `gradeRun` calls `runContext(plan, "")`, which throws "the run names no workflow", no measurement.json is written, isolation would report "no session log" anyway, and `wall_s` is never recorded. Every run is discarded or measures `completed` 0, so the spec-delta requirements "Per-run isolation", "Budget ledger and run cap" (SHALL NOT start a run at the budget), "One row per run" (wall time) and the design's acceptance run all fail, while CI stays green.

Suggested fix: Restore the wrapper in providers.ts: `ProviderEntry = { id: string; label: string; config: RunProviderConfig }` built as `{ id: \`file://${fileURLToPath(new URL("./provider.ts", import.meta.url))}\`, label, config: { workflow: label, sdk: {...} } }`; read `config.sdk.model` in runner.ts `modelsOf`; fix providers.test.ts and suite.test.ts to the plan's `config.sdk.*` assertions; add one runner or suite test asserting each rendered provider's `id` ends with `/harness/provider.ts` and its `config.workflow` equals its label (the seam test that would have caught this). Then run the approved `bench smoke --probe` and check the row has `completed` 1, `turns` and `wall_s`.

Triaged as blocker at 2026-10-06T20:35:38.469Z

Resolved as resolved at 2026-10-06T20:43:20.702Z: provider.ts wrapper restored, seam test added, committed in a5320b6
