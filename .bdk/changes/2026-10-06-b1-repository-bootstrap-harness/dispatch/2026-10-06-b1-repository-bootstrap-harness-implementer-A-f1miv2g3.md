---
schema: 1
ticket: A-f1miv2g3
target: 2026-10-06-b1-repository-bootstrap-harness
role: implementer
adapter: worker
attempt: 1
of: 2
scope: full
at: 2026-10-06T21:33:10.503Z
kernel-version: 2.7.0
template-hash: sha256:a46392ab75b1acd8707ac18ada462d340a990f8e0f344833810fc622886b1f90
report: .bdk/changes/2026-10-06-b1-repository-bootstrap-harness/reports/2026-10-06-b1-repository-bootstrap-harness-implementer-A-f1miv2g3.md
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

# BDK dispatch package A-f1miv2g3

You are the `implementer` of ticket A-f1miv2g3: attempt 1 of 2, scope `full`. Work from this package; read other state only through `bdk`.

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

### L-v6x9tm6a observation, proposed

README discard reasons list omits two harness discard causes

Refs: `README.md`

Problem: README.md Isolation (line 59) lists four discard reasons. harness/hook.ts also discards a run on "no reported cost" (ledger charges the run cap) and on "harness error: ...".

Why it matters: a reader seeing a discarded run with those reasons will not find them documented. Low impact; the plan only asks for "discard reasons".

Suggested fix: add the two causes to the sentence, or say "for example".

Triaged as should-fix at 2026-10-06T21:31:06.955Z

Decided fix at 2026-10-06T21:33:03.244Z

### L-2jjmnq7b finding, proposed

Results-file layout <results>/<suite>/<series>.jsonl now derived in 3 places: suite.ts, paths.resultsFile, compare.ts

Refs: `harness/suites/smoke/suite.ts`, `harness/paths.ts`, `harness/compare.ts`, `BDK-ARCH-5`

Problem: Severity low, not blocking. The fix for the series-name collision check (L-gwgg8qti family) replaced the smoke runner's use of `paths.resultsFile` with a local closure `join(dirs.resultsDir, SUITE, `${name}.jsonl`)` (harness/suites/smoke/suite.ts:156). The writer of a series' rows (the plan's `resultsFile`, suite.ts:176) and the reader that re-grades it (`resultsFile(suite, series)` in harness/main.ts:54, defined at harness/paths.ts:58-60) now derive the same path independently, and compare.ts:86-89 spells it a third time from `join(ROOT_DIR, "results")`. `paths.resultsFile` takes the repository root, while the suite only knows `resultsDir`, which is why the fix could not reuse it.

Why it matters: `regrade` and `report` find a series only if their path agrees with the runner's. Changing the layout in one place (e.g. a per-task subdirectory for B3) leaves regrade or compare reading a file that never gets written, with an exit 2 "no rows" rather than a type or test failure (BDK-ARCH-5). No test spans runner and regrade on one results directory.

Suggested fix: Make `paths.resultsFile(resultsDir, suite, series)` take the results directory and use it in suite.ts (both the collision check and the plan), in main.ts for regrade, and in compare.ts; keep `RESULTS_DIR = join(ROOT_DIR, "results")` in paths.ts as the one default.

Triaged as should-fix at 2026-10-06T21:31:07.052Z

Decided fix at 2026-10-06T21:33:03.822Z

### L-bqedx5xr finding, proposed

cacheHome treats an empty XDG_CACHE_HOME or HOME as set: sandbox and promptfoo DB become cwd-relative

Refs: `harness/paths.ts`, `harness/tools.ts`, `configuration`

Problem: Severity low, not blocking. `cacheHome` (harness/paths.ts:17-19), now the single source of the cache location for both `SANDBOX_DIR` and `promptfooEnv`, uses `??`, so `XDG_CACHE_HOME=""` (or `HOME=""` without XDG) yields `""` or `.cache`, a relative path. Probed: with `XDG_CACHE_HOME=""` the promptfoo config dir is `bdk-bench/promptfoo`, resolved against the promptfoo child's cwd, which is the repository root (tools.ts:42); the sandbox becomes relative to the shell's cwd and `sandboxOf` only refuses it when that cwd is inside the repository. The XDG Base Directory spec says an empty or relative value must be ignored.

Why it matters: The design requires the sandbox and the promptfoo database to live outside the repository (architecture.md "Isolation"). An empty variable, common in CI or `env -i` style launches, would put the promptfoo database under the repository, where the next measured series then fails `assertCommitted` on an untracked `bdk-bench/` directory, or would give sessions relative working directories.

Suggested fix: In `cacheHome`, ignore a value that is empty or not absolute (`isAbsolute(env.XDG_CACHE_HOME ?? "")`), same for HOME, falling back to `homedir()`; add the empty-string case to paths.test.ts.

Triaged as should-fix at 2026-10-06T21:31:06.862Z

Decided fix at 2026-10-06T21:33:02.868Z

Other entries of this target: 4 report, 1 finding; read them with `bdk log list --for 2026-10-06-b1-repository-bootstrap-harness`.

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

Run `bdk rules show --ticket A-f1miv2g3` before you start and follow the rules it prints.

## Return

Write your entries with `bdk log add <type> <summary> --ref <ref> --ticket A-f1miv2g3`: the summary is 1 to 120 characters (put detail in `--body`), the type is one of decision, finding, observation, blocker, question, assumption, risk, learning, report. Then pipe the full report to `bdk log ingest --ticket A-f1miv2g3` on stdin (`bdk log ingest --ticket A-f1miv2g3 < <report-file>`; there is no frontmatter flag), the envelope (`status`, `files`, `entries`, `evidence`) as its frontmatter between two `---` lines. `entries` lists the ids `log add` printed. Leave `reason` out, except for `blocked` or `needs-context`. When it refuses, fix the named field and call it again. Return only the envelope and the report path `.bdk/changes/2026-10-06-b1-repository-bootstrap-harness/reports/2026-10-06-b1-repository-bootstrap-harness-implementer-A-f1miv2g3.md`.
