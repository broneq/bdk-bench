---
schema: 1
id: "03"
title: Fixture cache, locations, committed-tree check and pinned tool calls
goal: The pinned fixture is prepared and cached, run directories are located outside the repository, and promptfoo is called from the root package.
success-measure: "`npx vitest run harness/fixture.test.ts harness/paths.test.ts harness/tree.test.ts harness/tools.test.ts` passes and `npx eslint` on the four modules is clean."
do-not-touch: ["package.json", "pnpm-lock.yaml", "harness/hook.ts", "harness/provider.ts", "harness/cli.ts"]
depends-on: ["01"]
spec-impact: [bench-runner]
---

Source: `git -C /Users/broneq/projects/bdk show 825455dd:evals/harness/<name>.ts` and `<name>.test.ts`. Copy rules for every task here: remove references to BDK design documents from comments (`design D-n`, `T40`, `T43`, `openspec/`) and keep the explanation; rename `cell` to `workflow`; replace "BDK" in comments and test titles by "the bench"; `pnpm eval` becomes `pnpm bench`.

## 03-1 Fixture preparation and copy

Copy `fixture.ts` and `fixture.test.ts`. Changes: marker file `.bench-base` (was `.bdk-eval-base`); `BASE_FORMAT` becomes 3 so older caches rebuild; git identity `Bench` and `bench@bench.invalid` in `prepareFixture` and `emptyBase`; remove the comment about the BDK repository's licence and the one about the v2 executor and keep the branch `main` beside `feat/eval`. `STRIPPED` stays `.claude`, `.agents`, `CLAUDE.md`, `AGENTS.md`. Exports and signatures unchanged: `FixturePin`, `FixtureMismatch`, `prepareFixture(pin, cacheDir, options)`, `emptyBase`, `freshCopy`, `npmCi`.

**Files:**

- Create: `harness/fixture.ts`
- Create: `harness/fixture.test.ts`

**Test cases:**

- `prepareFixture` of a local upstream with `.claude/`, `.agents/`, `CLAUDE.md`, `AGENTS.md` and `src/` returns a base on branch `feat/eval` that lacks the first four and keeps `src/`, with `main` at the same commit and the identity `bench@bench.invalid`
- the base holds `.bench-base` listing the commit, and `git status` of the base does not show it (it is excluded)
- a second call for the same commit returns the same directory and does not call `install` again
- a pin whose commit differs from the fetched HEAD throws `FixtureMismatch` and the message contains both commits
- `freshCopy` removes commits and files an earlier run left in the target
- `npmCi` runs with no `npm_config_*` variable in its environment

## 03-2 Locations and series sandbox

Copy `paths.ts` and `paths.test.ts`. Exports: `ROOT_DIR` (the directory above `harness/`), `RUNS_DIR` (`<root>/.runs`), `LEDGER_FILE` (`<root>/.runs/budget.json`), `SANDBOX_DIR` (`${XDG_CACHE_HOME or ~/.cache}/bdk-bench`), `sandboxOf(suite, series, root = SANDBOX_DIR, repoRoot = ROOT_DIR)`, `Versions` (`{ fixture: FixturePin }`), `readVersions(file = <root>/versions.json)`, `resultsFile(suite, series, root = ROOT_DIR)` = `<root>/results/<suite>/<series>.jsonl`. Remove `EVALS_DIR`, `REPO_ROOT`, `BUNDLE`. The sandbox name is `<basename of repoRoot>-<first 8 hex of sha256 of repoRoot>` and the in-repository refusal message says `the bench sandbox ... lies inside the repository`.

**Files:**

- Create: `harness/paths.ts`
- Create: `harness/paths.test.ts`

**Test cases:**

- `sandboxOf("smoke", "s1", "/c", "/r/bdk-bench")` starts with `/c/bdk-bench-` and ends with `/smoke/s1`
- two repository roots with the same basename give different sandboxes
- a sandbox root inside the repository root throws and the message contains `inside the repository`
- `resultsFile("smoke", "s1", "/x")` is `/x/results/smoke/s1.jsonl`
- `readVersions` of a file with `{"fixture":{"repository":"r","commit":"c"}}` returns that fixture

## 03-3 Committed-tree check

Copy `tree.ts` and `tree.test.ts`. `assertCommitted(repoRoot = ROOT_DIR)` throws when `git status --porcelain` reports a change outside `results/` and `.bdk/` (pathspec `:!results :!.bdk`); the message is `commit the working tree before a series; the rows record HEAD:` followed by the changed paths. `headCommit(repoRoot)` returns the full commit hash. Both import `ROOT_DIR` from `paths.ts`.

**Files:**

- Create: `harness/tree.ts`
- Create: `harness/tree.test.ts`

**Test cases:**

- a clean repository passes
- a new file `results/smoke/s1.jsonl` and a new file `.bdk/changes/x/design.md` pass
- a modified `README.md` throws and the message contains `README.md`
- an untracked `src/new.ts` throws and the message contains `src/new.ts`
- `headCommit` returns 40 hex characters equal to `git rev-parse HEAD`

## 03-4 Pinned promptfoo calls

Copy `tools.ts` and `tools.test.ts`. Remove `needsInstall` and `ensureTools` (the root package installs with `pnpm install`). `promptfooEnv(env)` returns `PROMPTFOO_DISABLE_TELEMETRY=1`, `PROMPTFOO_DISABLE_UPDATE=1` and `PROMPTFOO_CONFIG_DIR=<cache>/bdk-bench/promptfoo` where `<cache>` is `XDG_CACHE_HOME`, else `$HOME/.cache`. `validateConfig(rootDir, config)`, `evaluate(rootDir, config, output, env)` and `view(rootDir)` call `<rootDir>/node_modules/.bin/promptfoo` with the arguments of the source and `cwd` `rootDir` for `evaluate`.

**Files:**

- Create: `harness/tools.ts`
- Create: `harness/tools.test.ts`

**Test cases:**

- `promptfooEnv({ XDG_CACHE_HOME: "/c" }).PROMPTFOO_CONFIG_DIR` is `/c/bdk-bench/promptfoo`
- `promptfooEnv({ HOME: "/h" }).PROMPTFOO_CONFIG_DIR` is `/h/.cache/bdk-bench/promptfoo` and is not under `~/.promptfoo`
- the env sets telemetry and update checks off
