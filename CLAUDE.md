# bdk-bench

Benchmark of AI coding workflows (plain Claude Code, BDK, OpenSpec, ...). Each workflow gets the same short request in a fresh copy of a pinned fixture repository, runs to completion without a human, and is scored against a fixed checklist, next to its cost and wall time. README.md states the goal for readers; this file states how to work here.

## Layout

```
checklist/     - schema.md (check format, groups, scoring, neutrality rules), quality.yaml, tests.yaml and process.yaml (shared checks), skipped-rules.md
tasks/<id>/    - task.yaml (id, prompt, area, shared checks that apply), spec.md (hidden product spec), checks.yaml (functional checks), hidden/ (hidden tests), reference/ (a solution that passes every check)
harness/       - runner: per-run working copies, workflow sessions, grader, ledger, promptfoo configs (B1, B3); unit tests sit next to the modules
harness/suites/<name>/ - one benchmark suite per directory (e.g. `smoke`): its items, workflows and run description
patches/       - pnpm patches applied to dependencies (promptfoo)
versions.json  - pinned versions of the tools the harness drives
package.json, pnpm-lock.yaml - scripts and exact dependency versions
.github/workflows/ci.yml - CI: lint, format check, typecheck, unit tests, bench check
adapters/      - one per workflow: version, install, prompt template, end of run (B7)
results/       - committed result rows and reports, one file per series
.runs/         - local run state (gitignored): budget ledger, raw session output, debug logs, judge prompts
```

Directories other than `checklist/` and `tasks/` are created by the issue that introduces them.

## Neutrality

The benchmark compares workflows, one of which (BDK) is maintained by the same author. Results are only worth something if the setup does not favour it.

- No check may reward a workflow's own files, process or vocabulary (`.bdk/`, `openspec/`, "Change", "ledger", ...). A check is decided by the repository state against the base commit and by the final reply only.
- Checks are written before any run is seen and are not changed to fit a result. A check found to be wrong is fixed in its own commit that states why, and every affected series is re-graded (never re-run selectively).
- Every workflow gets the same fixture commit, orchestrator model, budget cap, run cap, simulated user and hidden spec. Only the adapter differs, and each row records the adapter's name and version.
- Hidden tests and specs are never visible to a session: they are copied into the working copy only after the session ended.

## Checklist

`checklist/schema.md` is the format. Every check is binary and names how it is verified: `test` (a hidden behavioural test that finds controls by role and accessible name, never by names the agent chooses), `command` (a shell command and its pass condition) or `judge` (an exact yes/no question and the evidence it reads). Use `judge` only where a test or a command cannot decide. Scores are reported per group (`functional`, `quality`, `tests`, `process`) and in total, never only as a total.

A task is ready to run when its reference solution passes every check and the bare fixture fails every functional check.

## Cost

Every session costs real money (a BDK run on a task: about 10-15 USD and 30-45 minutes; a plain run: about 1 USD and 3 minutes, measured in `broneq/bdk` T43).

- Run a probe (one run per workflow and task) and present its projected cost before any series; start the series only after the projection is approved.
- One run per workflow and task by default. Repeat runs only where two workflows are within a few checks of each other.
- The ledger caps the total spend and each run; never raise a cap without approval.

## Origin

The harness comes from `broneq/bdk` (`evals/harness/`, T40 and T43): the Agent SDK provider with a working copy, config home and debug log per run, parallel runs, the budget ledger, the promptfoo viewer, series comparison and re-grade. Its README's "Provider facts" table records what was probed and why the harness works the way it does; read it before changing how sessions run. Copy and simplify; do not import from the BDK repository.

## Work tracking

- Plan: the issues `B1`-`B8` of this repository, on the board https://github.com/users/broneq/projects/1 with Phase "7 Benchmarks" and "blocked by" links for dependencies. Pick an issue whose blockers are closed; set its Status to In Progress when starting.
- Branch `bNN-<slug>` from `main`, PR into `main` with `Closes #<issue>`, then set the card to Done.
- A new piece of work gets its own issue with Goal, Scope, Input, Acceptance signal and Dependencies, added to the board with Phase "7 Benchmarks".

## Language

Everything written into this repository is in English: code, comments, docs, checks, specs, commit messages, issues and PRs. When the user writes in another language, reply in that language, but write files in English. Never use the em dash; use a plain hyphen.

## Development commands

Node from `.nvmrc`, packages with pnpm.

- `pnpm install` - install the pinned dependencies
- `pnpm bench <suite> [--probe] [--runs N] [--budget USD] [--run-cap USD] [--concurrency N] [--workflows a,b] [--items x,y]` - run a suite; also `pnpm bench check`, `pnpm bench view`, `pnpm bench report <suite> --baseline <series> --candidate <series>` and `pnpm bench regrade <suite> --series <name>`
- `pnpm lint` - eslint, no warnings allowed
- `pnpm format` - prettier, rewrite files
- `pnpm format:check` - prettier, check only
- `pnpm typecheck` - tsc without emit
- `pnpm test` - vitest unit tests
