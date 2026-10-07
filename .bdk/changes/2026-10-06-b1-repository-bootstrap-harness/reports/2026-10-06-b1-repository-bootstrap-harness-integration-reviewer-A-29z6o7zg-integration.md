---
schema: 1
ticket: A-29z6o7zg
role: integration-reviewer
at: 2026-10-07T02:57:38.104Z
group: integration
status: done
files: []
entries: [L-wp8y6mv2, L-ed8n1xs0]
evidence: []
---

# Integration review A-29z6o7zg

Range 4d6e29d..20e4df7. Code changes: harness/paths.ts, harness/paths.test.ts, harness/tools.test.ts (all part 03). Everything else in the range is `.bdk/` kernel state (dispatch packages, reports, evidence, ledger entries).

## What holds

- L-smihxpk1 (eager `userInfo()` default): fixed. `cacheHome`'s fallback is now a thunk called only when neither XDG_CACHE_HOME nor HOME is absolute (harness/paths.ts:20,25), so importing paths.ts with an absolute HOME no longer reads the password database. A test with a throwing fallback pins this (harness/paths.test.ts:62-68).
- L-sdsnz2m7 (tools.test.ts tied to the process HOME): fixed. The `promptfooEnv({})` case that expected `os.homedir()` is removed; the fallback is covered once, in paths.test.ts, with injected values. Scoped tests pass with the real HOME and with `HOME=/private/tmp/claude-501/fakehome` (15/15 both times). Plan 03-4's test list never named the removed case, so plan and tests agree.
- L-ydk80cmr (guard test that could not fail): fixed. The new test stubs the process environment. Checked by reasoning and probe: with the default reverted to `os.homedir()`, `HOME="rel"` and `HOME=""` make `os.homedir()` return `"rel"` and `""` (Node v24.21.0), so the assertion fails as intended under vitest's default `forks` pool. The dependency on that pool is recorded as observation L-ed8n1xs0.
- Seams: `cacheHome` has two production callers (`SANDBOX_DIR`, `promptfooEnv`), and both pass `env` only. No module references `homedir` or `userInfo` any more except paths.ts. `pnpm typecheck` is clean, and eslint on the three files is clean.
- No duplication was introduced. No changed code file falls outside part 03's `Files:`.

## What does not hold / remains

- L-wp8y6mv2 (low, public-api and configuration): the exported `cacheHome` signature changed (string to thunk). It is consistent across callers. The plan, design and architecture wording on the cache directory is still the deferred drift L-glc4rqh8.
- Deferred items from round A-kuit02bz (L-glc4rqh8, L-wmfm3hwc, L-iqp3h0qz, L-yxi2wmcc) are untouched by this range, as decided.

## Areas

- public-api: The exported cacheHome now takes a lazily called fallback function instead of an eagerly computed string, so the password database is read only when HOME and XDG_CACHE_HOME are unusable. The two internal callers are unaffected.
- configuration: The cache directory derivation no longer reads the password entry when HOME is absolute, and the tests no longer depend on the test process's HOME, so `pnpm test` is stable in sandboxes with an overridden HOME.
- unplanned: Only `.bdk/` workflow state (dispatch packages, reports, evidence and ledger entries) changed outside the plan. No product file is unplanned.
