---
schema: 1
ticket: A-kuit02bz
target: 2026-10-06-b1-repository-bootstrap-harness
role: implementer
adapter: worker
attempt: 1
of: 2
scope: full
at: 2026-10-07T02:45:47.177Z
kernel-version: 2.7.0
template-hash: sha256:a46392ab75b1acd8707ac18ada462d340a990f8e0f344833810fc622886b1f90
report: .bdk/changes/2026-10-06-b1-repository-bootstrap-harness/reports/2026-10-06-b1-repository-bootstrap-harness-implementer-A-kuit02bz.md
rules:
  - BDK-ARCH-1
  - BDK-ARCH-2
  - BDK-ARCH-3
  - BDK-ARCH-4
  - BDK-ARCH-5
  - BDK-CQ-1
  - BDK-CQ-2
  - BDK-CQ-3
  - BDK-CQ-4
  - BDK-CQ-5
  - BDK-CQ-6
  - BDK-CQ-7
  - BDK-CQ-8
  - BDK-DP-1
  - BDK-DP-2
  - BDK-DP-3
  - BDK-DP-4
  - BDK-DP-5
  - BDK-DP-6
  - BDK-DP-7
  - BDK-DP-8
  - BDK-DP-9
  - BDK-DP-10
  - BDK-DP-11
  - BDK-SEC-1
  - BDK-SEC-2
  - BDK-SEC-3
  - BDK-SEC-4
  - BDK-SEC-5
  - BDK-SEC-6
  - BDK-SEC-7
  - BDK-SEC-8
  - BDK-SEC-9
  - BDK-TQ-1
  - BDK-TQ-2
  - BDK-TQ-3
  - BDK-TQ-4
  - BDK-TQ-5
  - BDK-TQ-6
  - BDK-TQ-7
  - BDK-TQ-8
  - BDK-TQ-9
  - BDK-TQ-10
  - BDK-TQ-11
---

# BDK dispatch package A-kuit02bz

You are the `implementer` of ticket A-kuit02bz: attempt 1 of 2, scope `full`. Work from this package; read other state only through `bdk`.

## Change

B1 Repository bootstrap: harness extracted from BDK evals (https://github.com/broneq/bdk-bench/issues/1)

## Target 2026-10-06-b1-repository-bootstrap-harness

Read:

- `.bdk/changes/2026-10-06-b1-repository-bootstrap-harness/change.md`
- `.bdk/changes/2026-10-06-b1-repository-bootstrap-harness/plan/parts/01-tooling.md`
- `.bdk/changes/2026-10-06-b1-repository-bootstrap-harness/plan/parts/02-leaf-modules.md`
- `.bdk/changes/2026-10-06-b1-repository-bootstrap-harness/plan/parts/03-fixture-paths-tools.md`
- `.bdk/changes/2026-10-06-b1-repository-bootstrap-harness/plan/parts/04-run-lifecycle.md`
- `.bdk/changes/2026-10-06-b1-repository-bootstrap-harness/plan/parts/05-commands.md`
- `.bdk/changes/2026-10-06-b1-repository-bootstrap-harness/plan/parts/06-smoke-suite-and-entry.md`
- `.bdk/changes/2026-10-06-b1-repository-bootstrap-harness/plan/parts/07-ci-docs-format.md`

## Craft

Before your first edit, print each craft skill below with its command and follow it while you work:

- `tdd`: `bdk ctx craft tdd`

## Ledger entries

### L-bndhs6ue finding, proposed

cacheHome HOME fallback is ineffective: os.homedir() returns the same empty or relative $HOME

Refs: `harness/paths.ts`, `harness/paths.test.ts`, `L-bqedx5xr`, `configuration`, `BDK-TQ-1`

Problem: Severity medium, not blocking. The fix for L-bqedx5xr (harness/paths.ts:18-23) falls back to `homedir()` when `HOME` is empty or relative, but on POSIX Node's `os.homedir()` returns `$HOME` itself when it is set. Probed on Node v24.21.0: `HOME= node -e 'os.homedir()'` gives `""` and `HOME=rel` gives `"rel"`; with XDG_CACHE_HOME unset, `HOME=` makes `SANDBOX_DIR` `.cache/bdk-bench` and `HOME=rel` makes it `rel/.cache/bdk-bench`, both relative, exactly the case the finding asked to close. Only the XDG_CACHE_HOME half of the fix works. The new tests at harness/paths.test.ts:46-47 expect `join(homedir(), ".cache")` while the test process has a real HOME, so they pass and cannot fail for the production path, where `env` and `homedir()` read the same `process.env.HOME` (BDK-TQ-1).

Why it matters: `promptfooEnv` (harness/tools.ts:23) then sets PROMPTFOO_CONFIG_DIR to a relative path resolved against the promptfoo child's cwd, the repository root, so the database lands inside the repository, which architecture.md "Isolation" forbids and which then trips `assertCommitted` on the next measured series. The sandbox is refused by `sandboxOf` only when the shell cwd is inside the repository. The `configuration` risk area (environment variables) is touched and the fix reads as done while it is not.

Suggested fix: Fall back to `os.userInfo().homedir` (read from the password database, it ignores $HOME; probed: `HOME= node -e 'os.userInfo().homedir'` gives `/Users/broneq`), or reject a non-absolute result and throw. Make the test independent of the test process's HOME, e.g. assert that `cacheHome({ HOME: "" })` and `cacheHome({ HOME: "rel" })` are absolute, and inject the fallback if needed to test it deterministically.

Triaged as should-fix at 2026-10-06T21:40:36.881Z

Decided fix at 2026-10-07T02:45:44.377Z

### L-7qqjll91 finding, proposed

Raw dir of a series still derived twice (smoke suite and main.ts regrade), sibling of L-2jjmnq7b

Refs: `harness/main.ts`, `harness/suites/smoke/suite.ts`, `harness/compare.ts`, `L-2jjmnq7b`, `BDK-ARCH-5`

Problem: Severity low, not blocking. The fix for L-2jjmnq7b unified the results-file path behind `paths.resultsFile` and `RESULTS_DIR`, but the same runner-to-regrade seam has a second path: the smoke runner writes raw records under `join(dirs.runsDir, "series", SUITE, series)` + `"raw"` (harness/suites/smoke/suite.ts:163 and :77), while `bench regrade` reads `judge.json` from `join(RUNS_DIR, "series", suite, series, "raw")` (harness/main.ts:53), spelled independently. compare.ts:96-98 also still re-encodes the `.jsonl` suffix to list a suite's series, the inverse of `resultsFile`.

Why it matters: Same drift risk the accepted fix addressed (BDK-ARCH-5): a layout change in the runner leaves regrade looking for `judge.json` where none is written. It fails loudly (exit 2, "no raw records ... <path>", harness/regrade.ts:69-74), so the damage is a confusing error, not wrong scores.

Suggested fix: Add `seriesDir(runsDir, suite, series)` (and use `join(seriesDir, "raw")`) to paths.ts next to `resultsFile`, and use it in suite.ts and main.ts; optionally a `seriesNames(resultsDir, suite)` beside `resultsFile` for compare.ts's listing.

Triaged as should-fix at 2026-10-06T21:40:36.965Z

Decided fix at 2026-10-07T02:45:44.456Z

Other entries of this target: 5 report, 1 finding; read them with `bdk log list --for 2026-10-06-b1-repository-bootstrap-harness`.

## Role: implementer

### Input

Your prompt or skill argument is the path of your dispatch package. Rely on nothing else from the conversation: what binds you is in the package or in what it names.

1. Read the package with `bdk dispatch show <path>`. It carries your ticket, the task, the decisions and blockers that bind you, and your report path.
2. Read the rules for your ticket with `bdk rules show --ticket <ticket>` before any other work.
3. Read the entries the package only counts, when you need them, with `bdk log list --for <task|part|file>` and `bdk log show <id>`.

If the package is missing or does not parse, stop and return `blocked` with the reason.

### Work

- Build the task test-first: a failing test for each behaviour the task names, then the code, then the scoped checks the package lists.
- Before your first edit, print each skill of the package's `Craft` section with `bdk ctx craft <name>` and follow it within this contract.
- Change only the task's `Files:` and never a `do-not-touch` path. When another file must change, log a `finding` and name it in the report.
- When the task's `stop-rule` fires, stop and return `blocked` naming it.
- On a `review-fix` ticket the package embeds the round's blocking entries instead of a task: fix each one, name each fixed entry by id in your report, and resolve none; the orchestrator does after the commit.
- Log a `decision` for a choice the package leaves open and an `assumption` for what you could not verify.
- When the package has a `Work root` section, every file you read or edit and every command you run, its checks included, stay inside that path; `bdk` commands stay as written, since the kernel finds the home checkout itself.
- When the package has a `Conflict` section, edit only its paths and follow its instruction, leave staging and the merge commit to the kernel, and return `blocked` naming the paths the instruction does not settle.
- Never change the project's tool configuration for `.bdk/` files, and never rewrite them with a formatter: log a `question` naming `/bdk:setup`.
- Leave your changes uncommitted for the orchestrator, and never run git commands that discard work or rewrite history (stash, reset, clean, checkout or restore of paths, commit, rebase and the like), because other agents share this working tree; return `blocked` with the cause instead.

### Ledger

Record what others need when you know it, each entry with a ref: `bdk log add <type> "<summary>" --ref <file|task|id> --ticket <ticket>`; summary at most 120 characters, details via `--body -`.

When a rule forced a decision or a finding breaks one, cite its rule id exactly as `bdk rules show --ticket` prints it (`BDK-CQ-4`, `API-2`): as a `--ref <id>` of the entry and by id in your report.

### Messages

A `SendMessage` carries a ledger id and one sentence, never the content; write the entry first. An entry that affects the rest of the part goes to your parent, the `BDK-PARENT` line of your start context; one that must stop other work goes to `main`; one that affects particular running agents goes to the ids `bdk agents list --affected-by <entry>` returns, your own id left out. On a message to you, read the named entry with `bdk log show <id>`, then continue, adapt your work within your package, or return `blocked` with the entry id.

### Output

Pipe the full report to `bdk log ingest --ticket <ticket>` with this envelope as its frontmatter, each list `[]` when empty:

```
---
status: done | done-with-concerns | needs-context | blocked
files: [<paths you changed>]
entries: [<ledger ids you wrote>]
evidence: [<evidence ids>]
# reason: blocked and needs-context only
---
```

The kernel stamps your ticket and role and stores the report at the package's `report` path. When `log ingest` exits non-zero, fix the field it names and call it again; never write the report file yourself.

Then return only the envelope, at most 15 lines, and the report path as the package names it.

## Rules

Run `bdk rules show --ticket A-kuit02bz` before you start and follow the rules it prints.

## Return

Write your entries with `bdk log add <type> <summary> --ref <ref> --ticket A-kuit02bz`: the summary is 1 to 120 characters (put detail in `--body`), the type is one of decision, finding, observation, blocker, question, assumption, risk, learning, report. Then pipe the full report to `bdk log ingest --ticket A-kuit02bz` on stdin (`bdk log ingest --ticket A-kuit02bz < <report-file>`; there is no frontmatter flag), the envelope (`status`, `files`, `entries`, `evidence`) as its frontmatter between two `---` lines. `entries` lists the ids `log add` printed. Leave `reason` out, except for `blocked` or `needs-context`. When it refuses, fix the named field and call it again. Return only the envelope and the report path `.bdk/changes/2026-10-06-b1-repository-bootstrap-harness/reports/2026-10-06-b1-repository-bootstrap-harness-implementer-A-kuit02bz.md`.
