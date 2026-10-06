---
schema: 1
ticket: A-zeuuy6di
target: 02-2
role: simplifier
adapter: worker
attempt: 1
of: 3
scope: full
at: 2026-10-06T17:57:43.525Z
kernel-version: 2.7.0
template-hash: sha256:408e160c65e245e25df888f8762cc493740adb05879df4f609aa32a97caa42ec
report: .bdk/changes/2026-10-06-b1-repository-bootstrap-harness/reports/02-2-simplifier-A-zeuuy6di.md
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
  - BDK-JS-1
  - BDK-JS-2
  - BDK-JS-3
  - BDK-JS-4
  - BDK-JS-5
  - BDK-JS-6
  - BDK-JS-7
  - BDK-JS-8
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
# BDK dispatch package A-zeuuy6di

You are the `simplifier` of ticket A-zeuuy6di: attempt 1 of 3, scope `full`. Work from this package; read other state only through `bdk`.

## Change

B1 Repository bootstrap: harness extracted from BDK evals (https://github.com/broneq/bdk-bench/issues/1)

## Target 02-2

From `.bdk/changes/2026-10-06-b1-repository-bootstrap-harness/plan/parts/02-leaf-modules.md`:

### 02-2 Series plan, run variables and test expansion

Copy `series.ts` and `series.test.ts`. Names: `SERIES_ENV` = `"BENCH_SERIES"`; `RUN_VARS` = `{ item: "bench_item", run: "bench_run" }`. `CellPlan` becomes `WorkflowPlan { expectedPlugins: number; fixtureBase: string | null; provenance: WorkflowProvenance; settings }` where `WorkflowProvenance` is `{ fixtureCommit: string | null; benchCommit: string; adapter: { name: string; version: string } }` (no `variantHash`). `SeriesPlan.cells` becomes `workflows: Record<string, WorkflowPlan>`. `runPaths(plan, workflow, item, run)` keeps its layout `runs/<workflow>/<item>.run-<n>/{work,config-home}` and `debugDir/<workflow>/<item>.run-<n>.log`. `literalVar`, `varValue`, `expandTests`, `seriesStamp`, `freshSeriesName`, `writePlan`, `readPlan`, `EvalItem`, `TestCase` are unchanged.

**Files:**

- Create: `harness/series.ts`
- Create: `harness/series.test.ts`

**Test cases:**

- `expandTests` of 2 items and 3 runs gives 6 tests ordered run 1 item a, run 1 item b, run 2 item a, and each test's vars hold `bench_item` and `bench_run`
- a var value `{{ x }}` is wrapped as `{% raw %}{{ x }}{% endraw %}` and `varValue` returns the original text
- a value that contains `{% endraw %}` makes `literalVar` throw
- `runPaths` of two workflows or two runs of one item share no directory and no debug file
- `readPlan(undefined)` throws an error that names `BENCH_SERIES`
- `seriesStamp(new Date("2026-10-05T08:00:13Z"))` is `2026-10-05-080013`; `freshSeriesName("probe-x", taken)` gives `probe-x-2` when `probe-x` is taken

`do-not-touch`: `package.json`, `pnpm-lock.yaml`, `harness/hook.ts`, `harness/provider.ts`, `harness/cli.ts`.

## Ledger entries

No accepted decision or open blocker names this target.

Other entries of this target: 1 decision; read them with `bdk log list --for 02-2`.

## Role: simplifier

### Input

Your prompt or skill argument is the path of your dispatch package. Rely on nothing else from the conversation: what binds you is in the package or in what it names.

1. Read the package with `bdk dispatch show <path>`. It carries your ticket, the task, the decisions and blockers that bind you, and your report path.
2. Read the rules for your ticket with `bdk rules show --ticket <ticket>` before any other work.
3. Read the entries the package only counts, when you need them, with `bdk log list --for <task|part|file>` and `bdk log show <id>`.

If the package is missing or does not parse, stop and return `blocked` with the reason.

### Work

- Simplify the task's uncommitted diff: remove duplication, dead code and needless indirection, and make names and structure clearer.
- Keep behaviour unchanged: every test that passed before your change passes after it, and you add no feature and fix no bug. Log a `finding` for a bug you notice instead of fixing it.
- Change only the task's `Files:` and never a `do-not-touch` path. When a simplification needs another file, log a `finding` and leave it.
- When the diff is already simple, change nothing and say so in the report.
- When the package has a `Work root` section, every file you read or edit and every command you run, its checks included, stay inside that path; `bdk` commands stay as written, since the kernel finds the home checkout itself.
- Never change the project's tool configuration for `.bdk/` files, and never rewrite them with a formatter: log a `question` naming `/bdk:setup`.
- Leave your changes uncommitted; the orchestrator commits them.
- Never run git commands that discard work or rewrite history (stash, reset, clean, checkout or restore of paths, commit, rebase and the like), because other agents share this working tree; return `blocked` with the cause instead.

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
evidence: []
# reason: blocked and needs-context only
---
```

The kernel stamps your ticket and role, stores the report at the package's `report` path, and records the `simplify` evidence from it when the ticket closes. When `log ingest` exits non-zero, fix the field it names and call it again; never write the report file yourself.

Then return only the envelope, at most 15 lines, and the report path as the package names it.

## Rules

Run `bdk rules show --ticket A-zeuuy6di` before you start and follow the rules it prints.

## Return

Write your entries with `bdk log add <type> <summary> --ref <ref> --ticket A-zeuuy6di`: the summary is 1 to 120 characters (put detail in `--body`), the type is one of decision, finding, observation, blocker, question, assumption, risk, learning, report. Then pipe the full report to `bdk log ingest --ticket A-zeuuy6di` on stdin (`bdk log ingest --ticket A-zeuuy6di < <report-file>`; there is no frontmatter flag), the envelope (`status`, `files`, `entries`, `evidence`) as its frontmatter between two `---` lines. `entries` lists the ids `log add` printed. Leave `reason` out, except for `blocked` or `needs-context`. When it refuses, fix the named field and call it again. Return only the envelope and the report path `.bdk/changes/2026-10-06-b1-repository-bootstrap-harness/reports/02-2-simplifier-A-zeuuy6di.md`.
