---
schema: 1
ticket: A-z0lg1o5x
target: 04-1
role: simplifier
adapter: worker
attempt: 2
of: 3
scope: high+
at: 2026-10-06T18:11:59.589Z
kernel-version: 2.7.0
template-hash: sha256:408e160c65e245e25df888f8762cc493740adb05879df4f609aa32a97caa42ec
report: .bdk/changes/2026-10-06-b1-repository-bootstrap-harness/reports/04-1-simplifier-A-z0lg1o5x.md
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
# BDK dispatch package A-z0lg1o5x

You are the `simplifier` of ticket A-z0lg1o5x: attempt 2 of 3, scope `high+`. Work from this package; read other state only through `bdk`.

## Change

B1 Repository bootstrap: harness extracted from BDK evals (https://github.com/broneq/bdk-bench/issues/1)

## Target 04-1

From `.bdk/changes/2026-10-06-b1-repository-bootstrap-harness/plan/parts/04-run-lifecycle.md`:

### 04-1 Run lifecycle and the row

Copy `hook.ts` and `hook.test.ts`. Changes:

- `loadSuiteHooks(suite)` imports `./suites/<suite>/hooks.ts` (relative to `harness/`) and returns its `hooks` export.
- `Measurement` and `Measured` lose `templateHashes`; the row loses `variantHash` and `templateHashes`.
- The row's `provenance` is `{ models, fixtureCommit, benchCommit, adapter }`, the last three read from `context.workflow.provenance`.
- The harness records two metrics itself: `turns` = `metadata.numTurns` and `wall_s` = `metadata.wallMs / 1000`, each only when the session reported it (never 0 for a missing value). They are merged after the suite's metrics, so the harness values win. A discarded row's `metrics` holds only these two; a counted row's holds the suite's, the item assertions' and these two.
- `SeriesPlan` (`harness/series.ts`) gains `readonly ledgerFile: string` and `readonly budgetUsd: number`, as in the source; update `harness/series.test.ts` fixtures. `expandTests(items, runs)` and `TestCase` return to the form at `825455dd` (one test per item and run, no `providers`, no `workflowVars`), and tests; fixtures say `sandboxDir`, not `sandbox`.
- Everything else (budget stop before the run's directories are touched, run cap charged and run discarded without reported cost, no row and no charge for a budget stop, `judge.json` record, `measurement.json`) is unchanged.

**Files:**

- Create: `harness/hook.ts`
- Create: `harness/hook.test.ts`
- Modify: `harness/series.ts`
- Modify: `harness/series.test.ts`

**Test cases:**

- a counted run with `numTurns` 7, `wallMs` 12500 and suite metric `completed` 1 appends a row whose `metrics` equal `{ completed: 1, turns: 7, wall_s: 12.5 }`
- an isolation-discarded run with the same metadata appends a row with `discarded` set and `metrics` equal to `{ turns: 7, wall_s: 12.5 }`
- a session result without `numTurns` gives a row without the key `turns`
- the row has `workflow` equal to the run's workflow name, no `cell` key, and `provenance.adapter` equal to the workflow plan's adapter
- a suite metric `turns` of 99 is replaced by the harness value 7
- a ledger at the budget makes `startRun` throw `BudgetReached`; the run's directories stay untouched
- a provider error discards the run with `provider error:` and the message; a result without a reported cost is charged the run cap and discarded
- `extensionHook("beforeAll", ctx)` returns `ctx` unchanged

**Stop rule:** stop and return `blocked` if `RunContext` needs a field that `series.ts` does not provide.

`do-not-touch`: `package.json`, `pnpm-lock.yaml`, `harness/results.ts`, `harness/budget.ts`, `harness/cli.ts`, `harness/runner.ts`.

## Ledger entries

### L-fgzdjjq2 blocker, proposed

SeriesPlan lacks ledgerFile and budgetUsd that startRun/afterRun need

Refs: `harness/series.ts`, `04-1`

04-1 stop rule. harness/series.ts SeriesPlan has suite, series, runCapUsd, resultsFile, rawDir, sandboxDir, debugDir, workflows. The copied startRun calls assertCanStart(readLedger(plan.ledgerFile), plan.budgetUsd) and afterRun records to plan.ledgerFile; neither field exists, and series.ts is do-not-touch. Fix: add `ledgerFile` and `budgetUsd` to SeriesPlan in part 03 (and series.test.ts), or state where hook.ts gets them. hook.ts and hook.test.ts not written.

Other entries of this target: 1 decision, 1 blocker, 3 finding; read them with `bdk log list --for 04-1`.

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

Run `bdk rules show --ticket A-z0lg1o5x` before you start and follow the rules it prints.

## Return

Write your entries with `bdk log add <type> <summary> --ref <ref> --ticket A-z0lg1o5x`: the summary is 1 to 120 characters (put detail in `--body`), the type is one of decision, finding, observation, blocker, question, assumption, risk, learning, report. Then pipe the full report to `bdk log ingest --ticket A-z0lg1o5x` on stdin (`bdk log ingest --ticket A-z0lg1o5x < <report-file>`; there is no frontmatter flag), the envelope (`status`, `files`, `entries`, `evidence`) as its frontmatter between two `---` lines. `entries` lists the ids `log add` printed. Leave `reason` out, except for `blocked` or `needs-context`. When it refuses, fix the named field and call it again. Return only the envelope and the report path `.bdk/changes/2026-10-06-b1-repository-bootstrap-harness/reports/04-1-simplifier-A-z0lg1o5x.md`.
