---
schema: 1
id: "07"
title: CI, README, CLAUDE.md and the formatted tree
goal: CI runs the model-free gate on every pull request, the README and CLAUDE.md describe the runner, and every checked-in file passes the project's own lint and format checks.
success-measure: "`pnpm lint`, `pnpm format:check`, `pnpm typecheck`, `pnpm test` and `pnpm bench check` all exit 0 in a clean clone after `pnpm install --frozen-lockfile`."
do-not-touch: ["harness/**", "package.json", "pnpm-lock.yaml", ".bdk/**"]
depends-on: ["06"]
spec-impact: [bench-runner]
---

## 07-1 CI workflow

Create `.github/workflows/ci.yml`: `name` `ci`; `on` `pull_request` and `push` to `main`; one job `check` on `ubuntu-latest` with `permissions: { contents: read }`. Steps in order: `actions/checkout@v7`; `pnpm/action-setup@v6` (version from `packageManager`); `actions/setup-node@v7` with `node-version-file: .nvmrc` and `cache: pnpm`; `pnpm install --frozen-lockfile`; `pnpm lint`; `pnpm format:check`; `pnpm typecheck`; `pnpm test`; `pnpm bench check`. No secret and no `ANTHROPIC_API_KEY` is referenced.

**Files:**

- Create: `.github/workflows/ci.yml`

**Test cases:**

- `npx prettier --check .github/workflows/ci.yml` exits 0
- `grep -n "run:" .github/workflows/ci.yml` lists, in order, `pnpm install --frozen-lockfile`, `pnpm lint`, `pnpm format:check`, `pnpm typecheck`, `pnpm test`, `pnpm bench check`, and the file has exactly one job
- `grep -ci secret .github/workflows/ci.yml` prints 0
- the pull request of this Change shows the `ci` check green (reported by the lead, not a unit test)

## 07-2 README

Rewrite the "Status" and add sections to `README.md`, keeping its intro, scoring and tasks sections: "Running" (commands from `pnpm bench` with a one-line meaning each: `smoke [--probe]`, `check`, `view`, `report <suite> --baseline <series> --candidate <series>`, `regrade <suite> --series <name>`, flags `--runs`, `--budget`, `--run-cap`, `--concurrency`, `--workflows`, `--items`), "Budget" (one ledger `.runs/budget.json`, caps 100 and 15 USD, run a probe first and approve its projection), "Viewer and results" (rows in `results/<suite>/<series>.jsonl`, promptfoo database under `${XDG_CACHE_HOME:-~/.cache}/bdk-bench/promptfoo`), "Isolation" (per-run working copy, config home and debug log in a sandbox outside the repository; discard reasons), and "Provider facts". Provider facts is the table of `evals/README.md` at `825455dd` (`git -C /Users/broneq/projects/bdk show 825455dd:evals/README.md`) reduced to the 13 rows that hold without a BDK plugin: SDK resolution (now from the root `node_modules`, configs rendered under `.runs/`), auth without an API key, cost of a run, sessions with background subagents (the patch), tools by default, subagent tool calls, per-run working directory, user configuration, promptfoo's model list, built-in plugins, per-run directory under concurrency, a `file://` provider's label, and the viewer. Rows about BDK plugin hooks, agents, skills, `Workflow`, `disable-model-invocation`, slash commands, the plugin skill scan and the v2 plugin are left out; a sentence in a kept row that names BDK is reworded to the bench or removed. Everything is English; no em dash.

**Files:**

- Modify: `README.md`

**Test cases:**

- `grep -n "evals/\|pnpm eval" README.md` prints nothing
- the Provider facts table has a header, a separator and 13 rows, and `grep -n "hooks.json\|bdk:" README.md` prints nothing
- `npx prettier --check README.md` exits 0
- every command listed under "Running" is accepted by `pnpm bench` (checked by running `pnpm bench <command>` with its arguments except the ones that need credentials: usage errors are fine, `unknown` errors are not)
- `grep -c "—" README.md` prints 0

## 07-3 CLAUDE.md layout and commands

In `CLAUDE.md`, update the "Layout" block for what B1 added (`harness/` with `suites/<name>/`, `patches/`, `versions.json`, `package.json` and the lockfile, `.github/workflows/ci.yml`) and replace the "Development commands" paragraph with the real commands: `pnpm install`, `pnpm bench ...`, `pnpm lint`, `pnpm format`, `pnpm format:check`, `pnpm typecheck`, `pnpm test`. Change nothing else; the sentence "Directories other than `checklist/` and `tasks/` are created by the issue that introduces them" stays.

**Files:**

- Modify: `CLAUDE.md`

**Test cases:**

- `git diff -U0 CLAUDE.md` shows only hunks whose changed lines lie between the `## Layout` heading and the next heading, or between the `## Development commands` heading and the end of the file
- `grep -c "—" CLAUDE.md` prints 0
- `npx prettier --check CLAUDE.md` exits 0
- every script named in the Development commands section exists in `package.json` `scripts`

## 07-4 Format the checked-in tree

Run `npx prettier --check .`. For each file it reports that was written before this Change (`checklist/*`, `tasks/*/task.yaml`, `tasks/*/checks.yaml`, `tasks/*/spec.md`), run `npx prettier --write <file>` and nothing else. No word, number, identifier or YAML key of a check or a spec changes: only whitespace, table alignment, quote style and line wrapping. Do not fix `pnpm lint` or `pnpm typecheck` findings here: they belong to the part that wrote the file, so return `blocked` naming the finding.

**Files:**

- Modify: `checklist/*.md`
- Modify: `checklist/*.yaml`
- Modify: `tasks/*/task.yaml`
- Modify: `tasks/*/checks.yaml`
- Modify: `tasks/*/spec.md`

**Test cases:**

- `pnpm format:check` exits 0
- for every modified file, `git diff --word-diff=porcelain --word-diff-regex='[[:alnum:]_.-]+' --ignore-all-space HEAD~1 -- <file>` shows no added or removed line (a word is a run of letters, digits, `_`, `.` or `-`, so quote style, table padding and wrapping do not count)
- `pnpm lint`, `pnpm typecheck` and `pnpm test` exit 0

**Stop rule:** stop and return `blocked` when formatting a file would change a word of a check or spec as defined above, or when a file only passes by being added to `.prettierignore`.
