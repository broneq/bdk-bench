---
schema: 1
ticket: A-eq1itdbh
role: integration-reviewer
at: 2026-10-06T21:30:52.448Z
group: integration
status: done-with-concerns
files: []
entries: [L-2jjmnq7b, L-bqedx5xr, L-s5eft5my, L-lqqb6y5j]
evidence: [E-65lztrz2, E-kypyz2ui]
---

# Integration review A-eq1itdbh@integration

Range a5320b6..57b47df: the review-fix round for 16 decided entries (implementer report A-eq1itdbh). Code changes touch 18 files (harness modules and tests, README.md, CLAUDE.md); everything else is `.bdk/` kernel state. Every changed non-`.bdk` file is declared in a plan part's Files. Runner evidence E-65lztrz2 (175 tests pass) and E-kypyz2ui (eslint, prettier, tsc clean) covers the head commit.

## What holds

- Provider -> hook seam: `extensionHook` reads `metadata.benchWorkflow`, falling back to the promptfoo `label` that providers.ts sets to the workflow name; provider.ts sets `benchWorkflow` on every response path (lines 83, 87, 103). The two new hook tests drive the real plan file through `SERIES_ENV` and assert the appended row, so the seam is covered end to end.
- Regrade: all saved judgements and their judges are resolved before the first judge call (unknown judge now also exits 2 early), and rows plus `judge.json` are written only after every call succeeded; the ledger still records each paid call. This matches the spec delta ("refusing before the first judge call") and design.md:88 ("never stops halfway"). Row identity in the `Map` is safe because `counted` filters the same objects `readRows` returned.
- Smoke runner: the collision check and the plan now use the same `dirs.resultsDir`, `versions.json` comes from `dirs.rootDir`, and the probe projection test pins "6.25 USD for 5 runs" through `probeSummary` -> `projection`, so the rename perCell -> perWorkflow is exercised across budget, runner and suite.
- Committed-tree check: `--untracked-files=all` lists the offending file, not its directory, matching the spec delta scenario "it refuses and names the file". Tests now use mkdtemp with cleanup.
- Sandbox check: `sep`-aware `..` test fixes the false refusal of a `..cache` sibling and keeps refusing in-repo paths; no cycle from the new `tools -> paths` import.
- README example row denominators (20/11/12/11 = 54) agree with tasks/users-csv/task.yaml.

## What does not hold (all low, none blocking)

- L-2jjmnq7b: the results-file layout is now derived independently by the runner (suite.ts:156), regrade (paths.resultsFile via main.ts:54) and compare (compare.ts:86-89); a layout change in one place silently breaks the others (BDK-ARCH-5).
- L-bqedx5xr: `cacheHome` keeps an empty `XDG_CACHE_HOME`/`HOME`, so the promptfoo database lands inside the repository (cwd = root) and the sandbox becomes cwd-relative; probed with node.
- L-s5eft5my (public-api): `projection` key renamed, new exports `cacheHome` and `DEFAULT_CONCURRENCY`; plan 02-leaf-modules.md:16,29 still states `perCell` (L-hv0pk3fy, now real) and 03:34 omits `cacheHome`.
- L-lqqb6y5j (configuration): cache resolution and `check()` defaults changed with values unchanged; architecture.md lacks the new `tools -> paths` and `suites -> cli` value edges (BDK-ARCH-1), and run defaults now live in two modules.

## Not touched

auth, secrets, migration (row and judge.json formats unchanged; only regrade's write order changed), dependencies (no manifest or lockfile change).

## Areas

- public-api: projection() now returns perWorkflow instead of perCell; paths exports cacheHome, cli exports DEFAULT_CONCURRENCY; assertCommitted names each untracked file by bare path. All in-repo consumers updated; plan text still says perCell.
- configuration: promptfoo config dir and sandbox resolve through one cacheHome (HOME unset now falls back to the home directory); bench check uses the shared defaults; CLAUDE.md's CI line names bench check as ci.yml runs it.
