---
schema: 1
ticket: A-kuit02bz
role: integration-reviewer
at: 2026-10-07T02:51:54.696Z
group: integration
status: done-with-concerns
files: []
entries: [L-sdsnz2m7, L-smihxpk1, L-ydk80cmr, L-wmfm3hwc, L-glc4rqh8]
evidence: []
---

# Integration review A-kuit02bz, range 1c946e8..4d6e29d

The range is the review fix commit 4d6e29d (plus a `.bdk/` checkpoint). Code changes: harness/paths.ts, paths.test.ts, compare.ts, main.ts, suites/smoke/suite.ts, fixing L-bndhs6ue (cacheHome fallback) and L-7qqjll91 (series path derived twice). All four source files are declared by plan tasks 03-2, 05 (compare), 06 (suite, main); no unplanned source file changed.

## What holds

- L-7qqjll91: `seriesDir` now names `.runs/series/<suite>/<series>` once and both the smoke runner (suite.ts:164) and `bench regrade` (main.ts:53) use it; `seriesNames` replaces compare.ts's inline `.jsonl` listing and is the inverse of `resultsFile`. compare.ts's error message and behaviour are unchanged. The rename `seriesDir` -> `checkDir` in the `check` command removes a shadowing of the new import.
- L-bndhs6ue: with the default fallback, `cacheHome` now returns the password-database home's `.cache` when HOME is empty or relative, so SANDBOX_DIR and PROMPTFOO_CONFIG_DIR stay absolute and outside the repository. Branch logic is tested with an injected fallback.

## What does not hold

- L-sdsnz2m7 (medium): the seam to tools.ts was not followed. harness/tools.test.ts:20-24 still expects `os.homedir()` for `promptfooEnv({})`; probed with an overridden HOME, code gives `/Users/broneq/.cache/...` and the test expects `<fake HOME>/.cache/...`, so `pnpm test` fails wherever HOME differs from the passwd home.
- L-smihxpk1 (medium): `userInfo().homedir` is a default parameter, evaluated on every call including `SANDBOX_DIR` at module load. `os.userInfo()` throws when the UID has no passwd entry, so every module importing paths.ts crashes in such containers even with an absolute HOME; previously `homedir()` did not throw.
- L-ydk80cmr (low): the new "without an injected fallback" test passes even if the default is reverted to `homedir()`, because the test process's real HOME is absolute (BDK-TQ-1).
- L-wmfm3hwc (low): the `raw` leaf is still spelled in suite.ts:78 and main.ts:53, and restated in the `seriesDir` doc comment (BDK-ARCH-5); L-7qqjll91 is half applied.
- L-glc4rqh8 (low): the new exports and changed fallback have no stated contract in plan 03-2, 03-4, 06, design.md or architecture.md, a sibling of the deferred L-x53cb90l.

None blocks; the two medium findings are worth fixing before merge because one makes the unit suite environment-dependent and the other can crash every command at import.

## Areas

- configuration: The cache directory fallback for an empty or relative HOME moved from $HOME to the password-database home; tools.test.ts still asserts the old fallback (L-sdsnz2m7) and the passwd lookup now runs eagerly and can throw (L-smihxpk1).
- public-api: paths.ts gained exported seriesDir and seriesNames and a fallbackHome parameter on cacheHome, shared by the runner, regrade and compare, without a plan contract (L-glc4rqh8).
