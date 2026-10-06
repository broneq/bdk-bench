---
schema: 1
ticket: A-eq1itdbh
role: implementer
at: 2026-10-06T21:23:38.464Z
status: done
files: [README.md, CLAUDE.md, harness/budget.ts, harness/budget.test.ts, harness/cli.ts, harness/hook.test.ts, harness/paths.ts, harness/paths.test.ts, harness/provider.test.ts, harness/regrade.ts, harness/regrade.test.ts, harness/runner.ts, harness/tools.ts, harness/tools.test.ts, harness/tree.ts, harness/tree.test.ts, harness/suites/smoke/suite.ts, harness/suites/smoke/suite.test.ts]
entries: []
evidence: []
---

# Report A-eq1itdbh

Fixed entries: L-iwpe184c, L-2pol2svk, L-rlh41ea0, L-bdw67ijx, L-226dmo7r, L-u6zj24kd, L-lwx3j8iz, L-909m032m, L-gwgg8qti, L-4q280780, L-0158y2bb, L-kslh5kwj, L-y2am8p8s, L-d4qsan2j, L-optesnfc, L-l5f27dvo.

TDD log (red seen first for each behaviour):
- tree: untracked src/new.ts listed (red: /src\/new\.ts/ not matched), bare path on first line (red: "M README.md"), mkdtemp + afterEach cleanup. Green: --untracked-files=all, split before trim.
- paths: ".."-prefixed dir (red: expected to throw), cacheHome (red: not a function), tools HOME unset (red: relative .cache). Green: sep-aware check, shared cacheHome (BDK-ARCH-5).
- regrade: unknown saved judge returns 2 before any judge call; judge failure midway leaves rows and judge.json unchanged. Resolved in a pre-check pass; judge.json and rows written together after the loop.
- smoke suite: collision check uses dirs.resultsDir (red: series name not suffixed); versions.json from dirs.rootDir; check() uses DEFAULT_* (DEFAULT_CONCURRENCY exported from cli.ts); probe test pins "6.25 USD for 5 runs".
- RunProvider id and extensionHook afterEach (metadata and label fallback) tests added; loadSuiteHooks was already tested in smoke hooks.test.ts.
- Renames: perCell -> perWorkflow (budget.ts, runner.ts), runner modelsOf -> configuredModels.
- L-2pol2svk: series.ts header already read correctly; no change needed.
- Docs: README example denominators 20/11/12/11 = 54; CLAUDE.md CI line lists bench check.

Command: npx vitest run (175 passed); pnpm lint, pnpm format:check, npx tsc --noEmit clean.
